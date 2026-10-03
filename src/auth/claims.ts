export type ParentClaims = {
  role: 'parent'
  familyId: string
}

export function readParentClaims(token: Record<string, unknown>): ParentClaims | null {
  const { role, familyId } = token
  if (role === 'parent' && typeof familyId === 'string' && familyId.length > 0) {
    return { role, familyId }
  }
  return null
}
