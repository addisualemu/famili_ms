import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase.ts'

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next)
      setReady(true)
    })
  }, [])

  return { user, ready }
}
