import { missionIsDone, type JuniorMission } from './board.ts'

type MissionCardProps = {
  mission: JuniorMission
  busy?: boolean
  onDone?: () => void
}

export function MissionCard({ mission, busy = false, onDone }: MissionCardProps) {
  const done = missionIsDone(mission.status)

  return (
    <article className="flex flex-col rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 h-8 w-8 shrink-0 rounded-xl border border-navy/15 bg-cream"
        />
        <h3 className="text-lg font-semibold leading-7">{mission.title}</h3>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
        <svg aria-hidden="true" className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.6 14.7 8.8l6.7.6-5.1 4.3 1.6 6.5L12 16.8 6.1 20.2l1.6-6.5L2.6 9.4l6.7-.6L12 2.6Z" />
        </svg>
        {mission.pointValue} {mission.pointValue === 1 ? 'Star' : 'Stars'}
      </p>
      {done || !onDone ? (
        <p
          className={
            done
              ? 'mt-4 flex min-h-14 items-center justify-center rounded-full bg-green text-sm font-semibold tracking-wide text-white uppercase'
              : 'mt-4 flex min-h-14 items-center justify-center rounded-full border-2 border-coral text-sm font-semibold tracking-wide text-coral uppercase'
          }
        >
          {done ? 'Done' : 'Not done'}
        </p>
      ) : (
        <button
          className="mt-4 flex min-h-14 items-center justify-center rounded-full border-2 border-coral text-sm font-semibold tracking-wide text-coral uppercase disabled:opacity-60"
          disabled={busy}
          onClick={onDone}
          type="button"
        >
          {busy ? 'Saving…' : 'Done'}
        </button>
      )}
    </article>
  )
}
