import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { auth, firebaseApp } from '../lib/firebase.ts'
import {
  clearFinishRegistration,
  holdSessionUntil,
  markFinishRegistration,
  rememberRegistrationError,
} from './registrationGate.ts'

export async function registerWithEmail(name: string, email: string, password: string) {
  let release = () => {}
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  holdSessionUntil(gate)
  markFinishRegistration(name)

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    await registerParent(name)
    await credential.user.getIdToken(true)
    clearFinishRegistration()
  } catch (error) {
    const message = registerError(error)
    rememberRegistrationError(message)
    if (auth.currentUser && isAuthCreateError(error)) {
      await signOut(auth).catch(() => undefined)
    }
    throw new Error(message)
  } finally {
    release()
  }
}

export async function registerParent(name: string) {
  const call = httpsCallable(getFunctions(firebaseApp, 'us-central1'), 'registerParent')
  await call({ name })
}

function isAuthCreateError(error: unknown) {
  return error instanceof FirebaseError && error.code.startsWith('auth/')
}

export function registerError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error && error.message ? error.message : 'Could not create the account. Try again.'
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Sign in instead.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Use a password with at least 8 characters.'
    case 'auth/operation-not-allowed':
      return 'Email and password accounts are not enabled yet.'
    case 'auth/network-request-failed':
    case 'functions/unavailable':
      return 'Network problem. Check your connection and try again.'
    case 'functions/not-found':
    case 'functions/internal':
    case 'functions/unknown':
      return 'Family setup is not available yet.'
    case 'functions/unauthenticated':
      return 'Sign in first, then try again.'
    case 'functions/invalid-argument':
    case 'functions/permission-denied':
    case 'functions/failed-precondition':
      return error.message || 'Could not create the family. Try again.'
    default:
      return error.code.startsWith('functions/')
        ? 'Could not create the family. Try again.'
        : 'Could not create the account. Try again.'
  }
}
