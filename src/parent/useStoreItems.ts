import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase.ts'
import { storeItemFromData, type StoreItem } from './storeItems.ts'

export function useStoreItems(familyId: string | null) {
  const [items, setItems] = useState<StoreItem[]>([])
  const [ready, setReady] = useState(!familyId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) return

    const itemsQuery = collection(db, 'families', familyId, 'storeItems')
    return onSnapshot(
      itemsQuery,
      (snapshot) => {
        const next = snapshot.docs.flatMap((item) => {
          const storeItem = storeItemFromData(item.id, item.data() as Record<string, unknown>)
          return storeItem ? [storeItem] : []
        })
        next.sort((a, b) => a.title.localeCompare(b.title))
        setItems(next)
        setError(null)
        setReady(true)
      },
      () => {
        setError('Could not load store items.')
        setReady(true)
      },
    )
  }, [familyId])

  return { items, ready, error }
}
