import { useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { OpenBountyList } from '../bounty/OpenBountyList.tsx'
import { Marketplace } from '../store/Marketplace.tsx'
import { GoalBar } from './GoalBar.tsx'
import { MissionCard } from './MissionCard.tsx'
import { StarBadge } from './StarBadge.tsx'
import { submitProof } from './submitProof.ts'
import type { JuniorHome as JuniorHomeData } from './useJuniorHome.ts'

type JuniorHomeProps = {
  familyId: string
  member: FamilyMember
  home: JuniorHomeData
  onSwitch: () => void
}

export function JuniorHome({ familyId, member, home, onSwitch }: JuniorHomeProps) {
  const [storeOpen, setStoreOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-cream text-navy lg:flex-row">
      <aside className="flex flex-wrap items-center gap-4 bg-sky px-5 py-5 lg:w-60 lg:flex-col lg:items-stretch lg:px-6 lg:py-8">
        <div className="flex items-center gap-3 lg:flex-col lg:items-start">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-semibold lg:h-20 lg:w-20"
          >
            {member.name.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <div>
            <p className="text-xl font-semibold">{member.name}</p>
            <p className="text-sm text-navy/70">Junior view</p>
          </div>
        </div>
        <p className="hidden text-sm font-semibold lg:mt-8 lg:block">Missions</p>
        <button
          className="min-h-14 rounded-2xl border border-navy/15 bg-white px-4 text-sm font-semibold lg:mt-4"
          onClick={() => setStoreOpen(true)}
          type="button"
        >
          Family Marketplace
        </button>
        <button
          className="ml-auto min-h-14 rounded-2xl border border-navy/15 bg-white px-4 text-sm font-semibold lg:ml-0 lg:mt-auto"
          onClick={onSwitch}
          type="button"
        >
          Switch profile
        </button>
      </aside>

      <main aria-busy={!home.ready} className="flex-1 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        {storeOpen ? (
          <Marketplace familyId={familyId} memberId={member.id} onBack={() => setStoreOpen(false)} spend={member.spend} tall />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            <StarBadge stars={home.stars} />
            <GoalBar goal={home.goal} ready={home.ready} />
            <MissionList familyId={familyId} home={home} />
            <OpenBountyList familyId={familyId} memberId={member.id} tall />
          </div>
        )}
      </main>
    </div>
  )
}

function MissionList({ familyId, home }: { familyId: string; home: JuniorHomeData }) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function markDone(missionId: string) {
    setBusyId(missionId)
    setError(null)
    try {
      await submitProof(familyId, missionId)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not mark that mission done.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mt-4" aria-busy={!home.ready}>
      <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Today’s Missions</h2>
      {home.ready && home.missions.length === 0 ? (
        <p className="mt-4 text-base text-navy/70">No missions today.</p>
      ) : null}
      {home.missions.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {home.missions.map((mission) => (
            <li key={mission.id}>
              <MissionCard
                busy={busyId === mission.id}
                mission={mission}
                onDone={() => {
                  void markDone(mission.id)
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
