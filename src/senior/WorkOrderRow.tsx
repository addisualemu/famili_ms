import { proofIsSubmitted, type SeniorWorkOrder } from './workOrders.ts'
import { useWorkOrderMessages } from './useWorkOrderMessages.ts'

type WorkOrderRowProps = {
  order: SeniorWorkOrder
  familyId: string
  memberId: string
  onView: () => void
  onSubmit?: () => void
  onToggle?: (index: number) => void
  busyKey?: string | null
  checklistLocked?: boolean
  submitting?: boolean
}

export function WorkOrderRow({
  order,
  familyId,
  memberId,
  onView,
  onSubmit,
  onToggle,
  busyKey = null,
  checklistLocked = false,
  submitting = false,
}: WorkOrderRowProps) {
  const notes = useWorkOrderMessages(familyId, order.id)
  const feedback = [...notes.messages].reverse().find((message) => message.senderId !== memberId)
  const marked = order.status === 'rework' || Boolean(feedback)
  const submitted = proofIsSubmitted(order.status)
  const label =
    order.status === 'rework'
      ? 'Submit again'
      : order.status === 'pending_review'
        ? 'Pending review'
        : order.status === 'completed'
          ? 'Done'
          : submitting
            ? 'Submitting…'
            : 'Submit'

  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase">{order.code}</p>
        {marked ? <p className="rounded-full bg-coral px-3 py-1 text-xs font-semibold tracking-[0.12em] text-white uppercase">Rework</p> : null}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{order.title}</h3>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
        <svg aria-hidden="true" className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.6 14.7 8.8l6.7.6-5.1 4.3 1.6 6.5L12 16.8 6.1 20.2l1.6-6.5L2.6 9.4l6.7-.6L12 2.6Z" />
        </svg>
        {order.stars} {order.stars === 1 ? 'Star' : 'Stars'}
      </p>
      {feedback ? <p className="mt-3 text-sm leading-6 text-coral">{feedback.text}</p> : null}
      {onToggle && order.checklist.length > 0 ? (
        <ul className="mt-4 grid gap-2 lg:hidden">
          {order.checklist.map((item, index) => (
            <li key={item.text}>
              <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-navy/10 px-3">
                <input
                  checked={item.done}
                  className="h-5 w-5"
                  disabled={checklistLocked || busyKey === `${order.id}:${index}`}
                  onChange={() => onToggle(index)}
                  type="checkbox"
                />
                <span className={item.done ? 'text-navy/50 line-through' : 'font-medium'}>{item.text}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex gap-3">
        <button
          className="min-h-11 flex-1 rounded-2xl border border-navy/15 text-sm font-semibold"
          onClick={onView}
          type="button"
        >
          View
        </button>
        <button
          className="min-h-11 flex-1 rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60"
          disabled={submitted || submitting}
          onClick={onSubmit}
          type="button"
        >
          {label}
        </button>
      </div>
    </article>
  )
}
