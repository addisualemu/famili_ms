export type JuniorMissionStatus = 'open' | 'in_progress' | 'pending_review' | 'completed' | 'rework'

export type JuniorMission = {
  id: string
  title: string
  pointValue: number
  status: JuniorMissionStatus
  requiresPhoto: boolean
}

export function missionIsDone(status: JuniorMissionStatus) {
  return status === 'pending_review' || status === 'completed'
}

export type JuniorGoal = {
  id: string
  name: string
  current: number
  target: number
}

const STATUSES = new Set<JuniorMissionStatus>([
  'open',
  'in_progress',
  'pending_review',
  'completed',
  'rework',
])

export function isSameLocalDay(value: Date, now = new Date()) {
  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  )
}

export function missionFromData(
  id: string,
  data: Record<string, unknown>,
  now = new Date(),
): JuniorMission | null {
  if (typeof data.title !== 'string' || data.title.length === 0) return null
  if (typeof data.pointValue !== 'number' || !Number.isInteger(data.pointValue)) return null
  if (!isStatus(data.status)) return null
  const due = readDate(data.dueDate)
  const onTheList =
    data.status === 'open' ||
    data.status === 'in_progress' ||
    data.status === 'rework' ||
    data.status === 'pending_review'
  if (!onTheList && (!due || !isSameLocalDay(due, now))) return null
  return {
    id,
    title: data.title,
    pointValue: data.pointValue,
    status: data.status,
    requiresPhoto: data.requiresPhoto === true,
  }
}

export function goalFromItem(
  id: string,
  data: Record<string, unknown> | undefined,
  stars: number,
): JuniorGoal | null {
  if (!data) return null
  if (typeof data.title !== 'string' || data.title.length === 0) return null
  if (typeof data.pointCost !== 'number' || !Number.isInteger(data.pointCost)) return null
  return { id, name: data.title, current: stars, target: data.pointCost }
}

function isStatus(value: unknown): value is JuniorMissionStatus {
  return typeof value === 'string' && STATUSES.has(value as JuniorMissionStatus)
}

function readDate(value: unknown) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (value && typeof value === 'object' && 'toDate' in value) {
    const toDate = (value as { toDate?: unknown }).toDate
    if (typeof toDate !== 'function') return null
    const date = toDate.call(value) as unknown
    if (date instanceof Date && !Number.isNaN(date.getTime())) return date
  }
  return null
}
