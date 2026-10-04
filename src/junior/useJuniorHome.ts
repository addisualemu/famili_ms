import { collection, doc, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { db } from '../lib/firebase.ts'
import { goalFromItem, missionFromData, type JuniorGoal, type JuniorMission } from './board.ts'
import { ensureJuniorBoard } from './ensureJuniorBoard.ts'

export type JuniorHome = {
  stars: number
  goal: JuniorGoal | null
  missions: JuniorMission[]
  ready: boolean
  error: string | null
}

const IDLE: JuniorHome = { stars: 0, goal: null, missions: [], ready: true, error: null }

export function useJuniorHome(familyId: string | null, member: FamilyMember | null): JuniorHome {
  const juniorId = member?.tier === 'junior' ? member.id : null
  const stars = juniorId ? member?.stars ?? 0 : 0
  const goalId = juniorId ? member?.currentGoalItemId ?? null : null
  const [missions, setMissions] = useState<JuniorMission[]>([])
  const [goal, setGoal] = useState<JuniorGoal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(juniorId === null)

  useEffect(() => {
    if (!familyId || !juniorId) return

    let active = true
    let missionsReady = false
    let goalReady = !goalId
    setReady(false)
    setError(null)

    const markReady = () => {
      if (active && missionsReady && goalReady) setReady(true)
    }

    const missionsQuery = query(
      collection(db, 'families', familyId, 'workOrders'),
      where('assignedTo', '==', juniorId),
    )
    const unsubscribeMissions = onSnapshot(
      missionsQuery,
      (snapshot) => {
        if (!active) return
        const next = snapshot.docs.flatMap((item) => {
          const mission = missionFromData(item.id, item.data() as Record<string, unknown>)
          return mission ? [mission] : []
        })
        next.sort((a, b) => a.title.localeCompare(b.title))
        setMissions(next)
        missionsReady = true
        markReady()
      },
      () => {
        if (!active) return
        setError("Could not load today's missions.")
        missionsReady = true
        markReady()
      },
    )

    let unsubscribeGoal = () => {}
    if (goalId) {
      unsubscribeGoal = onSnapshot(
        doc(db, 'families', familyId, 'storeItems', goalId),
        (snapshot) => {
          if (!active) return
          setGoal(
            goalFromItem(
              goalId,
              snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined,
              stars,
            ),
          )
          goalReady = true
          markReady()
        },
        () => {
          if (!active) return
          setError('Could not load the goal.')
          goalReady = true
          markReady()
        },
      )
    } else {
      setGoal(null)
    }

    void ensureJuniorBoard(familyId, juniorId).catch(() => {
      if (!active) return
      setError("Could not prepare today's missions.")
    })

    return () => {
      active = false
      unsubscribeMissions()
      unsubscribeGoal()
    }
  }, [familyId, juniorId, goalId, stars])

  if (!juniorId) return IDLE
  return { stars, goal, missions, ready, error }
}
