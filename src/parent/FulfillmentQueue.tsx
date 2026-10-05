import { useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import type { PurchaseOrder } from './purchaseOrders.ts'
import { deliverPurchaseOrder, fulfillPurchaseOrder } from './updatePurchaseOrder.ts'
import { usePurchaseOrders } from './usePurchaseOrders.ts'

type FulfillmentQueueProps = {
  familyId: string
  members: FamilyMember[]
}

export function FulfillmentQueue({ familyId, members }: FulfillmentQueueProps) {
  const purchases = usePurchaseOrders(familyId)
  const open = purchases.orders.filter((order) => !order.delivered && order.status !== 'cancelled')

  return (
    <section aria-busy={!purchases.ready}>
      <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Fulfillment Queue</h2>
      <p className="mt-2 text-sm text-navy/70">Fulfill a redemption, then mark it delivered.</p>
      {purchases.ready && open.length === 0 ? <p className="mt-4 text-base text-navy/70">Nothing to fulfill.</p> : null}
      {open.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {open.map((order) => (
            <li key={order.id}>
              <FulfillmentRow
                childName={members.find((member) => member.id === order.childId)?.name ?? 'Child'}
                familyId={familyId}
                order={order}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {purchases.error ? (
        <p className="mt-4 text-sm text-coral" role="alert">
          {purchases.error}
        </p>
      ) : null}
    </section>
  )
}

function FulfillmentRow({
  familyId,
  order,
  childName,
}: {
  familyId: string
  order: PurchaseOrder
  childName: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = order.status === 'pending_fulfillment'

  async function onAction() {
    setBusy(true)
    setError(null)
    try {
      if (pending) await fulfillPurchaseOrder(familyId, order.id)
      else await deliverPurchaseOrder(familyId, order.id)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not update that order.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <p className="text-sm font-semibold">{childName}</p>
      <h3 className="mt-1 text-lg font-semibold">{order.itemTitle}</h3>
      <p className="mt-1 text-sm font-semibold">
        {order.pointCost} {order.pointCost === 1 ? 'Star' : 'Stars'}
      </p>
      <button
        className="mt-4 min-h-11 rounded-2xl bg-navy px-4 text-sm font-semibold text-cream disabled:opacity-60"
        disabled={busy}
        onClick={() => {
          void onAction()
        }}
        type="button"
      >
        {busy ? 'Saving…' : pending ? 'Fulfill' : 'Deliver'}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  )
}
