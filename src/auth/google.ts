import { FirebaseError } from 'firebase/app'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../lib/firebase.ts'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider)
}

export function googleSignInError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Google sign-in failed. Try again.'
  }

  switch (error.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.'
    case 'auth/popup-blocked':
      return 'Allow popups for this site, then try Google sign-in again.'
    case 'auth/unauthorized-domain':
      return 'This site is not an authorized domain in Firebase Auth.'
    case 'auth/network-request-failed':
      return 'Network problem. Check your connection and try again.'
    default:
      return 'Google sign-in failed. Try again.'
  }
}
