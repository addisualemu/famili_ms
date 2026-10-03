import type { FamilyMember } from '../family/seedFamily.ts'
import { viewLabel } from './ProfileSwitcher.tsx'

type ActiveProfileProps = {
  member: FamilyMember
  onSwitch: () => void
  onSignOut: () => void
  signingOut: boolean
}

export function ActiveProfile({
  member,
  onSwitch,
  onSignOut,
  signingOut,
}: ActiveProfileProps) {
  const label = viewLabel(member)
  const eyebrow = member.role === 'parent' ? 'Parent Console' : `${label} view`

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-md rounded-3xl border border-navy/10 bg-white px-6 py-8 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold">{member.name}</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">{label}</p>

        <button
          className="mt-8 min-h-11 w-full rounded-2xl bg-navy text-sm font-semibold text-cream"
          onClick={onSwitch}
          type="button"
        >
          Switch profile
        </button>
        {member.role === 'parent' ? (
          <button
            className="mt-3 min-h-11 w-full rounded-2xl border border-navy/15 text-sm font-semibold disabled:opacity-60"
            disabled={signingOut}
            onClick={onSignOut}
            type="button"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        ) : null}
      </section>
    </main>
  )
}
