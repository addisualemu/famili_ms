import { useState, type FormEvent } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { createWorkOrder, isWorkOrderCategory, type WorkOrderCategory } from './createWorkOrder.ts'

const CATEGORIES: WorkOrderCategory[] = ['Daily Habit', 'Chores', 'Schoolwork', 'Deep Clean']

type CreateWorkOrderFormProps = {
  familyId: string
  parentId: string
  children: FamilyMember[]
}

export function CreateWorkOrderForm({ familyId, parentId, children }: CreateWorkOrderFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<WorkOrderCategory>('Chores')
  const [stars, setStars] = useState('10')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState(children[0]?.id ?? 'bounty')
  const [requiresPhoto, setRequiresPhoto] = useState(false)
  const [steps, setSteps] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isWorkOrderCategory(category)) return
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      await createWorkOrder(familyId, parentId, {
        title,
        description,
        category,
        stars: Number(stars),
        dueDate,
        assigneeId: assigneeId === 'bounty' ? null : assigneeId,
        requiresPhoto,
        checklist: steps.split('\n'),
      })
      setTitle('')
      setDescription('')
      setSteps('')
      setRequiresPhoto(false)
      setSaved(true)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not create that work order.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="mt-4 grid gap-3 rounded-3xl border border-navy/10 bg-white px-5 py-5" onSubmit={(event) => void onSubmit(event)}>
      <h3 className="text-lg font-semibold">Create work order</h3>
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
      <label className="grid gap-1 text-sm font-medium">
        Description
        <textarea
          className="min-h-20 rounded-2xl border border-navy/15 px-3 py-2"
          maxLength={499}
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Category
        <select
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          onChange={(event) => {
            if (isWorkOrderCategory(event.target.value)) setCategory(event.target.value)
          }}
          value={category}
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Stars
          <input
            className="min-h-11 rounded-2xl border border-navy/15 px-3"
            inputMode="numeric"
            max={500}
            min={0}
            onChange={(event) => setStars(event.target.value)}
            required
            type="number"
            value={stars}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Due date
          <input
            className="min-h-11 rounded-2xl border border-navy/15 px-3"
            onChange={(event) => setDueDate(event.target.value)}
            required
            type="date"
            value={dueDate}
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Assign to
        <select
          className="min-h-11 rounded-2xl border border-navy/15 px-3"
          onChange={(event) => setAssigneeId(event.target.value)}
          value={assigneeId}
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
          <option value="bounty">Open bounty</option>
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input checked={requiresPhoto} className="h-5 w-5" onChange={(event) => setRequiresPhoto(event.target.checked)} type="checkbox" />
        Photo required
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Checklist
        <textarea
          className="min-h-20 rounded-2xl border border-navy/15 px-3 py-2"
          onChange={(event) => setSteps(event.target.value)}
          placeholder="One step per line"
          value={steps}
        />
      </label>
      {error ? (
        <p className="text-sm text-coral" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? <p className="text-sm font-semibold text-green">Work order created.</p> : null}
      <button className="min-h-11 rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60" disabled={busy} type="submit">
        {busy ? 'Creating…' : 'Create work order'}
      </button>
    </form>
  )
}
