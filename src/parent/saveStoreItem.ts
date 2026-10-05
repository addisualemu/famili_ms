import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'
import { isStoreCategory, type StoreCategory, type StoreItem } from './storeItems.ts'

export type StoreItemDraft = {
  title: string
  category: StoreCategory
  pointCost: number
  icon: string
  stock: number
  cooldownHours: number
  active: boolean
  imageUrl?: string | null
}

export async function createStoreItem(familyId: string, draft: StoreItemDraft) {
  const item = checkedItem(draft)
  await setDoc(doc(db, 'families', familyId, 'storeItems', `item_${Date.now()}`), item)
}

export async function updateStoreItem(
  familyId: string,
  item: StoreItem,
  patch: Pick<StoreItem, 'stock' | 'cooldownHours' | 'active'> & { imageUrl?: string | null },
) {
  const next = checkedItem({
    title: item.title,
    category: item.category,
    pointCost: item.pointCost,
    icon: item.icon,
    stock: patch.stock,
    cooldownHours: patch.cooldownHours,
    active: patch.active,
    imageUrl: patch.imageUrl === undefined ? item.imageUrl : patch.imageUrl,
  })
  await setDoc(doc(db, 'families', familyId, 'storeItems', item.id), next)
}

function checkedItem(draft: StoreItemDraft) {
  const title = draft.title.trim()
  const icon = draft.icon.trim()
  if (title.length === 0 || title.length >= 80) throw new Error('Use a shorter title.')
  if (!isStoreCategory(draft.category)) throw new Error('Choose a category.')
  if (!Number.isInteger(draft.pointCost) || draft.pointCost < 0 || draft.pointCost > 10000) {
    throw new Error('Stars must be a whole number from 0 to 10000.')
  }
  if (icon.length >= 16) throw new Error('Use a shorter icon.')
  if (!Number.isInteger(draft.stock) || draft.stock < -1 || draft.stock > 10000) {
    throw new Error('Stock must be a whole number from -1 to 10000.')
  }
  if (!Number.isInteger(draft.cooldownHours) || draft.cooldownHours < 0 || draft.cooldownHours > 8760) {
    throw new Error('Cooldown must be a whole number of hours from 0 to 8760.')
  }
  const imageUrl = draft.imageUrl?.trim() ?? ''
  if (imageUrl.length > 0 && (!imageUrl.startsWith('https://') || imageUrl.length >= 2000)) {
    throw new Error('Could not use that photo.')
  }
  return {
    title,
    category: draft.category,
    pointCost: draft.pointCost,
    icon,
    stock: draft.stock,
    cooldownHours: draft.cooldownHours,
    active: draft.active,
    ...(imageUrl ? { imageUrl } : {}),
  }
}
