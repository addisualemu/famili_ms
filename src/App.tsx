import { signOut } from 'firebase/auth'
import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ParentLogin } from './auth/ParentLogin.tsx'
import { useAuthUser } from './auth/useAuthUser.ts'
import { auth } from './lib/firebase.ts'
import { useFamily } from './family/useFamily.ts'
import { ActiveProfile } from './profile/ActiveProfile.tsx'
import { PinLock } from './profile/PinLock.tsx'
import { hashPin, requiresPin, verifyPin } from './profile/pinHash.ts'
import { saveMemberPin } from './profile/saveMemberPin.ts'
import { ProfileSwitcher } from './profile/ProfileSwitcher.tsx'

function AuthGate() {
  const { user, claims, error, ready } = useAuthUser()
  const parentName = user?.displayName || 'Parent'
  const family = useFamily(claims, parentName)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinBusy, setPinBusy] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  if (!ready || (claims && !family.ready)) {
    return <main aria-busy="true" className="min-h-svh bg-cream" />
  }

  if (!user) {
    return <ParentLogin />
  }

  const active = family.members.find((member) => member.id === activeId) ?? null
  const pending = family.members.find((member) => member.id === pendingId) ?? null
  const sessionError = error || family.error || signOutError

  function selectProfile(memberId: string) {
    const member = family.members.find((item) => item.id === memberId)
    if (!member) return
    if (requiresPin(member)) {
      setPinError(null)
      setPendingId(memberId)
      return
    }
    setActiveId(memberId)
  }

  async function handlePin(pin: string) {
    if (!pending || !claims) return
    setPinBusy(true)
    setPinError(null)
    try {
      if (!pending.pinHash) {
        await saveMemberPin(claims.familyId, pending.id, await hashPin(pin))
      } else if (!(await verifyPin(pin, pending.pinHash))) {
        setPinError('That PIN is not right.')
        return
      }
      setActiveId(pending.id)
      setPendingId(null)
    } catch {
      setPinError('Could not check the PIN. Try again.')
    } finally {
      setPinBusy(false)
    }
  }

  async function handleSignOut() {
    setSignOutError(null)
    setSigningOut(true)
    try {
      await signOut(auth)
      setActiveId(null)
      setPendingId(null)
    } catch {
      setSignOutError('Sign out failed. Try again.')
    } finally {
      setSigningOut(false)
    }
  }

  if (pending) {
    return (
      <>
        <PinLock
          busy={pinBusy}
          error={pinError}
          mode={pending.pinHash ? 'unlock' : 'create'}
          name={pending.name}
          onCancel={() => {
            setPendingId(null)
            setPinError(null)
          }}
          onComplete={handlePin}
        />
        {sessionError ? <SessionError message={sessionError} /> : null}
      </>
    )
  }

  if (!active) {
    return (
      <>
        <ProfileSwitcher
          members={family.members}
          onSelect={selectProfile}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
        {sessionError ? <SessionError message={sessionError} /> : null}
      </>
    )
  }

  return (
    <>
      <ActiveProfile
        member={active}
        onSignOut={handleSignOut}
        onSwitch={() => setActiveId(null)}
        signingOut={signingOut}
      />
      {sessionError ? <SessionError message={sessionError} /> : null}
    </>
  )
}

function SessionError({ message }: { message: string }) {
  return (
    <p className="fixed inset-x-0 bottom-6 mx-auto w-fit max-w-sm rounded-2xl bg-white px-4 py-3 text-sm text-coral" role="alert">
      {message}
    </p>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route path="/login" element={<AuthGate />} />
      </Routes>
    </BrowserRouter>
  )
}
