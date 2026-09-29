/**
 * Auth behavior flags (build-time env).
 *
 * Relaxed: accept any email/password locally; no auth API calls.
 * Set VITE_AUTH_RELAXED=false when the real login API is available.
 */
export function isRelaxedAuth(): boolean {
  const flag = import.meta.env.VITE_AUTH_RELAXED
  if (flag === 'true') return true
  if (flag === 'false') return false
  // Default: use real API auth (required for admin routes and JWT).
  return false
}
