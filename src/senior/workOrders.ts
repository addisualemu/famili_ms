export type ChecklistItem = {
  text: string
  done: boolean
}

export type WorkOrderStatus = 'open' | 'in_progress' | 'pending_review' | 'completed' | 'rework'

export type SeniorWorkOrder = {
  id: string
  code: string
  title: string
  description: string
  stars: number
  status: WorkOrderStatus
  assignedTo: string | null
  isBounty: boolean
  photoUrls: string[]
  checklist: ChecklistItem[]
}

const STATUSES = new Set<WorkOrderStatus>(['open', 'in_progress', 'pending_review', 'completed', 'rework'])

export function proofIsSubmitted(status: WorkOrderStatus) {
  return status === 'pending_review' || status === 'completed'
}

export function workOrderCode(id: string) {
  const numbered = /^wo_(\d+)$/.exec(id)
  if (numbered) return `WO-${numbered[1]}`
  return id.replace(/^wo_/, 'WO-').replaceAll('_', '-').toUpperCase()
}

export function workOrderFromData(id: string, data: Record<string, unknown>): SeniorWorkOrder | null {
  if (typeof data.title !== 'string' || data.title.length === 0) return null
  if (typeof data.pointValue !== 'number' || !Number.isInteger(data.pointValue)) return null
  return {
    id,
    code: workOrderCode(id),
    title: data.title,
    description: typeof data.description === 'string' ? data.description : '',
    stars: data.pointValue,
    status: readStatus(data.status),
    assignedTo: typeof data.assignedTo === 'string' && data.assignedTo.length > 0 ? data.assignedTo : null,
    isBounty: data.isBounty === true,
    photoUrls: readPhotoUrls(data.proofSubmission),
    checklist: readChecklist(data.checklist),
  }
}

function readPhotoUrls(value: unknown) {
  if (!value || typeof value !== 'object') return []
  const urls = (value as { photoUrls?: unknown }).photoUrls
  if (!Array.isArray(urls)) return []
  return urls
    .filter((url): url is string => typeof url === 'string' && url.startsWith('https://') && url.length < 500)
    .slice(0, 5)
}

function readStatus(value: unknown): WorkOrderStatus {
  if (typeof value === 'string' && STATUSES.has(value as WorkOrderStatus)) return value as WorkOrderStatus
  return 'in_progress'
}

function readChecklist(value: unknown): ChecklistItem[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const text = (item as { text?: unknown }).text
    const done = (item as { done?: unknown }).done
    if (typeof text !== 'string' || text.length === 0 || typeof done !== 'boolean') return []
    return [{ text, done }]
  })
}
