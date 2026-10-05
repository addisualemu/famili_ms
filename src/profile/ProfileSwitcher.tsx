import type { FamilyMember } from '../family/seedFamily.ts'

export type ProfileAudience = 'children' | 'parents'

type ProfileSwitcherProps = {
  members: FamilyMember[]
  audience: ProfileAudience
  onSelect: (memberId: string) => void
  onSignOut: () => void
  signingOut: boolean
}

export function memberOnAudience(member: FamilyMember, audience: ProfileAudience) {
  if (audience === 'parents') return member.role === 'parent'
  return member.role !== 'parent' && (member.tier === 'junior' || member.tier === 'senior')
}

export function ProfileSwitcher({
  members,
  audience,
  onSelect,
  onSignOut,
  signingOut,
}: ProfileSwitcherProps) {
  const listed = members.filter((member) => memberOnAudience(member, audience))
  const copy =
    audience === 'parents'
      ? {
          eyebrow: 'Parent',
          detail: 'Open the Parent Console on this device.',
          empty: 'No parent profile on this family yet.',
        }
      : {
          eyebrow: 'Shared tablet',
          detail: 'This device stays signed in. Pick who is using it.',
          empty: 'No junior or senior profiles yet.',
        }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">{copy.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">Choose a profile</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">{copy.detail}</p>

        {listed.length === 0 ? (
          <p className="mt-10 text-sm text-navy/70">{copy.empty}</p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 justify-items-center gap-8 sm:grid-cols-3">
          {listed.map((member) => (
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
        )}

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
