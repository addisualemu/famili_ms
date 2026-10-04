import { doc, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

const CATEGORIES = ['Daily Habit', 'Chores', 'Schoolwork', 'Deep Clean'] as const

export type WorkOrderCategory = (typeof CATEGORIES)[number]

export type NewWorkOrder = {
  title: string
  description: string
  category: WorkOrderCategory
  stars: number
  dueDate: string
  assigneeId: string | null
  requiresPhoto: boolean
  checklist: string[]
}

export function isWorkOrderCategory(value: string): value is WorkOrderCategory {
  return CATEGORIES.some((category) => category === value)
}

export async function createWorkOrder(familyId: string, parentId: string, draft: NewWorkOrder) {
  const title = draft.title.trim()
  const description = draft.description.trim()
  const checklist = draft.checklist.map((item) => item.trim()).filter((item) => item.length > 0)
  const due = new Date(`${draft.dueDate}T17:00:00`)

  if (title.length === 0 || title.length >= 80) throw new Error('Use a shorter title.')
  if (description.length >= 500) throw new Error('Use a shorter description.')
  if (!isWorkOrderCategory(draft.category)) throw new Error('Choose a category.')
  if (!Number.isInteger(draft.stars) || draft.stars < 0 || draft.stars > 500) throw new Error('Stars must be a whole number from 0 to 500.')
  if (!draft.dueDate || Number.isNaN(due.getTime())) throw new Error('Choose a due date.')
  if (checklist.length > 7 || checklist.some((item) => item.length >= 120)) throw new Error('Use up to 7 shorter checklist steps.')

  const bounty = draft.assigneeId === null
  const ref = doc(db, 'families', familyId, 'workOrders', `wo_${Date.now()}`)
  const batch = writeBatch(db)
  batch.set(ref, {
    title,
    description,
    category: draft.category,
    pointValue: draft.stars,
    assignedTo: bounty ? null : draft.assigneeId,
    isBounty: bounty,
    status: bounty ? 'open' : 'in_progress',
    dueDate: Timestamp.fromDate(due),
    requiresPhoto: draft.requiresPhoto,
    proofSubmission: { photoUrls: [], notes: '', submittedAt: null },
    checklist: checklist.map((text) => ({ text, done: false })),
    createdAt: serverTimestamp(),
    createdBy: parentId,
  })

  try {
    await batch.commit()
  } catch {
    throw new Error('Could not create that work order.')
  }
}
