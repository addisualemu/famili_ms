const storagePrefix = 'kids-portal.activeMember.'

function storageKey(familyId: string) {
  return `${storagePrefix}${familyId}`
}

export function readActiveMember(familyId: string): string | null {
  try {
    return localStorage.getItem(storageKey(familyId))
  } catch {
    return null
  }
}

export function writeActiveMember(familyId: string, memberId: string | null) {
  try {
    const key = storageKey(familyId)
    if (memberId) localStorage.setItem(key, memberId)
    else localStorage.removeItem(key)
  } catch {
    // The profile still works for this visit when storage is blocked.
  }
}
