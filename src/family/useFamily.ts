import { collection, onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { ParentClaims } from '../auth/claims.ts'
import { db } from '../lib/firebase.ts'
import { ensureFamily, memberFromSnapshot, type FamilyMember } from './seedFamily.ts'


export function useFamily(claims: ParentClaims | null, parentName: string) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!claims) {
      setMembers([])
      setError(null)
      setReady(true)
      return
    }

    let active = true
    setReady(false)
    setError(null)

    const membersRef = collection(db, 'families', claims.familyId, 'members')
    const unsubscribe = onSnapshot(
      membersRef,
      (snapshot) => {
        if (!active) return
        const next = snapshot.docs.map((item) =>
          memberFromSnapshot(item.id, item.data() as Record<string, unknown>),
        )
        next.sort((a, b) => {
          if (a.role !== b.role) return a.role === 'parent' ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        setMembers(next)
        setReady(true)
      },
      () => {
        if (!active) return
        setError('Could not load the family.')
        setReady(true)
      },
    )

    void ensureFamily(claims, parentName).catch(() => {
      if (!active) return
      setError('Could not create the family.')
      setReady(true)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [claims, parentName])

  return { members, error, ready }
}
