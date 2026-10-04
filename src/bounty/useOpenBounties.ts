import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase.ts'
import { workOrderFromData, type SeniorWorkOrder } from '../senior/workOrders.ts'

export function useOpenBounties(familyId: string | null) {
  const [bounties, setBounties] = useState<SeniorWorkOrder[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) return

    const bountiesQuery = query(collection(db, 'families', familyId, 'workOrders'), where('isBounty', '==', true))
    return onSnapshot(
      bountiesQuery,
      (snapshot) => {
        const next = snapshot.docs.flatMap((item) => {
          const order = workOrderFromData(item.id, item.data() as Record<string, unknown>)
          if (!order || order.status !== 'open' || order.assignedTo) return []
          return [order]
        })
        next.sort((a, b) => a.title.localeCompare(b.title))
        setBounties(next)
        setError(null)
      },
      () => {
        setError('Could not load open bounties.')
      },
    )
  }, [familyId])

  return { bounties, error }
}
