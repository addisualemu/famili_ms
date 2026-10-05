import { useState, type FormEvent } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { viewLabel } from '../profile/ProfileSwitcher.tsx'
import {
  clearProfilePin,
  createChildProfile,
  createParentProfile,
  removeChildProfile,
  renameProfile,
  updateChildProfile,
  type ChildTier,
} from './saveMemberProfile.ts'

type ProfileKind = ChildTier | 'parent'

const FOUNDING_PARENT_ID = 'member_parent'

type ProfilesProps = {
  familyId: string
  members: FamilyMember[]
}

export function Profiles({ familyId, members }: ProfilesProps) {
  return (
    <section>
      <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Profiles</h2>
      <p className="mt-2 text-sm text-navy/70">
        Add a child or another parent. A parent opens the Parent Console and can approve work, manage the store, and edit profiles. The first parent profile stays.
      </p>
      <AddProfileForm familyId={familyId} />
      <ul className="mt-4 grid gap-3">
        {members.map((member) => (
          <li key={member.id}>
            <ProfileCard familyId={familyId} member={member} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function AddProfileForm({ familyId }: { familyId: string }) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<ProfileKind>('junior')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      if (kind === 'parent') {
        await createParentProfile(familyId, name)
      } else {
        await createChildProfile(familyId, name, kind)
      }
      setName('')
      setKind('junior')
      setSaved(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not add that profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="mt-4 grid gap-3 rounded-3xl border border-navy/10 bg-white px-5 py-5" onSubmit={(event) => void onSubmit(event)}>
      <h3 className="text-lg font-semibold">Add profile</h3>
      <label className="grid gap-1 text-sm font-medium">
        Name
        <input
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          maxLength={39}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        View
        <select
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          onChange={(event) => setKind(readProfileKind(event.target.value))}
          value={kind}
        >
          <option value="junior">Junior</option>
          <option value="senior">Senior</option>
          <option value="parent">Parent</option>
        </select>
      </label>
      <p className="text-sm text-navy/70">
        {kind === 'parent'
          ? 'A parent uses the Parent Console, the same as you, and sets a PIN on the profile picker.'
          : 'Junior sees Missions. Senior sees Work Orders and Spend, Save, and Give.'}
      </p>
      <button className="min-h-11 rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60" disabled={busy} type="submit">
        {busy ? 'Adding…' : 'Add profile'}
      </button>
      {saved ? <p className="text-sm text-navy/70">Profile added. It shows on the profile picker.</p> : null}
      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function ProfileCard({ familyId, member }: { familyId: string; member: FamilyMember }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [name, setName] = useState(member.name)
  const [tier, setTier] = useState<ChildTier>(member.tier === 'senior' ? 'senior' : 'junior')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const child = member.role === 'child'
  const removableParent = member.role === 'parent' && member.id !== FOUNDING_PARENT_ID

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (child) {
        await updateChildProfile(familyId, member.id, name, tier, member.tier ?? null)
      } else {
        await renameProfile(familyId, member.id, name)
      }
      setEditing(false)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save that profile.')
    } finally {
      setBusy(false)
    }
  }

  async function onClearPin() {
    setBusy(true)
    setError(null)
    try {
      await clearProfilePin(familyId, member.id)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not clear the PIN.')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove() {
    setBusy(true)
    setError(null)
    try {
      await removeChildProfile(familyId, member.id)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not remove that profile.')
      setBusy(false)
    }
  }

  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
            member.tier === 'junior' ? 'bg-sky text-navy' : member.role === 'parent' ? 'bg-navy text-cream' : 'border border-navy/15 bg-white'
          }`}
        >
          {member.name.trim().charAt(0).toUpperCase() || '?'}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{member.name}</h3>
          <p className="text-sm text-navy/70">
            {viewLabel(member)}
            {child ? ` · ${member.stars} ${member.stars === 1 ? 'Star' : 'Stars'}` : ''}
          </p>
        </div>
      </div>

      {editing ? (
        <form className="mt-4 grid gap-3" onSubmit={(event) => void onSave(event)}>
          <label className="grid gap-1 text-sm font-medium">
            Name
            <input
              className="min-h-11 rounded-2xl border border-navy/15 px-3"
              maxLength={39}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          {child ? (
            <label className="grid gap-1 text-sm font-medium">
              View
              <select
                className="min-h-11 rounded-2xl border border-navy/15 px-3"
                onChange={(event) => setTier(event.target.value === 'senior' ? 'senior' : 'junior')}
                value={tier}
              >
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
              </select>
            </label>
          ) : null}
          {child ? (
            <p className="text-sm text-navy/70">Changing Junior or Senior updates how new Stars split. Saved Stars stay put.</p>
          ) : null}
          <div className="flex gap-3">
            <button className="min-h-11 flex-1 rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60" disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              className="min-h-11 flex-1 rounded-2xl border border-navy/15 text-sm font-semibold"
              onClick={() => {
                setName(member.name)
                setTier(member.tier === 'senior' ? 'senior' : 'junior')
                setEditing(false)
                setError(null)
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-2xl border border-navy/15 px-4 text-sm font-semibold"
            onClick={() => {
              setName(member.name)
              setTier(member.tier === 'senior' ? 'senior' : 'junior')
              setConfirming(false)
              setEditing(true)
              setError(null)
            }}
            type="button"
          >
            Edit
          </button>
          {member.pinHash ? (
            <button
              className="min-h-11 rounded-2xl border border-navy/15 px-4 text-sm font-semibold disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                void onClearPin()
              }}
              type="button"
            >
              Clear PIN
            </button>
          ) : null}
          {child || removableParent ? (
            <button
              className="min-h-11 rounded-2xl border border-coral/40 px-4 text-sm font-semibold text-coral"
              onClick={() => {
                setEditing(false)
                setConfirming(true)
                setError(null)
              }}
              type="button"
            >
              Remove
            </button>
          ) : null}
        </div>
      )}

      {confirming && !editing ? (
        <div className="mt-4 grid gap-3">
          <p className="text-sm text-navy/70">
            Remove {member.name}? They leave the profile picker.
            {child ? ' Work orders stay in the family.' : ' The first parent profile stays.'}
          </p>
          <div className="flex gap-3">
            <button
              className="min-h-11 flex-1 rounded-2xl bg-coral text-sm font-semibold text-white disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                void onRemove()
              }}
              type="button"
            >
              {busy ? 'Removing…' : 'Remove profile'}
            </button>
            <button
              className="min-h-11 flex-1 rounded-2xl border border-navy/15 text-sm font-semibold"
              onClick={() => setConfirming(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  )
}

function readProfileKind(value: string): ProfileKind {
  if (value === 'senior' || value === 'parent') return value
  return 'junior'
}
