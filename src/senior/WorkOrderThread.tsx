import { useState } from 'react'
import type { FamilyMember } from '../family/seedFamily.ts'
import { sendMessage } from './sendMessage.ts'
import { useWorkOrderMessages } from './useWorkOrderMessages.ts'

type WorkOrderThreadProps = {
  familyId: string
  workOrderId: string
  member: FamilyMember
}

export function WorkOrderThread({ familyId, workOrderId, member }: WorkOrderThreadProps) {
  const thread = useWorkOrderMessages(familyId, workOrderId)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSend() {
    setBusy(true)
    setError(null)
    try {
      await sendMessage(familyId, workOrderId, member.id, member.name, text)
      setText('')
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Could not send that note.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-6">
      <h4 className="text-xs font-semibold tracking-[0.16em] uppercase">Notes</h4>
      {thread.messages.length === 0 ? (
        <p className="mt-3 text-sm text-navy/70">No notes yet.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {thread.messages.map((message) => (
            <li key={message.id} className="rounded-2xl bg-cream px-3 py-3">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase">{message.senderName}</p>
              <p className="mt-1 text-sm leading-6">{message.text}</p>
            </li>
          ))}
        </ul>
      )}
      {thread.error || error ? (
        <p className="mt-3 text-sm text-coral" role="alert">
          {error || thread.error}
        </p>
      ) : null}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void onSend()
        }}
      >
        <label className="sr-only" htmlFor={`note-${workOrderId}`}>
          Note
        </label>
        <input
          className="min-h-11 flex-1 rounded-2xl border border-navy/15 px-3 text-sm"
          id={`note-${workOrderId}`}
          maxLength={500}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a note"
          value={text}
        />
        <button
          className="min-h-11 rounded-2xl bg-navy px-4 text-sm font-semibold text-cream disabled:opacity-60"
          disabled={busy || text.trim().length === 0}
          type="submit"
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </form>
    </section>
  )
}
