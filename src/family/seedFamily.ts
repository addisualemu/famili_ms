import { collection, doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import type { ParentClaims } from '../auth/claims.ts'
import { db } from '../lib/firebase.ts'

export type FamilyMember = {
  id: string
  name: string
  role: 'parent' | 'child'
  tier?: 'junior' | 'senior'
  pinHash: string | null
  stars: number
  spend: number
  save: number
  give: number
  currentGoalItemId: string | null
}

type MemberWrite = {
  name: string
  role: 'parent' | 'child'
  avatarUrl: string
  pinHash: null
  tier?: 'junior' | 'senior'
  allocationConfig?: { spendPct: number; savePct: number; givePct: number }
}

const MEMBERS: Array<{ id: string; data: MemberWrite }> = [
  {
    id: 'member_leo',
    data: {
      name: 'Leo',
      role: 'child',
      tier: 'junior',
      avatarUrl: '',
      pinHash: null,
      allocationConfig: { spendPct: 100, savePct: 0, givePct: 0 },
    },
  },
  {
    id: 'member_maya',
    data: {
      name: 'Maya',
      role: 'child',
      tier: 'senior',
      avatarUrl: '',
      pinHash: null,
      allocationConfig: { spendPct: 70, savePct: 20, givePct: 10 },
    },
  },
]

export async function ensureFamily(claims: ParentClaims, parentName: string): Promise<void> {
  const familyRef = doc(db, 'families', claims.familyId)
  const existing = await getDoc(familyRef)
  if (existing.exists()) return

  const batch = writeBatch(db)
  batch.set(familyRef, {
    familyName: 'Alemu Family',
    createdAt: serverTimestamp(),
    currencyName: 'Stars',
    starToRealCurrencyRate: 0.05,
  })

  const parent: MemberWrite = {
    name: parentName.slice(0, 39) || 'Parent',
    role: 'parent',
    avatarUrl: '',
    pinHash: null,
  }
  batch.set(doc(collection(familyRef, 'members'), 'member_parent'), parent)

  for (const member of MEMBERS) {
    batch.set(doc(collection(familyRef, 'members'), member.id), member.data)
  }

  await batch.commit()
}

export function memberFromSnapshot(
  id: string,
  data: Record<string, unknown>,
): FamilyMember {
  const role = data.role === 'child' ? 'child' : 'parent'
  const tier = data.tier === 'junior' || data.tier === 'senior' ? data.tier : undefined
  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Member',
    role,
    tier,
    pinHash: typeof data.pinHash === 'string' && data.pinHash.length > 0 ? data.pinHash : null,
    stars: readAmount(data.balance, 'total'),
    spend: readAmount(data.balance, 'spend'),
    save: readAmount(data.balance, 'save'),
    give: readAmount(data.balance, 'give'),
    currentGoalItemId:
      typeof data.currentGoalItemId === 'string' && data.currentGoalItemId.length > 0
        ? data.currentGoalItemId
        : null,
  }
}

function readAmount(balance: unknown, key: 'total' | 'spend' | 'save' | 'give') {
  if (!balance || typeof balance !== 'object') return 0
  const value = (balance as Record<string, unknown>)[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
