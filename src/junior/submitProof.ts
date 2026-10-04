import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export async function submitProof(familyId: string, workOrderId: string) {
  try {
    await updateDoc(doc(db, 'families', familyId, 'workOrders', workOrderId), {
      status: 'pending_review',
      proofSubmission: {
        photoUrls: [],
        notes: '',
        submittedAt: serverTimestamp(),
      },
    })
  } catch {
    throw new Error('Could not mark that mission done.')
  }
}
