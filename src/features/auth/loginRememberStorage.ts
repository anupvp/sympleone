const REMEMBER_ME_KEY = 'sympleone_remember_me'
const REMEMBER_EMAIL_KEY = 'sympleone_remember_email'
const SESSION_EMAIL_KEY = 'sympleone_session_email'

/** Remember me is checked by default on the login form. */
export const DEFAULT_REMEMBER_ME = true

export function loadAnySavedEmail(): string {
  try {
    return (
      localStorage.getItem(REMEMBER_EMAIL_KEY) ??
      sessionStorage.getItem(SESSION_EMAIL_KEY) ??
      ''
    )
  } catch {
    return ''
  }
}

export function persistLoginEmail(email: string, rememberMe: boolean): void {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe))

    if (rememberMe) {
      if (email) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email)
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY)
      }
      sessionStorage.removeItem(SESSION_EMAIL_KEY)
      return
    }

    localStorage.removeItem(REMEMBER_EMAIL_KEY)
    if (email) {
      sessionStorage.setItem(SESSION_EMAIL_KEY, email)
    } else {
      sessionStorage.removeItem(SESSION_EMAIL_KEY)
    }
  } catch {
    // Ignore private mode / quota errors.
  }
}
