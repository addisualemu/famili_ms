export const STORE_CATEGORIES = ['privilege', 'outing', 'physical', 'external'] as const

export type StoreCategory = (typeof STORE_CATEGORIES)[number]

export type StoreItem = {
  id: string
  title: string
  category: StoreCategory
  pointCost: number
  icon: string
  stock: number
  cooldownHours: number
  active: boolean
  imageUrl: string | null
}

export const CATEGORY_LABEL: Record<StoreCategory, string> = {
  privilege: 'Privilege',
  outing: 'Outing',
  physical: 'Physical',
  external: 'External',
}

export function isStoreCategory(value: string): value is StoreCategory {
  return STORE_CATEGORIES.some((category) => category === value)
}

export function storeItemFromData(id: string, data: Record<string, unknown>): StoreItem | null {
  if (typeof data.title !== 'string' || data.title.length === 0) return null
  if (typeof data.category !== 'string' || !isStoreCategory(data.category)) return null
  if (typeof data.pointCost !== 'number' || !Number.isInteger(data.pointCost)) return null
  if (typeof data.icon !== 'string') return null
  if (typeof data.stock !== 'number' || !Number.isInteger(data.stock)) return null
  if (typeof data.cooldownHours !== 'number' || !Number.isInteger(data.cooldownHours)) return null
  if (typeof data.active !== 'boolean') return null
  return {
    id,
    title: data.title,
    category: data.category,
    pointCost: data.pointCost,
    icon: data.icon,
    stock: data.stock,
    cooldownHours: data.cooldownHours,
    active: data.active,
    imageUrl: readImageUrl(data.imageUrl),
  }
}

function readImageUrl(value: unknown) {
  return typeof value === 'string' && value.startsWith('https://') && value.length < 2000 ? value : null
}
