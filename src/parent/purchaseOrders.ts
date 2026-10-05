export type PurchaseStatus = 'pending_fulfillment' | 'fulfilled' | 'cancelled'

export type PurchaseOrder = {
  id: string
  childId: string
  itemId: string
  itemTitle: string
  pointCost: number
  status: PurchaseStatus
  delivered: boolean
}

const STATUSES = new Set<PurchaseStatus>(['pending_fulfillment', 'fulfilled', 'cancelled'])

export function purchaseOrderFromData(id: string, data: Record<string, unknown>): PurchaseOrder | null {
  if (typeof data.childId !== 'string' || data.childId.length === 0) return null
  if (typeof data.itemId !== 'string' || data.itemId.length === 0) return null
  if (typeof data.itemTitle !== 'string' || data.itemTitle.length === 0) return null
  if (typeof data.pointCost !== 'number' || !Number.isInteger(data.pointCost)) return null
  if (typeof data.status !== 'string' || !STATUSES.has(data.status as PurchaseStatus)) return null
  return {
    id,
    childId: data.childId,
    itemId: data.itemId,
    itemTitle: data.itemTitle,
    pointCost: data.pointCost,
    status: data.status as PurchaseStatus,
    delivered: data.deliveredAt != null,
  }
}
