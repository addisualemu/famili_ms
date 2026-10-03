import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export async function saveMemberPin(familyId: string, memberId: string, pinHash: string) {
  await updateDoc(doc(db, 'families', familyId, 'members', memberId), { pinHash })
}
