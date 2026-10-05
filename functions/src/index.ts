import { getAuth } from 'firebase-admin/auth'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, type QueryDocumentSnapshot, type Timestamp } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()

export const approveWorkOrder = onCall({ region: 'us-central1' }, async (request) => {
  const familyId = parentFamilyId(request.auth)
  const workOrderId = readId(request.data?.workOrderId)
  if (!workOrderId) throw new HttpsError('invalid-argument', 'Choose a work order.')

  const family = db.collection('families').doc(familyId)
  const orderRef = family.collection('workOrders').doc(workOrderId)
  const ledgerRef = family.collection('ledgerTransactions').doc()

  const failure = await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef)
    if (!orderSnap.exists) return { code: 'not-found' as const, message: 'That work order is not in the family.' }
    const order = orderSnap.data() ?? {}
    if (order.status !== 'pending_review') return { code: 'failed-precondition' as const, message: 'That work order is not waiting for review.' }

    const memberId = readId(order.assignedTo)
    const stars = readInt(order.pointValue)
    const title = typeof order.title === 'string' ? order.title : ''
    if (!memberId || stars === null || stars < 0 || stars > 500 || title.length === 0) {
      return { code: 'failed-precondition' as const, message: 'That work order cannot be approved.' }
    }

    const memberRef = family.collection('members').doc(memberId)
    const memberSnap = await tx.get(memberRef)
    if (!memberSnap.exists) return { code: 'not-found' as const, message: 'That child is not in the family.' }
    const member = memberSnap.data() ?? {}
    if (member.role !== 'child') return { code: 'permission-denied' as const, message: 'Stars can only be paid to a child.' }

    const balance = readBalance(member.balance)
    const split = splitStars(stars, member.allocationConfig)
    tx.update(orderRef, { status: 'completed' })
    tx.update(memberRef, {
      balance: {
        total: balance.total + stars,
        spend: balance.spend + split.spend,
        save: balance.save + split.save,
        give: balance.give + split.give,
      },
    })
    tx.set(ledgerRef, {
      childId: memberId,
      type: 'credit',
      totalAmount: stars,
      breakdown: split,
      source: 'work_order',
      referenceId: workOrderId,
      memo: `Payout for: ${title}`.slice(0, 120),
      createdAt: FieldValue.serverTimestamp(),
    })
    return null
  })

  if (failure) throw new HttpsError(failure.code, failure.message)
  return { workOrderId }
})

export const redeemStoreItem = onCall({ region: 'us-central1' }, async (request) => {
  const familyId = parentFamilyId(request.auth)

  const memberId = readId(request.data?.memberId)
  const itemId = readId(request.data?.itemId)
  if (!memberId || !itemId) throw new HttpsError('invalid-argument', 'Choose a store item.')

  const family = db.collection('families').doc(familyId)
  const memberRef = family.collection('members').doc(memberId)
  const itemRef = family.collection('storeItems').doc(itemId)
  const orderRef = family.collection('purchaseOrders').doc()
  const ledgerRef = family.collection('ledgerTransactions').doc()

  const failure = await db.runTransaction(async (tx) => {
    const [memberSnap, itemSnap, orders] = await Promise.all([
      tx.get(memberRef),
      tx.get(itemRef),
      tx.get(family.collection('purchaseOrders').where('childId', '==', memberId)),
    ])

    if (!memberSnap.exists) return { code: 'not-found' as const, message: 'That child is not in the family.' }
    if (!itemSnap.exists) return { code: 'not-found' as const, message: 'That store item is not available.' }

    const member = memberSnap.data() ?? {}
    const item = itemSnap.data() ?? {}
    if (member.role !== 'child') return { code: 'permission-denied' as const, message: 'Only a child can redeem.' }
    if (item.active !== true) return { code: 'failed-precondition' as const, message: 'That item is not active.' }

    const cost = readInt(item.pointCost)
    const stock = readInt(item.stock)
    const cooldownHours = readInt(item.cooldownHours)
    const title = typeof item.title === 'string' ? item.title : ''
    if (cost === null || cost < 0 || cost > 10000) return { code: 'failed-precondition' as const, message: 'That item has no star price.' }
    if (stock === null || stock === 0) return { code: 'failed-precondition' as const, message: 'That item is out of stock.' }
    if (title.length === 0) return { code: 'failed-precondition' as const, message: 'That store item is not available.' }
    if (cooldownHours !== null && cooldownHours > 0 && onCooldown(orders.docs, itemId, cooldownHours)) {
      return { code: 'failed-precondition' as const, message: 'That item is still on cooldown.' }
    }

    const balance = readBalance(member.balance)
    if (balance.spend < cost || balance.total < cost) {
      return { code: 'failed-precondition' as const, message: 'Not enough Stars in Spend.' }
    }

    tx.update(memberRef, {
      balance: {
        total: balance.total - cost,
        spend: balance.spend - cost,
        save: balance.save,
        give: balance.give,
      },
    })
    if (stock > 0) tx.update(itemRef, { stock: stock - 1 })
    tx.set(orderRef, {
      childId: memberId,
      itemId,
      itemTitle: title.slice(0, 79),
      pointCost: cost,
      status: 'pending_fulfillment',
      requestedAt: FieldValue.serverTimestamp(),
      fulfilledAt: null,
      deliveredAt: null,
    })
    tx.set(ledgerRef, {
      childId: memberId,
      type: 'debit',
      totalAmount: cost,
      breakdown: { spend: cost, save: 0, give: 0 },
      source: 'store_item',
      referenceId: orderRef.id,
      memo: `Redeem: ${title}`.slice(0, 120),
      createdAt: FieldValue.serverTimestamp(),
    })
    return null
  })

  if (failure) throw new HttpsError(failure.code, failure.message)
  return { orderId: orderRef.id }
})

export const registerParent = onCall({ region: 'us-central1', invoker: 'public' }, async (request) => {
  const uid = request.auth?.uid
  if (!uid || uid.length > 128 || uid.includes('/')) {
    throw new HttpsError('unauthenticated', 'Sign in first.')
  }

  const name = readParentName(request.data?.name)
  if (!name) throw new HttpsError('invalid-argument', 'Enter your name.')

  const user = await getAuth().getUser(uid)
  const claims = user.customClaims ?? {}
  const existingFamily = claims.familyId
  if (claims.role === 'parent' && typeof existingFamily === 'string' && existingFamily.length > 0) {
    return { familyId: existingFamily }
  }

  const familyId = `family_${uid}`
  const familyRef = db.collection('families').doc(familyId)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(familyRef)
    if (snap.exists) return
    tx.set(familyRef, {
      familyName: `${name} Family`.slice(0, 79),
      createdAt: FieldValue.serverTimestamp(),
      currencyName: 'Stars',
      starToRealCurrencyRate: 0.05,
    })
    tx.set(familyRef.collection('members').doc('member_parent'), {
      name,
      role: 'parent',
      avatarUrl: '',
      pinHash: null,
    })
  })

  await getAuth().setCustomUserClaims(uid, { role: 'parent', familyId })
  return { familyId }
})

function readParentName(value: unknown) {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  if (name.length < 1 || name.length > 39 || /[\u0000-\u001F]/.test(name)) return null
  return name
}

function parentFamilyId(auth: { token: Record<string, unknown> } | undefined) {
  const familyId = auth?.token.familyId
  const role = auth?.token.role
  if (!auth || role !== 'parent' || typeof familyId !== 'string' || familyId.length === 0) {
    throw new HttpsError('permission-denied', 'Sign in as the parent.')
  }
  return familyId
}

function readId(value: unknown) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : null
}

function readInt(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function splitStars(points: number, config: unknown) {
  const allocation = config && typeof config === 'object' ? (config as Record<string, unknown>) : {}
  const spendPct = readInt(allocation.spendPct)
  const savePct = readInt(allocation.savePct)
  const givePct = readInt(allocation.givePct)
  const valid =
    spendPct !== null &&
    savePct !== null &&
    givePct !== null &&
    spendPct >= 0 &&
    savePct >= 0 &&
    givePct >= 0 &&
    spendPct + savePct + givePct === 100
  const spendShare = valid ? spendPct : 100
  const saveShare = valid ? savePct : 0
  const spend = Math.floor((points * spendShare) / 100)
  const save = Math.floor((points * saveShare) / 100)
  return { spend, save, give: points - spend - save }
}

function readBalance(value: unknown) {
  const balance = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    total: readInt(balance.total) ?? 0,
    spend: readInt(balance.spend) ?? 0,
    save: readInt(balance.save) ?? 0,
    give: readInt(balance.give) ?? 0,
  }
}

function onCooldown(docs: QueryDocumentSnapshot[], itemId: string, cooldownHours: number) {
  const cutoff = Date.now() - cooldownHours * 60 * 60 * 1000
  return docs.some((item) => {
    if (item.get('itemId') !== itemId || item.get('status') === 'cancelled') return false
    const requestedAt = item.get('requestedAt') as Timestamp | undefined
    return Boolean(requestedAt?.toMillis && requestedAt.toMillis() > cutoff)
  })
}
