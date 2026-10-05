import { getFunctions, httpsCallable } from 'firebase/functions'
import { firebaseApp } from '../lib/firebase.ts'

export async function redeemStoreItem(memberId: string, itemId: string) {
  const call = httpsCallable(getFunctions(firebaseApp, 'us-central1'), 'redeemStoreItem')
  try {
    await call({ memberId, itemId })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('Not enough Stars')) throw new Error('Not enough Stars in Spend.')
    if (message.includes('out of stock')) throw new Error('That item is out of stock.')
    if (message.includes('cooldown')) throw new Error('That item is still on cooldown.')
    if (message.includes('not active')) throw new Error('That item is not active.')
    throw new Error('Could not get that item.')
  }
}
