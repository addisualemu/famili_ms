import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export type ChildTier = 'junior' | 'senior'

export function allocationForTier(tier: ChildTier) {
  return tier === 'senior'
    ? { spendPct: 70, savePct: 20, givePct: 10 }
    : { spendPct: 100, savePct: 0, givePct: 0 }
}

export async function createChildProfile(familyId: string, name: string, tier: ChildTier) {
  await addDoc(collection(db, 'families', familyId, 'members'), {
    name: cleanName(name),
    role: 'child',
    tier,
    avatarUrl: '',
    pinHash: null,
    allocationConfig: allocationForTier(tier),
  })
}

export async function renameProfile(familyId: string, memberId: string, name: string) {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), { name: cleanName(name) })
}

export async function updateChildProfile(
  familyId: string,
  memberId: string,
  name: string,
  tier: ChildTier,
  previousTier: ChildTier | null,
) {
  const patch: { name: string; tier: ChildTier; allocationConfig?: ReturnType<typeof allocationForTier> } = {
    name: cleanName(name),
    tier,
  }
  if (tier !== previousTier) patch.allocationConfig = allocationForTier(tier)
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), patch)
}

export async function clearProfilePin(familyId: string, memberId: string) {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), { pinHash: null })
}

export async function removeChildProfile(familyId: string, memberId: string) {
  await deleteDoc(doc(db, 'families', familyId, 'members', memberId))
}

function cleanName(name: string) {
  const trimmed = name.trim()
  if (trimmed.length === 0 || trimmed.length >= 40) {
    throw new Error('Use a name under 40 characters.')
  }
  return trimmed
}
