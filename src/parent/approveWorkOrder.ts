import { getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp } from '../lib/firebase.ts'

export async function approveWorkOrder(workOrderId: string) {
  const call = httpsCallable(getFunctions(firebaseApp, 'us-central1'), 'approveWorkOrder')
  try {
    await call({ workOrderId })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('not waiting')) throw new Error('That work order is not waiting for review.')
    throw new Error('Could not approve that work order.')
  }
}
