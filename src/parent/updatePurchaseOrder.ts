import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

export async function fulfillPurchaseOrder(familyId: string, orderId: string) {
  try {
    await updateDoc(doc(db, 'families', familyId, 'purchaseOrders', orderId), {
      status: 'fulfilled',
      fulfilledAt: serverTimestamp(),
    })
  } catch {
    throw new Error('Could not fulfill that order.')
  }
}

export async function deliverPurchaseOrder(familyId: string, orderId: string) {
  try {
    await updateDoc(doc(db, 'families', familyId, 'purchaseOrders', orderId), {
      deliveredAt: serverTimestamp(),
    })
  } catch {
    throw new Error('Could not mark that order delivered.')
  }
}
