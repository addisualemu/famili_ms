import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export async function claimBounty(familyId: string, workOrderId: string, memberId: string) {
  try {
    await updateDoc(doc(db, 'families', familyId, 'workOrders', workOrderId), {
      assignedTo: memberId,
      status: 'in_progress',
    })
  } catch {
    throw new Error('Could not claim that bounty.')
  }
}
