import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase.ts'
import { readParentClaims, type ParentClaims } from './claims.ts'
import { waitForRegistration } from './registrationGate.ts'

export function useAuthUser() {
  const [user, setUser] = useState(auth.currentUser)
  const [claims, setClaims] = useState<ParentClaims | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    const unsubscribe = onAuthStateChanged(auth, () => {
      void loadSession()
    })

    async function loadSession() {
      if (!active) return
      setReady(false)
      setError(null)

      try {
        await waitForRegistration()
        if (!active) return
        const currentUser = auth.currentUser
        if (!currentUser) {
          setUser(null)
          setClaims(null)
          setError(null)
          return
        }

        const token = await currentUser.getIdTokenResult(true)
        const parentClaims = readParentClaims(token.claims)
        if (!active) return
        setUser(currentUser)
        setClaims(parentClaims)
        setError(parentClaims ? null : 'This account is not set up as a parent.')
      } catch {
        if (!active) return
        setUser(auth.currentUser)
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
  }, [reloadToken])

  return {
    user,
    claims,
    error,
    ready,
    reload: () => setReloadToken((count) => count + 1),
  }
}
