import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, type QueryDocumentSnapshot, type Timestamp } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()

export const redeemStoreItem = onCall({ region: 'us-central1' }, async (request) => {
  const familyId = request.auth?.token.familyId
  const role = request.auth?.token.role
  if (!request.auth || role !== 'parent' || typeof familyId !== 'string' || familyId.length === 0) {
    throw new HttpsError('permission-denied', 'Sign in as the parent to redeem.')
  }

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

function readId(value: unknown) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : null
}

function readInt(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) ? value : null
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
