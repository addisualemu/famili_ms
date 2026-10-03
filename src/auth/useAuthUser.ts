import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase.ts'
import { readParentClaims, type ParentClaims } from './claims.ts'

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [claims, setClaims] = useState<ParentClaims | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, (next) => {
      void loadSession(next)
    })

    async function loadSession(next: User | null) {
      if (!active) return

      if (!next) {
        setUser(null)
        setClaims(null)
        setError(null)
        setReady(true)
        return
      }

      setReady(false)
      setError(null)

      try {
        const current = await next.getIdTokenResult(true)
        const parentClaims = readParentClaims(current.claims)
        if (!active) return
        setUser(next)
        setClaims(parentClaims)
        setError(parentClaims ? null : 'This account is not set up as a parent.')
      } catch {
        if (!active) return
        setUser(next)
        setClaims(null)
        setError('Could not open the parent session. Try again.')
      } finally {
        if (active) setReady(true)
      }
    }

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { user, claims, error, ready }
}
