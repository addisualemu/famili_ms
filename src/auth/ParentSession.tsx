import { signOut, type User } from 'firebase/auth'
import { useState } from 'react'
import { auth } from '../lib/firebase.ts'

type ParentSessionProps = {
  user: User
}

export function ParentSession({ user }: ParentSessionProps) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const name = user.displayName || user.email || 'Parent'

  async function handleSignOut() {
    setError(null)
    setBusy(true)
    try {
      await signOut(auth)
    } catch {
      setError('Sign out failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-md rounded-3xl border border-navy/10 bg-white px-6 py-8 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">
          Parent Console
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Signed in</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">{name}</p>
        {user.email ? (
          <p className="text-sm leading-6 text-navy/70">{user.email}</p>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="mt-8 min-h-11 w-full rounded-2xl border border-navy/15 text-sm font-semibold disabled:opacity-60"
          disabled={busy}
          onClick={handleSignOut}
          type="button"
        >
          {busy ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </main>
  )
}
