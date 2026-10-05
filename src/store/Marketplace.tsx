import { useState } from 'react'
import { useStoreItems } from '../parent/useStoreItems.ts'
import { type StoreCategory, type StoreItem } from '../parent/storeItems.ts'
import { redeemStoreItem } from './redeemStoreItem.ts'

const SECTIONS: Array<{ category: StoreCategory; label: string }> = [
  { category: 'privilege', label: 'Privileges' },
  { category: 'outing', label: 'Outings' },
  { category: 'physical', label: 'Physical' },
  { category: 'external', label: 'External' },
]

type MarketplaceProps = {
  familyId: string
  memberId: string
  spend: number
  onBack: () => void
  tall?: boolean
}

export function Marketplace({ familyId, memberId, spend, onBack, tall = false }: MarketplaceProps) {
  const store = useStoreItems(familyId)
  const active = store.items.filter((item) => item.active)
  const backClass = tall ? 'min-h-14' : 'min-h-11'

  return (
    <div className="mx-auto w-full max-w-5xl">
      <button className={`${backClass} text-sm font-semibold`} onClick={onBack} type="button">
        Back
      </button>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Family Marketplace</h1>
      <div aria-busy={!store.ready} className="mt-8 grid gap-10">
        {store.ready && active.length === 0 ? <p className="text-base text-navy/70">Nothing in the Family Marketplace yet.</p> : null}
        {SECTIONS.map((section) => {
          const items = active.filter((item) => item.category === section.category)
          if (items.length === 0) return null
          return (
            <section key={section.category}>
              <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">{section.label}</h2>
              <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.id}>
                    <StoreCard item={item} memberId={memberId} spend={spend} tall={tall} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      {store.error ? (
        <p className="mt-4 text-sm text-coral" role="alert">
          {store.error}
        </p>
      ) : null}
    </div>
  )
}

function StoreCard({ item, memberId, spend, tall }: { item: StoreItem; memberId: string; spend: number; tall: boolean }) {
  const affordable = storeOffer(item.pointCost, spend)
  const offer = item.stock === 0 ? { label: 'Out of stock', enabled: false } : affordable
  const buttonClass = tall ? 'min-h-14' : 'min-h-11'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onGet() {
    if (!offer.enabled || busy) return
    setBusy(true)
    setError(null)
    try {
      await redeemStoreItem(memberId, item.id)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not get that item.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="flex h-full flex-col rounded-3xl border border-navy/10 bg-white px-5 py-5">
      {item.imageUrl ? (
        <img alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" src={item.imageUrl} />
      ) : (
        <span aria-hidden="true" className="text-4xl">
          {item.icon || '⭐'}
        </span>
      )}
      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold">
        <svg aria-hidden="true" className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.6 14.7 8.8l6.7.6-5.1 4.3 1.6 6.5L12 16.8 6.1 20.2l1.6-6.5L2.6 9.4l6.7-.6L12 2.6Z" />
        </svg>
        {item.pointCost} {item.pointCost === 1 ? 'Star' : 'Stars'}
      </p>
      <p className="mt-2 text-sm text-navy/70">{availability(item)}</p>
      <button
        className={`${buttonClass} mt-5 w-full rounded-2xl text-sm font-semibold ${
          offer.enabled ? 'bg-navy text-cream' : 'border border-navy/15 text-navy/50'
        }`}
        disabled={!offer.enabled || busy}
        onClick={() => {
          void onGet()
        }}
        type="button"
      >
        {busy ? 'Getting…' : offer.label}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  )
}

export function storeOffer(price: number, spend: number) {
  const gap = price - spend
  if (gap <= 0) return { label: 'Get this', enabled: true }
  const needed = Number.isInteger(gap) ? gap : Math.ceil(gap)
  return { label: `Need ${needed} more ${needed === 1 ? 'Star' : 'Stars'}`, enabled: false }
}

function availability(item: StoreItem) {
  const stock = item.stock < 0 ? 'Unlimited' : item.stock === 0 ? 'Out of stock' : `${item.stock} in stock`
  if (item.cooldownHours <= 0) return stock
  const hours = item.cooldownHours === 1 ? '1 hour cooldown' : `${item.cooldownHours} hours cooldown`
  return `${stock} · ${hours}`
}
