import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase.ts'
import { purchaseOrderFromData, type PurchaseOrder } from './purchaseOrders.ts'

export function usePurchaseOrders(familyId: string | null) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [ready, setReady] = useState(!familyId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) return

    return onSnapshot(
      collection(db, 'families', familyId, 'purchaseOrders'),
      (snapshot) => {
        const next = snapshot.docs.flatMap((item) => {
          const order = purchaseOrderFromData(item.id, item.data() as Record<string, unknown>)
          return order ? [order] : []
        })
        next.sort((a, b) => a.itemTitle.localeCompare(b.itemTitle))
        setOrders(next)
        setError(null)
        setReady(true)
      },
      () => {
        setError('Could not load the fulfillment queue.')
        setReady(true)
      },
    )
  }, [familyId])

  return { orders, ready, error }
}
