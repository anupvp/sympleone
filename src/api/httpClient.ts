import { API_CONFIG, resolveApiUrl } from '../config/api.config'
import { loadStoredAuth } from '../features/auth/authStorage'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  /** Endpoint key from api.config (e.g. "auth.login") or path when rawPath is true. */
  endpoint: string
  body?: unknown
  token?: string | null
  /** When true, endpoint is a path under baseUrl instead of a config key. */
  rawPath?: boolean
}

function buildUrl(endpoint: string, rawPath: boolean): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  if (rawPath || endpoint.startsWith('/')) {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${API_CONFIG.baseUrl}${path}`
  }
  return resolveApiUrl(endpoint)
}

function resolveAuthToken(explicit?: string | null): string | null {
  if (explicit) {
    return explicit
  }
  return loadStoredAuth().accessToken
}

function errorMessageFromBody(parsed: unknown, status: number): string {
  if (typeof parsed === 'object' && parsed !== null) {
    const detail = (parsed as { detail?: unknown }).detail
    if (typeof detail === 'string') {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail.map((d) => JSON.stringify(d)).join('; ')
    }
    if ('message' in parsed && typeof (parsed as { message: unknown }).message === 'string') {
      return (parsed as { message: string }).message
    }
  }
  return `Request failed (${status})`
}

/**
 * Read-focused HTTP client. Prefer GET for data; POST is limited to auth/session flows.
 */
export async function apiRequest<T>({
  method = 'GET',
  endpoint,
  body,
  token,
  rawPath = false,
}: RequestOptions): Promise<T> {
  const url = buildUrl(endpoint, rawPath)
  const headers: Record<string, string> = {
    ...API_CONFIG.defaultHeaders,
  }

  const authToken = resolveAuthToken(token)
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const text = await response.text()
    let parsed: unknown = null
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown
      } catch {
        parsed = text
      }
    }

    if (!response.ok) {
      throw new ApiError(errorMessageFromBody(parsed, response.status), response.status, parsed)
    }

    return parsed as T
  } finally {
    clearTimeout(timeout)
  }
}
