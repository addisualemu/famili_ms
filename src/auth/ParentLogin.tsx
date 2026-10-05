import { useEffect, useState, type FormEvent } from 'react'
import { emailSignInError, signInWithEmail } from './email.ts'
import { googleSignInError, signInWithGoogle } from './google.ts'
import { clearRegistrationError, peekRegistrationError } from './registrationGate.ts'
import { registerError, registerParent, registerWithEmail } from './register.ts'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ParentLogin() {
  const [mode, setMode] = useState<'sign-in' | 'create'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [emailBusy, setEmailBusy] = useState(false)
  const busy = googleBusy || emailBusy
  const creating = mode === 'create'

  useEffect(() => {
    const message = peekRegistrationError()
    if (message) setError(message)
  }, [])

  function showSignIn() {
    clearRegistrationError()
    setMode('sign-in')
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  function showCreate() {
    clearRegistrationError()
    setMode('create')
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedName = name.trim().replace(/\s+/g, ' ')

    if (creating) {
      if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
        setError('Enter your name, email, and password.')
        return
      }
      if (trimmedName.length > 39) {
        setError('Use a shorter name.')
        return
      }
    } else if (!trimmedEmail || !password) {
      setError('Enter your email and password.')
      return
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (creating && password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }

    if (creating && password !== confirmPassword) {
      setError('Those passwords do not match.')
      return
    }

    clearRegistrationError()
    setError(null)
    setEmailBusy(true)
    try {
      if (creating) await registerWithEmail(trimmedName, trimmedEmail, password)
      else await signInWithEmail(trimmedEmail, password)
    } catch (signInError) {
      setError(creating ? registerError(signInError) : emailSignInError(signInError))
    } finally {
      setEmailBusy(false)
    }
  }

  async function handleGoogleSignIn() {
    clearRegistrationError()
    setError(null)
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
    } catch (signInError) {
      setError(googleSignInError(signInError))
    } finally {
      setGoogleBusy(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-md rounded-3xl border border-navy/10 bg-white px-6 py-8 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">Parent Console</p>
        <h1 className="mt-2 text-2xl font-semibold">{creating ? 'Create account' : 'Sign in'}</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">
          {creating
            ? 'Create a parent email and password. Kids still use the profile picker.'
            : 'Sign in with Google, or with the parent email and password.'}
        </p>

        {creating ? null : (
          <button
            className="mt-8 flex min-h-11 w-full items-center justify-center gap-3 rounded-2xl border border-navy/15 bg-white text-sm font-semibold disabled:opacity-60"
            disabled={busy}
            onClick={handleGoogleSignIn}
            type="button"
          >
            <GoogleMark />
            {googleBusy ? 'Opening Google…' : 'Continue with Google'}
          </button>
        )}

        {error ? (
          <p className={`text-sm text-coral ${creating ? 'mt-6' : 'mt-4'}`} role="alert">
            {error}
          </p>
        ) : null}

        {creating ? null : (
          <p className="mt-5 text-center text-xs font-semibold tracking-[0.16em] text-navy/50 uppercase">or</p>
        )}

        <form className={`${creating ? 'mt-6' : 'mt-5'} space-y-5`} noValidate onSubmit={handleSubmit}>
          {creating ? (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="parent-name">
                Your name
              </label>
              <input
                autoComplete="name"
                className="min-h-11 w-full rounded-2xl border border-navy/15 bg-cream px-4 text-base outline-none focus:border-navy"
                id="parent-name"
                name="name"
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="parent-email">
              Email
            </label>
            <input
              autoComplete={creating ? 'email' : 'username'}
              className="min-h-11 w-full rounded-2xl border border-navy/15 bg-cream px-4 text-base outline-none focus:border-navy"
              id="parent-email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="parent-password">
              Password
            </label>
            <input
              autoComplete={creating ? 'new-password' : 'current-password'}
              className="min-h-11 w-full rounded-2xl border border-navy/15 bg-cream px-4 text-base outline-none focus:border-navy"
              id="parent-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          {creating ? (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="parent-confirm">
                Confirm password
              </label>
              <input
                autoComplete="new-password"
                className="min-h-11 w-full rounded-2xl border border-navy/15 bg-cream px-4 text-base outline-none focus:border-navy"
                id="parent-confirm"
                name="confirm"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </div>
          ) : null}

          <button
            className="min-h-11 w-full rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60"
            disabled={busy}
            type="submit"
          >
            {emailBusy ? (creating ? 'Creating account…' : 'Signing in…') : creating ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          className="mt-5 min-h-11 w-full text-sm font-medium text-navy/70"
          disabled={busy}
          onClick={creating ? showSignIn : showCreate}
          type="button"
        >
          {creating ? 'Already have an account? Sign in' : 'New parent? Create an account'}
        </button>
      </section>
    </main>
  )
}

export function FinishFamily({
  busy,
  error,
  name,
  onFinish,
  onSignOut,
}: {
  busy: boolean
  error: string | null
  name: string
  onFinish: () => void
  onSignOut: () => void
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 text-navy">
      <section className="w-full max-w-md rounded-3xl border border-navy/10 bg-white px-6 py-8 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">Parent Console</p>
        <h1 className="mt-2 text-2xl font-semibold">Finish your family</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">
          {name} is signed in, and the family still needs to be created.
        </p>
        {error ? (
          <p className="mt-4 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}
        <button
          className="mt-6 min-h-11 w-full rounded-2xl bg-navy text-sm font-semibold text-cream disabled:opacity-60"
          disabled={busy}
          onClick={onFinish}
          type="button"
        >
          {busy ? 'Creating family…' : 'Create my family'}
        </button>
        <button
          className="mt-3 min-h-11 w-full text-sm font-medium text-navy/70"
          disabled={busy}
          onClick={onSignOut}
          type="button"
        >
          Sign out
        </button>
      </section>
    </main>
  )
}

export async function finishFamily(name: string) {
  try {
    await registerParent(name)
  } catch (error) {
    throw new Error(registerError(error))
  }
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 18 18" width="18">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
