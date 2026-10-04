import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase.ts'

export type WorkOrderMessage = {
  id: string
  senderId: string
  senderName: string
  text: string
}

export function useWorkOrderMessages(familyId: string, workOrderId: string) {
  const [messages, setMessages] = useState<WorkOrderMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'families', familyId, 'workOrders', workOrderId, 'messages'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessages(
          snapshot.docs.flatMap((item) => {
            const data = item.data() as Record<string, unknown>
            if (typeof data.text !== 'string' || typeof data.senderName !== 'string') return []
            return [
              {
                id: item.id,
                senderId: typeof data.senderId === 'string' ? data.senderId : '',
                senderName: data.senderName,
                text: data.text,
              },
            ]
          }),
        )
        setError(null)
      },
      () => setError('Could not load notes.'),
    )
  }, [familyId, workOrderId])

  return { messages, error }
}
