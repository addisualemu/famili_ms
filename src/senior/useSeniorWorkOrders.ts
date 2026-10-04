import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase.ts'
import { ensureSeniorWorkOrders } from './ensureSeniorWorkOrders.ts'
import { workOrderFromData, type SeniorWorkOrder } from './workOrders.ts'

export function useSeniorWorkOrders(familyId: string | null, memberId: string | null) {
  const [orders, setOrders] = useState<SeniorWorkOrder[]>([])
  const [ready, setReady] = useState(!familyId || !memberId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId || !memberId) return

    let active = true
    setReady(false)
    setError(null)

    const ordersQuery = query(
      collection(db, 'families', familyId, 'workOrders'),
      where('assignedTo', '==', memberId),
    )
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        if (!active) return
        const next = snapshot.docs.flatMap((item) => {
          const order = workOrderFromData(item.id, item.data() as Record<string, unknown>)
          return order ? [order] : []
        })
        next.sort((a, b) => a.code.localeCompare(b.code))
        setOrders(next)
        setReady(true)
      },
      () => {
        if (!active) return
        setError('Could not load work orders.')
        setReady(true)
      },
    )

    void ensureSeniorWorkOrders(familyId, memberId).catch(() => {
      if (!active) return
      setError('Could not prepare work orders.')
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [familyId, memberId])

  return { orders, ready, error }
}

export function useFamilyWorkOrders(familyId: string | null) {
  const [orders, setOrders] = useState<SeniorWorkOrder[]>([])
  const [ready, setReady] = useState(!familyId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) return

    const ordersQuery = query(collection(db, 'families', familyId, 'workOrders'))
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const next = snapshot.docs.flatMap((item) => {
          const order = workOrderFromData(item.id, item.data() as Record<string, unknown>)
          return order ? [order] : []
        })
        next.sort((a, b) => a.code.localeCompare(b.code))
        setOrders(next)
        setError(null)
        setReady(true)
      },
      () => {
        setError('Could not load work orders.')
        setReady(true)
      },
    )
  }, [familyId])

  return { orders, ready, error }
}
