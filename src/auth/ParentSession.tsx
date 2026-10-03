import { signOut, type User } from 'firebase/auth'
import { useState } from 'react'
import { auth } from '../lib/firebase.ts'
import type { FamilyMember } from '../family/seedFamily.ts'
import type { ParentClaims } from './claims.ts'

type ParentSessionProps = {
  user: User
  claims: ParentClaims | null
  members: FamilyMember[]
  sessionError?: string | null
}

export function ParentSession({ user, claims, members, sessionError }: ParentSessionProps) {
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
        {claims ? (
          <p className="mt-4 text-xs font-semibold tracking-[0.16em] uppercase">
            Parent
          </p>
        ) : null}
        {members.length > 0 ? (
          <>
          <p className="mt-6 text-xs font-semibold tracking-[0.16em] uppercase">
            Family
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {members.map((member) => (
              <li key={member.id}>
                {member.name}
                {member.tier === 'junior' ? ' · Junior' : null}
                {member.tier === 'senior' ? ' · Senior' : null}
              </li>
            ))}
          </ul>
          </>
        ) : null}

        {sessionError || error ? (
          <p className="mt-4 text-sm text-coral" role="alert">
            {sessionError || error}
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
