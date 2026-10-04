import { doc, getDoc, serverTimestamp, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase.ts'

const LEO_ID = 'member_leo'
const GOAL_ID = 'item_lego_space'

const MISSIONS = [
  { id: 'wo_leo_bed', title: 'Make the bed', pointValue: 5, status: 'in_progress' },
  { id: 'wo_leo_teeth', title: 'Brush teeth', pointValue: 5, status: 'in_progress' },
  { id: 'wo_leo_backpack', title: 'Pack backpack', pointValue: 10, status: 'in_progress' },
  { id: 'wo_leo_reading', title: 'Read for 10 minutes', pointValue: 10, status: 'pending_review' },
] as const

export async function ensureJuniorBoard(familyId: string, memberId: string) {
  if (memberId !== LEO_ID) return

  const goalRef = doc(db, 'families', familyId, 'storeItems', GOAL_ID)
  const memberRef = doc(db, 'families', familyId, 'members', LEO_ID)
  const missionRefs = MISSIONS.map((mission) => ({
    mission,
    ref: doc(db, 'families', familyId, 'workOrders', mission.id),
  }))

  const [goalSnap, memberSnap, ...missionSnaps] = await Promise.all([
    getDoc(goalRef),
    getDoc(memberRef),
    ...missionRefs.map((item) => getDoc(item.ref)),
  ])

  const batch = writeBatch(db)
  let writes = 0

  if (!goalSnap.exists()) {
    batch.set(goalRef, {
      title: 'Lego Space Shuttle',
      category: 'physical',
      pointCost: 60,
      icon: '🚀',
      stock: 1,
      cooldownHours: 0,
      active: true,
    })
    writes += 1
  }

  for (const [index, item] of missionRefs.entries()) {
    if (missionSnaps[index]?.exists()) continue
    batch.set(item.ref, {
      title: item.mission.title,
      description: '',
      category: 'Daily Habit',
      pointValue: item.mission.pointValue,
      assignedTo: LEO_ID,
      isBounty: false,
      status: item.mission.status,
      dueDate: Timestamp.fromDate(new Date()),
      requiresPhoto: true,
      proofSubmission: { photoUrls: [], notes: '', submittedAt: null },
      checklist: [],
      createdAt: serverTimestamp(),
      createdBy: 'member_parent',
    })
    writes += 1
  }

  if (writes > 0) await batch.commit()

  if (memberSnap.exists() && memberSnap.data().currentGoalItemId !== GOAL_ID) {
    await updateDoc(memberRef, { currentGoalItemId: GOAL_ID })
  }
}
