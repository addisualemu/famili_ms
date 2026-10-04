import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'
import type { ChecklistItem } from './workOrders.ts'

export async function toggleChecklist(
  familyId: string,
  workOrderId: string,
  checklist: ChecklistItem[],
  index: number,
) {
  const next = checklist.map((item, itemIndex) =>
    itemIndex === index ? { text: item.text, done: !item.done } : { text: item.text, done: item.done },
  )
  try {
    await updateDoc(doc(db, 'families', familyId, 'workOrders', workOrderId), { checklist: next })
  } catch {
    throw new Error('Could not update the checklist.')
  }
}
