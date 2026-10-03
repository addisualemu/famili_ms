import { useEffect, useState } from 'react'

type PinLockProps = {
  name: string
  mode: 'create' | 'unlock'
  error: string | null
  busy: boolean
  onComplete: (pin: string) => void
  onCancel: () => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'] as const

export function PinLock({ name, mode, error, busy, onComplete, onCancel }: PinLockProps) {
  const [digits, setDigits] = useState('')
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [mismatch, setMismatch] = useState(false)
  const confirming = mode === 'create' && firstPin !== null

  useEffect(() => {
    setDigits('')
  }, [error])

  function press(key: string) {
    if (busy) return
    setMismatch(false)
    if (key === 'delete') {
      setDigits((current) => current.slice(0, -1))
      return
    }
    if (digits.length >= 4) return
    const next = digits + key
    setDigits(next)
    if (next.length < 4) return

    if (mode === 'unlock') {
      setDigits('')
      onComplete(next)
      return
    }
    if (!firstPin) {
      setFirstPin(next)
      setDigits('')
      return
    }
    if (next === firstPin) {
      onComplete(next)
      return
    }
    setFirstPin(null)
    setDigits('')
    setMismatch(true)
  }

  const title = mode === 'unlock' ? 'Enter PIN' : confirming ? 'Confirm PIN' : 'Create a PIN'
  const detail =
    mode === 'unlock'
      ? `4 digits for ${name}`
      : confirming
        ? `Enter ${name}'s PIN again`
        : `Choose 4 digits for ${name}`

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-sm">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">PIN lock</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">{detail}</p>

        <div aria-label={`${digits.length} of 4 digits`} className="mt-8 flex justify-center gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              className={`h-4 w-4 rounded-full border border-navy ${index < digits.length ? 'bg-navy' : 'bg-transparent'}`}
              key={index}
            />
          ))}
        </div>

        {mismatch || error ? (
          <p className="mt-4 text-center text-sm text-coral" role="alert">
            {mismatch ? 'Those PINs do not match. Try again.' : error}
          </p>
        ) : (
          <p className="mt-4 h-5" />
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {KEYS.map((key) =>
            key === '' ? (
              <span key="spacer" />
            ) : (
              <button
                className="min-h-14 rounded-2xl border border-navy/15 bg-white text-xl font-semibold disabled:opacity-60"
                disabled={busy}
                key={key}
                onClick={() => press(key)}
                type="button"
              >
                {key === 'delete' ? 'Del' : key}
              </button>
            ),
          )}
        </div>

        <button
          className="mt-6 min-h-11 w-full rounded-2xl text-sm font-semibold"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </section>
    </main>
  )
}
