let pending: Promise<void> | null = null
let registrationError: string | null = null
const finishKey = 'kids-portal-finish-registration'

export function holdSessionUntil(work: Promise<void>) {
  const tracked = work.finally(() => {
    if (pending === tracked) pending = null
  })
  pending = tracked
}

export function registrationPending() {
  return pending !== null
}

export function waitForRegistration() {
  return pending ?? Promise.resolve()
}

export function rememberRegistrationError(message: string) {
  registrationError = message
}

export function peekRegistrationError() {
  return registrationError
}

export function clearRegistrationError() {
  registrationError = null
}

export function markFinishRegistration(name: string) {
  sessionStorage.setItem(finishKey, name)
}

export function readFinishRegistration() {
  try {
    return sessionStorage.getItem(finishKey)
  } catch {
    return null
  }
}

export function clearFinishRegistration() {
  sessionStorage.removeItem(finishKey)
}
