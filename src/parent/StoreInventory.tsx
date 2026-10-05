import { useState, type FormEvent } from 'react'
import { createStoreItem, updateStoreItem } from './saveStoreItem.ts'
import { storeImageError, uploadStoreImage } from './uploadStoreImage.ts'
import { CATEGORY_LABEL, isStoreCategory, STORE_CATEGORIES, type StoreCategory, type StoreItem } from './storeItems.ts'
import { useStoreItems } from './useStoreItems.ts'

type StoreInventoryProps = {
  familyId: string
}

export function StoreInventory({ familyId }: StoreInventoryProps) {
  const store = useStoreItems(familyId)

  return (
    <section aria-busy={!store.ready}>
      <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Family Store</h2>
      <p className="mt-2 text-sm text-navy/70">Photo, stock, cooldown, and whether an item is active.</p>
      <CreateStoreItemForm familyId={familyId} />
      {store.ready && store.items.length === 0 ? <p className="mt-4 text-base text-navy/70">No store items yet.</p> : null}
      {store.items.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {store.items.map((item) => (
            <li key={item.id}>
              <StoreItemEditor familyId={familyId} item={item} />
            </li>
          ))}
        </ul>
      ) : null}
      {store.error ? (
        <p className="mt-4 text-sm text-coral" role="alert">
          {store.error}
        </p>
      ) : null}
    </section>
  )
}

function CreateStoreItemForm({ familyId }: { familyId: string }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<StoreCategory>('privilege')
  const [stars, setStars] = useState('10')
  const [icon, setIcon] = useState('⭐')
  const [stock, setStock] = useState('1')
  const [cooldown, setCooldown] = useState('0')
  const [active, setActive] = useState(true)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoKey, setPhotoKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isStoreCategory(category)) return
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const imageUrl = photo ? await uploadStoreImage(familyId, photo) : null
      await createStoreItem(familyId, {
        title,
        category,
        pointCost: wholeNumber(stars, 'Stars', 0, 10000),
        icon,
        stock: wholeNumber(stock, 'Stock', -1, 10000),
        cooldownHours: wholeNumber(cooldown, 'Cooldown', 0, 8760),
        active,
        imageUrl,
      })
      setTitle('')
      setPhoto(null)
      setPhotoKey((value) => value + 1)
      setSaved(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not create that store item.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="mt-4 grid gap-3 rounded-3xl border border-navy/10 bg-white px-5 py-5" onSubmit={(event) => void onSubmit(event)}>
      <h3 className="text-lg font-semibold">Create store item</h3>
      <label className="grid gap-1 text-sm font-medium">
        Title
        <input
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          maxLength={79}
          onChange={(event) => setTitle(event.target.value)}
          required
          value={title}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Category
          <select
            className="min-h-11 rounded-2xl border border-navy/15 px-3"
            onChange={(event) => {
              if (isStoreCategory(event.target.value)) setCategory(event.target.value)
            }}
            value={category}
          >
            {STORE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {CATEGORY_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Stars
          <input
            className="min-h-11 rounded-2xl border border-navy/15 px-3"
            inputMode="numeric"
            max={10000}
            min={0}
            onChange={(event) => setStars(event.target.value)}
            required
            type="number"
            value={stars}
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Icon
        <input
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          maxLength={15}
          onChange={(event) => setIcon(event.target.value)}
          value={icon}
        />
      </label>
      <PhotoField key={photoKey} file={photo} onFile={setPhoto} />
      <StockFields
        active={active}
        cooldown={cooldown}
        onActive={setActive}
        onCooldown={setCooldown}
        onStock={setStock}
        stock={stock}
      />
      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className="text-sm font-semibold text-green">Store item created.</p> : null}
      <button className="min-h-11 rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60" disabled={busy} type="submit">
        {busy ? 'Creating…' : 'Create store item'}
      </button>
    </form>
  )
}

function StoreItemEditor({ familyId, item }: { familyId: string; item: StoreItem }) {
  const [stock, setStock] = useState(String(item.stock))
  const [cooldown, setCooldown] = useState(String(item.cooldownHours))
  const [active, setActive] = useState(item.active)
  const [photo, setPhoto] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function onSave() {
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const imageUrl = photo ? await uploadStoreImage(familyId, photo) : item.imageUrl
      await updateStoreItem(familyId, item, {
        stock: wholeNumber(stock, 'Stock', -1, 10000),
        cooldownHours: wholeNumber(cooldown, 'Cooldown', 0, 8760),
        active,
        imageUrl,
      })
      setPhoto(null)
      setSaved(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save that store item.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-3xl border border-navy/10 bg-white px-5 py-4">
      <div className="flex items-start gap-3">
        {item.imageUrl ? (
          <img alt="" className="h-16 w-16 rounded-2xl object-cover" src={item.imageUrl} />
        ) : (
          <span aria-hidden="true" className="text-2xl">
            {item.icon || '⭐'}
          </span>
        )}
        <div>
          <h3 className="text-base font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-navy/70">
            {CATEGORY_LABEL[item.category]} · {item.pointCost} {item.pointCost === 1 ? 'Star' : 'Stars'}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <PhotoField file={photo} onFile={setPhoto} />
        <StockFields
          active={active}
          cooldown={cooldown}
          onActive={setActive}
          onCooldown={setCooldown}
          onStock={setStock}
          stock={stock}
        />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className="mt-3 text-sm font-semibold text-green">Saved.</p> : null}
      <button
        className="mt-3 min-h-11 rounded-2xl bg-navy px-4 text-sm font-semibold text-cream disabled:opacity-60"
        disabled={busy}
        onClick={() => {
          void onSave()
        }}
        type="button"
      >
        {busy ? 'Saving…' : 'Save item'}
      </button>
    </article>
  )
}

function wholeNumber(value: string, label: string, min: number, max: number) {
  if (!/^-?\d+$/.test(value.trim())) throw new Error(`${label} must be a whole number.`)
  const number = Number(value)
  if (number < min || number > max) throw new Error(`${label} must be from ${min} to ${max}.`)
  return number
}

function StockFields({
  stock,
  cooldown,
  active,
  onStock,
  onCooldown,
  onActive,
}: {
  stock: string
  cooldown: string
  active: boolean
  onStock: (value: string) => void
  onCooldown: (value: string) => void
  onActive: (value: boolean) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-medium">
        Stock
        <input
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          inputMode="numeric"
          max={10000}
          min={-1}
          onChange={(event) => onStock(event.target.value)}
          required
          type="number"
          value={stock}
        />
        <span className="text-xs font-normal text-navy/60">-1 means unlimited.</span>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Cooldown hours
        <input
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          inputMode="numeric"
          max={8760}
          min={0}
          onChange={(event) => onCooldown(event.target.value)}
          required
          type="number"
          value={cooldown}
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium sm:col-span-2">
        <input checked={active} className="h-5 w-5" onChange={(event) => onActive(event.target.checked)} type="checkbox" />
        Active
      </label>
    </div>
  )
}

function PhotoField({ file, onFile }: { file: File | null; onFile: (file: File | null) => void }) {
  const [error, setError] = useState<string | null>(null)

  return (
    <label className="grid gap-1 text-sm font-medium">
      Photo
      <input
        accept="image/*"
        className="min-h-11 text-sm"
        onChange={(event) => {
          const next = event.target.files?.[0] ?? null
          if (!next) {
            onFile(null)
            setError(null)
            return
          }
          const problem = storeImageError(next)
          setError(problem)
          onFile(problem ? null : next)
        }}
        type="file"
      />
      {file ? <span className="text-xs font-normal text-navy/60">{file.name}</span> : null}
      {error ? <span className="text-sm font-normal text-coral">{error}</span> : null}
    </label>
  )
}
