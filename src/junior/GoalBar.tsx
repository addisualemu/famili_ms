import type { JuniorGoal } from './board.ts'

type GoalBarProps = {
  goal: JuniorGoal | null
  ready: boolean
}

export function GoalBar({ goal, ready }: GoalBarProps) {
  if (!ready) {
    return <section aria-busy="true" className="min-h-24 rounded-3xl border border-navy/10 bg-white" />
  }

  if (!goal) {
    return (
      <section className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase">Goal</p>
        <p className="mt-2 text-base text-navy/70">No goal yet.</p>
      </section>
    )
  }

  const percent = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0

  return (
    <section className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">
          <span className="mr-2 text-xs font-semibold tracking-[0.16em] uppercase">Goal</span>
          {goal.name}
        </h2>
        <p className="shrink-0 text-sm font-semibold">
          {goal.current}/{goal.target}
        </p>
      </div>
      <div
        aria-label={`${goal.name}, ${goal.current} of ${goal.target} Stars`}
        aria-valuemax={goal.target}
        aria-valuemin={0}
        aria-valuenow={Math.min(goal.current, goal.target)}
        className="mt-3 h-4 overflow-hidden rounded-full bg-cream"
        role="progressbar"
      >
        <div className="h-full rounded-full bg-green" style={{ width: `${percent}%` }} />
      </div>
    </section>
  )
}
