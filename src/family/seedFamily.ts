import { collection, doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import type { ParentClaims } from '../auth/claims.ts'
import { db } from '../lib/firebase.ts'

export type FamilyMember = {
  id: string
  name: string
  role: 'parent' | 'child'
  tier?: 'junior' | 'senior'
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
  }
}
