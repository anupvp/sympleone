const TOKEN_KEY = 'sympleone_access_token'
const USER_KEY = 'sympleone_user'

export function loadStoredAuth(): {
  accessToken: string | null
  user: import('./types').AuthUser | null
} {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const userRaw = localStorage.getItem(USER_KEY)
    const user = userRaw ? (JSON.parse(userRaw) as import('./types').AuthUser) : null
    return { accessToken: token, user }
  } catch {
    return { accessToken: null, user: null }
  }
}

export function persistAuth(
  accessToken: string,
  user: import('./types').AuthUser,
): void {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
