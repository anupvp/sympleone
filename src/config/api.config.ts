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
      changePassword: '/auth/change-password',
    },
    orders: '/orders',
    dashboard: {
      stats: '/dashboard/stats',
      salesTrend: '/dashboard/sales-trend',
      profitability: '/dashboard/profitability',
      accountHealth: '/dashboard/account-health',
      alerts: '/dashboard/alerts',
      marketplaces: '/dashboard/marketplaces',
      exportReport: '/dashboard/export-report',
    },
    reports: {
      finances: '/reports/finances',
    },
    inventory: {
      fba: '/inventory/fba',
    },
    products: {
      list: '/v1/products',
    },
    productPerformance: {
      sync: '/v1/product-performance/sync',
      top: '/v1/product-performance/top',
      low: '/v1/product-performance/low',
      summary: '/v1/product-performance/summary',
    },
    orderStatus: {
      status: '/v1/dashboard/order-status',
      sync: '/v1/dashboard/order-status/sync',
      syncStatus: '/v1/dashboard/order-status/sync-status',
    },
    admin: {
      employees: '/admin/employees',
      sellers: '/admin/sellers',
      sellersOverview: '/admin/sellers/overview',
      sellerAccessRequests: '/admin/seller-access-requests',
      groups: '/admin/groups',
      roles: '/admin/roles',
      policies: '/admin/policies',
    },
    employee: {
      me: '/employee/me',
      sellers: '/employee/sellers',
      assignedSellers: '/employee/assigned-sellers',
    },
    amazon: {
      connect: '/amazon/connect',
      callbackComplete: '/amazon/callback/complete',
      marketplaceContext: '/amazon/marketplace-context',
    },
    public: {
      sellerCount: '/public/seller-count',
    },
  },
} as const

/** Default Amazon.in marketplace — override with VITE_AMAZON_MARKETPLACE_ID */
export const AMAZON_DEFAULT_MARKETPLACE_ID =
  (env.VITE_AMAZON_MARKETPLACE_ID as string | undefined)?.trim() || 'A21TJRUUN4KGV'

/** Path under baseUrl, e.g. apiPath('/admin/employees', 'abc') */
export function apiPath(...parts: string[]): string {
  const path = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
  return `/${path}`
}

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
