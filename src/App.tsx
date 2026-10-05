import { signOut } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FinishFamily, finishFamily, ParentLogin } from './auth/ParentLogin.tsx'
import { clearFinishRegistration, clearRegistrationError, readFinishRegistration, registrationPending } from './auth/registrationGate.ts'
import { useAuthUser } from './auth/useAuthUser.ts'
import { auth } from './lib/firebase.ts'
import { useFamily } from './family/useFamily.ts'
import { ParentConsole } from './parent/ParentConsole.tsx'
import { JuniorHome } from './junior/JuniorHome.tsx'
import { SeniorDashboard } from './senior/SeniorDashboard.tsx'
import { useJuniorHome } from './junior/useJuniorHome.ts'
import { readActiveMember, writeActiveMember } from './profile/activeMember.ts'
import { ActiveProfile } from './profile/ActiveProfile.tsx'
import { PinLock } from './profile/PinLock.tsx'
import { hashPin, requiresPin, verifyPin } from './profile/pinHash.ts'
import { saveMemberPin } from './profile/saveMemberPin.ts'
import { ProfileSwitcher } from './profile/ProfileSwitcher.tsx'

function AuthGate() {
  const { user, claims, error, ready, reload } = useAuthUser()
  const parentName = user?.displayName || 'Parent'
  const family = useFamily(claims, parentName)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinBusy, setPinBusy] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [finishBusy, setFinishBusy] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)
  const restoredMember = useRef(false)
  const selected = family.members.find((member) => member.id === activeId) ?? null
  const juniorHome = useJuniorHome(claims?.familyId ?? null, selected)

  useEffect(() => {
    if (!claims || !family.ready || family.members.length === 0 || restoredMember.current) return
    restoredMember.current = true
    const saved = readActiveMember(claims.familyId)
    if (saved && family.members.some((member) => member.id === saved)) {
      setActiveId(saved)
    }
  }, [claims, family.ready, family.members])

  if (!ready) {
    return (
      <main aria-busy="true" className="grid min-h-svh place-items-center bg-cream px-4 text-navy">
        {registrationPending() ? <p className="text-sm">Creating your family…</p> : null}
      </main>
    )
  }

  if (claims && !family.ready) {
    return <main aria-busy="true" className="min-h-svh bg-cream" />
  }

  if (!user) {
    return <ParentLogin />
  }

  const unfinishedName = readFinishRegistration()
  if (!claims) {
    return (
      <FinishFamily
        busy={finishBusy}
        error={finishError}
        name={unfinishedName || user.displayName || 'Parent'}
        onFinish={() => {
          const name = unfinishedName || user.displayName || 'Parent'
          setFinishBusy(true)
          setFinishError(null)
          void finishFamily(name)
            .then(async () => {
              await user.getIdToken(true)
              clearFinishRegistration()
              clearRegistrationError()
              reload()
            })
            .catch((finishFailure: unknown) => {
              setFinishError(finishFailure instanceof Error ? finishFailure.message : 'Could not create the family. Try again.')
            })
            .finally(() => setFinishBusy(false))
        }}
        onSignOut={() => {
          clearFinishRegistration()
          clearRegistrationError()
          void handleSignOut()
        }}
      />
    )
  }

  const active = selected
  const pending = family.members.find((member) => member.id === pendingId) ?? null
  const sessionError = error || family.error || signOutError || juniorHome.error

  function selectProfile(memberId: string) {
    const member = family.members.find((item) => item.id === memberId)
    if (!member) return
    if (requiresPin(member)) {
      setPinError(null)
      setPendingId(memberId)
      return
    }
    setActiveId(memberId)
    if (claims) writeActiveMember(claims.familyId, memberId)
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
      writeActiveMember(claims.familyId, pending.id)
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
      if (claims) writeActiveMember(claims.familyId, null)
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

  const leaveProfile = () => {
    if (claims) writeActiveMember(claims.familyId, null)
    setActiveId(null)
  }

  if (active.role === 'parent' && claims) {
    return (
      <>
        <ParentConsole
          familyId={claims.familyId}
          member={active}
          members={family.members}
          onSignOut={handleSignOut}
          onSwitch={leaveProfile}
          signingOut={signingOut}
        />
        {sessionError ? <SessionError message={sessionError} /> : null}
      </>
    )
  }

  if (active.tier === 'senior' && claims) {
    return (
      <>
        <SeniorDashboard familyId={claims.familyId} member={active} onSwitch={leaveProfile} />
        {sessionError ? <SessionError message={sessionError} /> : null}
      </>
    )
  }

  if (active.tier === 'junior' && claims) {
    return (
      <>
        <JuniorHome familyId={claims.familyId} home={juniorHome} member={active} onSwitch={leaveProfile} />
        {sessionError ? <SessionError message={sessionError} /> : null}
      </>
    )
  }

  return (
    <>
      <ActiveProfile member={active} onSignOut={handleSignOut} onSwitch={leaveProfile} signingOut={signingOut} />
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
