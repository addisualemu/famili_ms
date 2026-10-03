import { useState, type FormEvent } from 'react'
import { googleSignInError, signInWithGoogle } from './google.ts'

type ParentLoginProps = {
  onSubmit?: (credentials: { email: string; password: string }) => void
}

export function ParentLogin({ onSubmit }: ParentLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [googleBusy, setGoogleBusy] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError('Enter your email and password.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setError(null)
    onSubmit?.({ email: trimmedEmail, password })
  }

  async function handleGoogleSignIn() {
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
        <p className="text-xs font-semibold tracking-[0.2em] uppercase">
          Parent Console
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-navy/70">
          Sign in with Google, or with the parent email and password.
        </p>

        <button
          className="mt-8 flex min-h-11 w-full items-center justify-center gap-3 rounded-2xl border border-navy/15 bg-white text-sm font-semibold disabled:opacity-60"
          disabled={googleBusy}
          onClick={handleGoogleSignIn}
          type="button"
        >
          <GoogleMark />
          {googleBusy ? 'Opening Google…' : 'Continue with Google'}
        </button>

        {error ? (
          <p className="mt-4 text-sm text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <p className="mt-5 text-center text-xs font-semibold tracking-[0.16em] text-navy/50 uppercase">
          or
        </p>

        <form className="mt-5 space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="parent-email">
              Email
            </label>
            <input
              autoComplete="username"
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
              autoComplete="current-password"
              className="min-h-11 w-full rounded-2xl border border-navy/15 bg-cream px-4 text-base outline-none focus:border-navy"
              id="parent-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>

          <button
            className="min-h-11 w-full rounded-2xl bg-navy text-sm font-semibold text-cream"
            type="submit"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  )
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
