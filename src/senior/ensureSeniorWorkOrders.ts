import { doc, getDoc, serverTimestamp, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

const MAYA_ID = 'member_maya'

const ORDERS = [
  {
    id: 'wo_104',
    title: 'Clean & Detail Family Van',
    description: 'Vacuum carpets, clean door pockets, wipe dashboard.',
    category: 'Deep Clean',
    pointValue: 50,
    checklist: [
      { text: 'Trash emptied', done: false },
      { text: 'Carpets vacuumed', done: false },
      { text: 'Dashboard wiped', done: false },
    ],
  },
  {
    id: 'wo_105',
    title: 'Finish math worksheet',
    description: 'Complete the assigned math page.',
    category: 'Schoolwork',
    pointValue: 20,
    checklist: [
      { text: 'Worksheet finished', done: false },
      { text: 'Name on the page', done: false },
    ],
  },
] as const

export async function ensureSeniorWorkOrders(familyId: string, memberId: string) {
  if (memberId !== MAYA_ID) return

  const refs = ORDERS.map((order) => ({
    order,
    ref: doc(db, 'families', familyId, 'workOrders', order.id),
  }))
  const snaps = await Promise.all(refs.map((item) => getDoc(item.ref)))
  const batch = writeBatch(db)
  let writes = 0

  for (const [index, item] of refs.entries()) {
    if (snaps[index]?.exists()) continue
    batch.set(item.ref, {
      title: item.order.title,
      description: item.order.description,
      category: item.order.category,
      pointValue: item.order.pointValue,
      assignedTo: MAYA_ID,
      isBounty: false,
      status: 'in_progress',
      dueDate: Timestamp.fromDate(new Date()),
      requiresPhoto: false,
      proofSubmission: { photoUrls: [], notes: '', submittedAt: null },
      checklist: item.order.checklist,
      createdAt: serverTimestamp(),
      createdBy: 'member_parent',
    })
    writes += 1
  }

  for (const [index, item] of refs.entries()) {
    const snap = snaps[index]
    if (!snap?.exists()) continue
    const checklist = snap.data().checklist
    if (Array.isArray(checklist) && checklist.length > 0) continue
    await updateDoc(item.ref, { checklist: item.order.checklist })
  }

  if (writes > 0) await batch.commit()
}
