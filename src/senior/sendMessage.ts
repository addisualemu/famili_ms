import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export async function sendMessage(
  familyId: string,
  workOrderId: string,
  senderId: string,
  senderName: string,
  text: string,
) {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 500) throw new Error('Write a shorter note.')
  try {
    await addDoc(collection(db, 'families', familyId, 'workOrders', workOrderId, 'messages'), {
      senderId,
      senderName,
      text: trimmed,
      createdAt: serverTimestamp(),
    })
  } catch {
    throw new Error('Could not send that note.')
  }
}
