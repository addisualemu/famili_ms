import { useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { OpenBountyList } from '../bounty/OpenBountyList.tsx'
import { Marketplace } from '../store/Marketplace.tsx'
import { AccountCard } from './AccountCard.tsx'
import { submitProof } from './submitProof.ts'
import { toggleChecklist } from './toggleChecklist.ts'
import { useSeniorWorkOrders } from './useSeniorWorkOrders.ts'
import { proofIsSubmitted } from './workOrders.ts'
import { WorkOrderDetail } from './WorkOrderDetail.tsx'
import { WorkOrderRow } from './WorkOrderRow.tsx'

type SeniorDashboardProps = {
  familyId: string
  member: FamilyMember
  onSwitch: () => void
}

export function SeniorDashboard({ familyId, member, onSwitch }: SeniorDashboardProps) {
  const workOrders = useSeniorWorkOrders(familyId, member.id)
  const [openId, setOpenId] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [storeOpen, setStoreOpen] = useState(false)
  const openOrder = workOrders.orders.find((order) => order.id === openId) ?? null

  async function onSubmit(orderId: string, status: (typeof workOrders.orders)[number]['status']) {
    if (proofIsSubmitted(status) || submittingId) return
    setSubmittingId(orderId)
    setSubmitError(null)
    try {
      await submitProof(familyId, orderId)
    } catch (submitFailure) {
      setSubmitError(submitFailure instanceof Error ? submitFailure.message : 'Could not submit that work order.')
    } finally {
      setSubmittingId(null)
    }
  }

  async function onToggle(orderId: string, checklist: (typeof workOrders.orders)[number]['checklist'], index: number) {
    const key = `${orderId}:${index}`
    setBusyKey(key)
    setToggleError(null)
    try {
      await toggleChecklist(familyId, orderId, checklist, index)
    } catch (toggleFailure) {
      setToggleError(toggleFailure instanceof Error ? toggleFailure.message : 'Could not update the checklist.')
    } finally {
      setBusyKey(null)
    }
  }
  return (
    <div className="flex min-h-svh flex-col bg-cream text-navy lg:flex-row">
      <aside className="flex flex-wrap items-center gap-4 bg-navy px-5 py-5 text-cream lg:w-60 lg:flex-col lg:items-stretch lg:px-6 lg:py-8">
        <div className="flex items-center gap-3 lg:flex-col lg:items-start">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-2xl font-semibold text-navy lg:h-20 lg:w-20"
          >
            {member.name.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <div>
            <p className="text-xl font-semibold">{member.name}</p>
            <p className="text-sm text-cream/70">Senior view</p>
          </div>
        </div>
        <p className="hidden text-sm font-semibold lg:mt-8 lg:block">Accounts</p>
        <button
          className="min-h-11 rounded-2xl border border-cream/20 px-4 text-sm font-semibold lg:mt-4"
          onClick={() => setStoreOpen(false)}
          type="button"
        >
          Work Orders
        </button>
        <button
          className="min-h-11 rounded-2xl border border-cream/20 px-4 text-sm font-semibold lg:mt-3"
          onClick={() => setStoreOpen(true)}
          type="button"
        >
          Family Marketplace
        </button>
        <button
          className="ml-auto min-h-11 rounded-2xl border border-cream/20 px-4 text-sm font-semibold lg:ml-0 lg:mt-auto"
          onClick={onSwitch}
          type="button"
        >
          Switch profile
        </button>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
        {storeOpen ? (
          <Marketplace familyId={familyId} memberId={member.id} onBack={() => setStoreOpen(false)} spend={member.spend} />
        ) : (
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight">{member.name}&apos;s Dashboard</h1>
          <section className="mt-8">
            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Accounts</h2>
            <ul className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <li>
                <AccountCard label="Spend" stars={member.spend} />
              </li>
              <li>
                <AccountCard label="Save" stars={member.save} />
              </li>
              <li>
                <AccountCard label="Give" stars={member.give} />
              </li>
            </ul>
          </section>
          <section aria-busy={!workOrders.ready} className="mt-10">
            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Work Orders</h2>
            {workOrders.ready && workOrders.orders.length === 0 ? (
              <p className="mt-4 text-base text-navy/70">No work orders.</p>
            ) : null}
            {openOrder ? (
              <div className="mt-4">
                <WorkOrderDetail
                  busyKey={busyKey}
                  familyId={familyId}
                  member={member}
                  onBack={() => {
                    setOpenId(null)
                    setToggleError(null)
                    setSubmitError(null)
                  }}
                  onSubmit={() => {
                    void onSubmit(openOrder.id, openOrder.status)
                  }}
                  onToggle={(index) => {
                    void onToggle(openOrder.id, openOrder.checklist, index)
                  }}
                  order={openOrder}
                  submitting={submittingId === openOrder.id}
                />
              </div>
            ) : null}
            {!openOrder && workOrders.orders.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 gap-4">
                {workOrders.orders.map((order) => (
                  <li key={order.id}>
                    <WorkOrderRow
                      busyKey={busyKey}
                      checklistLocked={proofIsSubmitted(order.status)}
                      familyId={familyId}
                      memberId={member.id}
                      onSubmit={() => {
                        void onSubmit(order.id, order.status)
                      }}
                      onToggle={(index) => {
                        void onToggle(order.id, order.checklist, index)
                      }}
                      onView={() => setOpenId(order.id)}
                      order={order}
                      submitting={submittingId === order.id}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            {toggleError || submitError ? (
              <p className="mt-4 text-sm text-coral" role="alert">
                {submitError || toggleError}
              </p>
            ) : null}
            {workOrders.error ? (
              <p className="mt-4 text-sm text-coral" role="alert">
                {workOrders.error}
              </p>
            ) : null}
          </section>
          <OpenBountyList familyId={familyId} memberId={member.id} />
        </div>
        )}
      </main>
    </div>
  )
}
