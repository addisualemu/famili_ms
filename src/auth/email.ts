import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase.ts'

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password)
}

export function emailSignInError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Sign in failed. Try again.'
  }

  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'That email or password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait and try again.'
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.'
    default:
      return 'Sign in failed. Try again.'
  }
}
