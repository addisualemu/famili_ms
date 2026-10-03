import type { FamilyMember } from '../family/seedFamily.ts'

type ProfileSwitcherProps = {
  members: FamilyMember[]
  onSelect: (memberId: string) => void
  onSignOut: () => void
  signingOut: boolean
}

export function ProfileSwitcher({
  members,
  onSelect,
  onSignOut,
  signingOut,
}: ProfileSwitcherProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">
          Shared tablet
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Choose a profile</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">
          This device stays signed in. Pick who is using it.
        </p>

        <ul className="mt-10 grid grid-cols-2 justify-items-center gap-8 sm:grid-cols-3">
          {members.map((member) => (
            <li key={member.id}>
              <button
                className="flex min-h-14 min-w-28 flex-col items-center gap-3"
                onClick={() => onSelect(member.id)}
                type="button"
              >
                <Avatar member={member} />
                <span className="text-base font-semibold">{member.name}</span>
                <span className="text-xs font-semibold tracking-[0.16em] uppercase">
                  {viewLabel(member)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          className="mt-12 min-h-11 rounded-2xl border border-navy/15 px-5 text-sm font-semibold disabled:opacity-60"
          disabled={signingOut}
          onClick={onSignOut}
          type="button"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </main>
  )
}

export function viewLabel(member: FamilyMember) {
  if (member.tier === 'junior') return 'Junior'
  if (member.tier === 'senior') return 'Senior'
  return 'Parent'
}

function Avatar({ member }: { member: FamilyMember }) {
  const tone =
    member.tier === 'junior'
      ? 'bg-sky text-navy'
      : member.tier === 'senior'
        ? 'border border-navy/15 bg-white text-navy'
        : 'bg-navy text-cream'

  return (
    <span
      aria-hidden="true"
      className={`flex h-28 w-28 items-center justify-center rounded-full text-3xl font-semibold ${tone}`}
    >
      {initial(member.name)}
    </span>
  )
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}
