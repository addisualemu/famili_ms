import { useState } from 'react'
import { claimBounty } from './claimBounty.ts'
import { useOpenBounties } from './useOpenBounties.ts'
import type { SeniorWorkOrder } from '../senior/workOrders.ts'

type OpenBountyListProps = {
  familyId: string
  memberId: string
  tall?: boolean
}

export function OpenBountyList({ familyId, memberId, tall = false }: OpenBountyListProps) {
  const { bounties, error } = useOpenBounties(familyId)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)

  async function onClaim(order: SeniorWorkOrder) {
    setBusyId(order.id)
    setClaimError(null)
    try {
      await claimBounty(familyId, order.id, memberId)
    } catch (failure) {
      setClaimError(failure instanceof Error ? failure.message : 'Could not claim that bounty.')
    } finally {
      setBusyId(null)
    }
  }

  if (bounties.length === 0 && !error) return null

  return (
    <section className="mt-10">
      <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Open Bounties</h2>
      {bounties.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4">
          {bounties.map((order) => (
            <li key={order.id}>
              <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase">{order.code}</p>
                <h3 className="mt-2 text-lg font-semibold">{order.title}</h3>
                <p className="mt-3 text-sm font-semibold">
                  {order.stars} {order.stars === 1 ? 'Star' : 'Stars'}
                </p>
                <button
                  className={`mt-4 w-full rounded-2xl bg-navy font-semibold text-cream disabled:opacity-60 ${tall ? 'min-h-14' : 'min-h-11'}`}
                  disabled={busyId === order.id}
                  onClick={() => {
                    void onClaim(order)
                  }}
                  type="button"
                >
                  {busyId === order.id ? 'Claiming…' : 'Claim'}
                </button>
              </article>
            </li>
          ))}
        </ul>
      ) : null}
      {claimError || error ? (
        <p className="mt-4 text-sm text-coral" role="alert">
          {claimError || error}
        </p>
      ) : null}
    </section>
  )
}
