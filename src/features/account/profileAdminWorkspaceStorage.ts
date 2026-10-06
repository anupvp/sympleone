const STORAGE_PREFIX = 'sympleone.profile.adminWorkspaceCard'

export type AdminWorkspaceCardId =
  | 'sellers'
  | 'employees'
  | 'groups'
  | 'roles'
  | 'attendance'
  | 'performance'

const VALID_IDS = new Set<string>([
  'sellers',
  'employees',
  'groups',
  'roles',
  'attendance',
  'performance',
])

function keyForUser(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`
}

export function readLastAdminWorkspaceCard(
  userId: string | undefined,
): AdminWorkspaceCardId | null {
  if (!userId) {
    return null
  }
  try {
    const raw = localStorage.getItem(keyForUser(userId))
    if (raw && VALID_IDS.has(raw)) {
      return raw as AdminWorkspaceCardId
    }
  } catch {
    /* ignore */
  }
  return null
}

export function writeLastAdminWorkspaceCard(
  userId: string | undefined,
  cardId: AdminWorkspaceCardId,
): void {
  if (!userId) {
    return
  }
  try {
    localStorage.setItem(keyForUser(userId), cardId)
  } catch {
    /* ignore */
  }
}
