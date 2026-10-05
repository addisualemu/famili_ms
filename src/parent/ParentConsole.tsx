import { useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { useFamilyWorkOrders } from '../senior/useSeniorWorkOrders.ts'
import type { SeniorWorkOrder } from '../senior/workOrders.ts'
import { approveWorkOrder } from './approveWorkOrder.ts'
import { CreateWorkOrderForm } from './CreateWorkOrderForm.tsx'
import { FulfillmentQueue } from './FulfillmentQueue.tsx'
import { reworkWorkOrder } from './reworkWorkOrder.ts'
import { Profiles } from './Profiles.tsx'
import { StoreInventory } from './StoreInventory.tsx'
import { usePurchaseOrders } from './usePurchaseOrders.ts'

type ParentConsoleProps = {
  familyId: string
  member: FamilyMember
  members: FamilyMember[]
  onSwitch: () => void
  onSignOut: () => void
  signingOut: boolean
}

type Place = 'queue' | 'create' | 'orders' | 'fulfillment' | 'store' | 'profiles'
type OrderFilter = 'all' | SeniorWorkOrder['status']

const PLACES: { id: Place; label: string }[] = [
  { id: 'queue', label: 'Approval Queue' },
  { id: 'create', label: 'Create' },
  { id: 'orders', label: 'Work Orders' },
  { id: 'fulfillment', label: 'Fulfillment' },
  { id: 'store', label: 'Family Store' },
  { id: 'profiles', label: 'Profiles' },
]

const FILTERS: { id: OrderFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending_review', label: 'Pending review' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'rework', label: 'Rework' },
  { id: 'open', label: 'Open bounty' },
  { id: 'completed', label: 'Done' },
]

const STATUS_LABEL: Record<SeniorWorkOrder['status'], string> = {
  open: 'Open bounty',
  in_progress: 'In progress',
  pending_review: 'Pending review',
  rework: 'Rework',
  completed: 'Done',
}

const STATUS_TONE: Record<SeniorWorkOrder['status'], string> = {
  open: 'bg-sky text-navy',
  in_progress: 'bg-cream text-navy',
  pending_review: 'bg-coral/15 text-coral',
  rework: 'bg-gold/30 text-navy',
  completed: 'bg-green/20 text-navy',
}

export function ParentConsole({ familyId, member, members, onSwitch, onSignOut, signingOut }: ParentConsoleProps) {
  const workOrders = useFamilyWorkOrders(familyId)
  const purchases = usePurchaseOrders(familyId)
  const [place, setPlace] = useState<Place>('queue')
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all')
  const children = members.filter((item) => item.role === 'child')
  const queue = workOrders.orders.filter((order) => order.status === 'pending_review')
  const visibleOrders =
    orderFilter === 'all' ? workOrders.orders : workOrders.orders.filter((order) => order.status === orderFilter)
  const fulfillCount = purchases.orders.filter((order) => !order.delivered && order.status !== 'cancelled').length
  const counts: Partial<Record<Place, number>> = {
    queue: queue.length,
    fulfillment: fulfillCount,
  }

  return (
    <div className="flex min-h-svh flex-col bg-cream text-navy lg:flex-row">
      <header className="bg-navy text-cream lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:px-5 lg:py-6">
        <div className="flex flex-wrap items-center gap-3 px-4 py-4 lg:px-0 lg:py-0">
          <div className="mr-auto">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase">Parent Console</p>
            <h1 className="text-xl font-semibold">{member.name}</h1>
          </div>
          <div className="flex gap-2 lg:hidden">
            <HeaderButton label="Switch profile" onClick={onSwitch} />
            <HeaderButton disabled={signingOut} label={signingOut ? 'Signing out…' : 'Sign out'} onClick={onSignOut} />
          </div>
        </div>
        <nav
          aria-label="Parent Console"
          className="flex flex-wrap gap-2 px-4 pb-4 lg:mt-8 lg:flex-col lg:flex-nowrap lg:px-0 lg:pb-0"
        >
          {PLACES.map((item) => (
            <button
              aria-current={place === item.id ? 'page' : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-2xl px-4 text-sm font-semibold ${
                place === item.id ? 'bg-cream text-navy' : 'border border-cream/20 text-cream'
              }`}
              key={item.id}
              onClick={() => setPlace(item.id)}
              type="button"
            >
              {item.label}
              {counts[item.id] ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-coral px-1.5 text-xs text-white">
                  {counts[item.id]}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden gap-2 lg:grid">
          <HeaderButton label="Switch profile" onClick={onSwitch} />
          <HeaderButton disabled={signingOut} label={signingOut ? 'Signing out…' : 'Sign out'} onClick={onSignOut} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-8 lg:py-8">
        {place === 'queue' ? (
          <section aria-busy={!workOrders.ready}>
            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Approval Queue</h2>
            <p className="mt-2 text-sm text-navy/70">Approve pays Stars. Rework sends a work order back.</p>
            {workOrders.ready && queue.length === 0 ? <p className="mt-4 text-base text-navy/70">Nothing to review.</p> : null}
            <ul className="mt-4 grid gap-4">
              {queue.map((order) => (
                <li key={order.id}>
                  <ApprovalRow
                    childName={members.find((item) => item.id === order.assignedTo)?.name ?? 'Child'}
                    familyId={familyId}
                    member={member}
                    order={order}
                  />
                </li>
              ))}
            </ul>
            {workOrders.error ? (
              <p className="mt-4 text-sm text-coral" role="alert">
                {workOrders.error}
              </p>
            ) : null}
          </section>
        ) : null}

        {place === 'create' ? (
          <section>
            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Create</h2>
            <p className="mt-2 text-sm text-navy/70">Assign a child or post an open bounty.</p>
            <CreateWorkOrderForm children={children} familyId={familyId} parentId={member.id} />
          </section>
        ) : null}

        {place === 'orders' ? (
          <section aria-busy={!workOrders.ready}>
            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Work Orders</h2>
            <p className="mt-2 text-sm text-navy/70">Every work order in the family.</p>
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {FILTERS.map((filter) => (
                <button
                  aria-pressed={orderFilter === filter.id}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold ${
                    orderFilter === filter.id ? 'bg-navy text-cream' : 'border border-navy/15 bg-white text-navy'
                  }`}
                  key={filter.id}
                  onClick={() => setOrderFilter(filter.id)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {workOrders.ready && visibleOrders.length === 0 ? (
              <p className="mt-4 text-base text-navy/70">No work orders here.</p>
            ) : null}
            <ul className="mt-4 grid gap-3">
              {visibleOrders.map((order) => (
                <li key={order.id}>
                  <WorkOrderSummary members={members} order={order} />
                </li>
              ))}
            </ul>
            {workOrders.error ? (
              <p className="mt-4 text-sm text-coral" role="alert">
                {workOrders.error}
              </p>
            ) : null}
          </section>
        ) : null}

        {place === 'fulfillment' ? <FulfillmentQueue familyId={familyId} members={members} /> : null}
        {place === 'store' ? <StoreInventory familyId={familyId} /> : null}
        {place === 'profiles' ? <Profiles familyId={familyId} members={members} /> : null}
      </main>
    </div>
  )
}

function HeaderButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      className="min-h-11 rounded-2xl border border-cream/20 px-4 text-sm font-semibold disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function WorkOrderSummary({ members, order }: { members: FamilyMember[]; order: SeniorWorkOrder }) {
  const assignee = order.assignedTo
    ? (members.find((item) => item.id === order.assignedTo)?.name ?? 'Child')
    : order.isBounty
      ? 'Open bounty'
      : 'Unassigned'

  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase">{order.code}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold">{order.title}</h3>
      <p className="mt-2 text-sm text-navy/70">
        {assignee} · {order.stars} {order.stars === 1 ? 'Star' : 'Stars'}
      </p>
    </article>
  )
}

function ApprovalRow({
  familyId,
  member,
  order,
  childName,
}: {
  familyId: string
  member: FamilyMember
  order: SeniorWorkOrder
  childName: string
}) {
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photo = order.photoUrls[0]

  async function onApprove() {
    setBusy(true)
    setError(null)
    try {
      await approveWorkOrder(order.id)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not approve that work order.')
    } finally {
      setBusy(false)
    }
  }

  async function onRework() {
    setBusy(true)
    setError(null)
    try {
      await reworkWorkOrder(familyId, order.id, member.id, member.name, note)
      setNote('')
      setOpen(false)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not send that work order back.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex gap-3">
        {photo ? (
          <img alt="" className="h-16 w-16 rounded-2xl object-cover" src={photo} />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream text-center text-xs text-navy/50">No photo</span>
        )}
        <div>
          <p className="text-sm font-semibold">{childName}</p>
          <h3 className="mt-1 text-lg font-semibold">{order.title}</h3>
          <p className="mt-1 text-sm font-semibold">
            {order.stars} {order.stars === 1 ? 'Star' : 'Stars'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          className="min-h-11 flex-1 rounded-2xl bg-green text-sm font-semibold text-white disabled:opacity-60"
          disabled={busy}
          onClick={() => {
            void onApprove()
          }}
          type="button"
        >
          {busy && !open ? 'Approving…' : 'Approve'}
        </button>
        <button
          className="min-h-11 flex-1 rounded-2xl border border-navy/15 text-sm font-semibold disabled:opacity-60"
          disabled={busy}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          Rework
        </button>
      </div>
      {open ? (
        <div className="mt-3 grid gap-2">
          <label className="sr-only" htmlFor={`rework-${order.id}`}>
            Rework note
          </label>
          <textarea
            className="min-h-20 rounded-2xl border border-navy/15 px-3 py-2 text-sm"
            id={`rework-${order.id}`}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What should they fix?"
            value={note}
          />
          <button
            className="min-h-11 rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60"
            disabled={busy || note.trim().length === 0}
            onClick={() => {
              void onRework()
            }}
            type="button"
          >
            {busy ? 'Sending…' : 'Send back'}
          </button>
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
