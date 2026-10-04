import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export async function reworkWorkOrder(
  familyId: string,
  workOrderId: string,
  senderId: string,
  senderName: string,
  note: string,
) {
  const trimmed = note.trim()
  const name = senderName.trim().slice(0, 39)
  if (trimmed.length === 0 || trimmed.length > 500) throw new Error('Write a note for the rework.')
  if (name.length === 0) throw new Error('Could not send that work order back.')

  const orderRef = doc(db, 'families', familyId, 'workOrders', workOrderId)
  try {
    await addDoc(collection(orderRef, 'messages'), {
      senderId,
      senderName: name,
      text: trimmed,
      createdAt: serverTimestamp(),
    })
  } catch {
    throw new Error('Could not send that work order back.')
  }

  try {
    await updateDoc(orderRef, { status: 'rework' })
  } catch {
    throw new Error('The note was saved. Sending the work order back did not finish.')
  }
}
