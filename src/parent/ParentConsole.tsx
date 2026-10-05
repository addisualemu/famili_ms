import { useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { useFamilyWorkOrders } from '../senior/useSeniorWorkOrders.ts'
import type { SeniorWorkOrder } from '../senior/workOrders.ts'
import { CreateWorkOrderForm } from './CreateWorkOrderForm.tsx'
import { FulfillmentQueue } from './FulfillmentQueue.tsx'
import { reworkWorkOrder } from './reworkWorkOrder.ts'
import { StoreInventory } from './StoreInventory.tsx'

type ParentConsoleProps = {
  familyId: string
  member: FamilyMember
  members: FamilyMember[]
  onSwitch: () => void
  onSignOut: () => void
  signingOut: boolean
}

const STATUS_LABEL: Record<SeniorWorkOrder['status'], string> = {
  open: 'Open bounty',
  in_progress: 'In progress',
  pending_review: 'Pending review',
  rework: 'Rework',
  completed: 'Done',
}

export function ParentConsole({ familyId, member, members, onSwitch, onSignOut, signingOut }: ParentConsoleProps) {
  const workOrders = useFamilyWorkOrders(familyId)
  const children = members.filter((item) => item.role === 'child')
  const queue = workOrders.orders.filter((order) => order.status === 'pending_review')

  return (
    <div className="min-h-svh bg-cream text-navy">
      <header className="flex flex-wrap items-center gap-3 bg-navy px-4 py-4 text-cream sm:px-8">
        <div className="mr-auto">
          <p className="text-xs font-semibold tracking-[0.16em] uppercase">Parent Console</p>
          <h1 className="text-xl font-semibold">{member.name}</h1>
        </div>
        <button className="min-h-11 rounded-2xl border border-cream/20 px-4 text-sm font-semibold" onClick={onSwitch} type="button">
          Switch profile
        </button>
        <button
          className="min-h-11 rounded-2xl border border-cream/20 px-4 text-sm font-semibold disabled:opacity-60"
          disabled={signingOut}
          onClick={onSignOut}
          type="button"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </header>
      <main className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-6 sm:px-8 lg:grid-cols-2 lg:py-8">
        <section aria-busy={!workOrders.ready}>
          <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Approval Queue</h2>
          <p className="mt-2 text-sm text-navy/70">Rework sends a work order back. Star payout is unavailable on this device.</p>
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
        <section>
          <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Manage Work Orders</h2>
          <CreateWorkOrderForm children={children} familyId={familyId} parentId={member.id} />
          {workOrders.orders.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {workOrders.orders.map((order) => (
                <li key={order.id} className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
                  <p className="text-xs font-semibold tracking-[0.16em] uppercase">{order.code}</p>
                  <h3 className="mt-1 text-base font-semibold">{order.title}</h3>
                  <p className="mt-2 text-sm text-navy/70">{STATUS_LABEL[order.status]}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <div className="lg:col-span-2">
          <FulfillmentQueue familyId={familyId} members={members} />
        </div>
        <div className="lg:col-span-2">
          <StoreInventory familyId={familyId} />
        </div>
      </main>
    </div>
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
        <button className="min-h-11 flex-1 rounded-2xl bg-green text-sm font-semibold text-white opacity-60" disabled type="button">
          Approve
        </button>
        <button
          className="min-h-11 flex-1 rounded-2xl border border-navy/15 text-sm font-semibold"
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
