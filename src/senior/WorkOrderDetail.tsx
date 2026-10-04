import type { FamilyMember } from '../family/seedFamily.ts'
import { proofIsSubmitted, type SeniorWorkOrder } from './workOrders.ts'
import { useWorkOrderMessages } from './useWorkOrderMessages.ts'
import { WorkOrderThread } from './WorkOrderThread.tsx'

type WorkOrderDetailProps = {
  familyId: string
  member: FamilyMember
  order: SeniorWorkOrder
  busyKey: string | null
  submitting?: boolean
  onBack: () => void
  onToggle: (index: number) => void
  onSubmit?: () => void
}

export function WorkOrderDetail({
  familyId,
  member,
  order,
  busyKey,
  submitting = false,
  onBack,
  onToggle,
  onSubmit,
}: WorkOrderDetailProps) {
  const submitted = proofIsSubmitted(order.status)
  const checklistLocked = member.role === 'child' && submitted
  const notes = useWorkOrderMessages(familyId, order.id)
  const feedback = [...notes.messages].reverse().find((message) => message.senderId !== member.id)
  const submitLabel =
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
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-5">
      <button className="min-h-11 text-sm font-semibold" onClick={onBack} type="button">
        Back
      </button>
      <p className="mt-4 text-xs font-semibold tracking-[0.16em] uppercase">{order.code}</p>
      <h3 className="mt-2 text-2xl font-semibold">{order.title}</h3>
      {order.description ? <p className="mt-3 text-sm leading-6 text-navy/70">{order.description}</p> : null}
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
        <svg aria-hidden="true" className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.6 14.7 8.8l6.7.6-5.1 4.3 1.6 6.5L12 16.8 6.1 20.2l1.6-6.5L2.6 9.4l6.7-.6L12 2.6Z" />
        </svg>
        {order.stars} {order.stars === 1 ? 'Star' : 'Stars'}
      </p>
      {order.status === 'rework' ? <p className="mt-4 text-sm font-semibold text-coral">Sent back for rework.</p> : null}
      {feedback ? (
        <p className="mt-4 rounded-2xl bg-cream px-3 py-3 text-sm leading-6">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase">{feedback.senderName}</span>
          <span className="mt-1 block">{feedback.text}</span>
        </p>
      ) : null}
      <h4 className="mt-6 text-xs font-semibold tracking-[0.16em] uppercase">Checklist</h4>
      {order.checklist.length === 0 ? (
        <p className="mt-3 text-sm text-navy/70">No checklist.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
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
      )}
      {onSubmit ? (
        <button
          className="mt-6 min-h-11 w-full rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60"
          disabled={submitted || submitting}
          onClick={onSubmit}
          type="button"
        >
          {submitLabel}
        </button>
      ) : submitted ? (
        <p className="mt-6 text-sm font-semibold">{order.status === 'completed' ? 'Done' : 'Pending review'}</p>
      ) : null}
      <WorkOrderThread familyId={familyId} member={member} workOrderId={order.id} />
    </article>
  )
}
