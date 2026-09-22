/**
 * Single source of truth for all API configuration.
 * Change base URL and paths here (or via Vite env vars) — nowhere else.
 */

const env = import.meta.env

export const API_CONFIG = {
  /** Resolved API origin (no trailing slash). */
  baseUrl: (env.VITE_API_BASE_URL ?? 'http://localhost:8080/api').replace(
    /\/$/,
    '',
  ),

  /** Request timeout in milliseconds. */
  timeoutMs: Number(env.VITE_API_TIMEOUT_MS ?? 30_000),

  /** Default headers for JSON APIs. */
  defaultHeaders: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  } as const,

  /**
   * All endpoint paths (relative to baseUrl).
   * Add new read-only resources under their domain key.
   */
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
      refresh: '/auth/refresh',
    },
  },
} as const

export type ApiEndpoints = typeof API_CONFIG.endpoints

/** Build a full URL for a dot-separated endpoint key, e.g. "auth.login". */
export function resolveApiUrl(endpointKey: string): string {
  const segments = endpointKey.split('.')
  let current: unknown = API_CONFIG.endpoints

  for (const segment of segments) {
    if (
      current === null ||
      typeof current !== 'object' ||
      !(segment in current)
    ) {
      throw new Error(`Unknown API endpoint key: ${endpointKey}`)
    }
    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current !== 'string') {
    throw new Error(`API endpoint key "${endpointKey}" is not a path string`)
  }

  return `${API_CONFIG.baseUrl}${current.startsWith('/') ? current : `/${current}`}`
}
