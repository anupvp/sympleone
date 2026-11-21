import { apiRequest } from '../../../api/httpClient'
import { API_CONFIG } from '../../../config/api.config'
import type { DashboardFilters } from '../types/dashboard.types'

const SYNC_TIMEOUT_MS = 600_000

export interface ProductPerformanceRow {
  product_name: string
  sku: string
  asin: string | null
  sales: number
  orders: number
  revenue: number
  growth_percentage: number | null
  growth_display: string
  currency: string
}

export interface ProductPerformanceMetadata {
  seller_id: string
  marketplace_id: string
  start_date: string
  end_date: string
  comparison_start_date: string
  comparison_end_date: string
  last_synced_at: string | null
  total_products: number
  revenue_definition?: string | null
}

export interface ProductPerformanceListResponse {
  success: boolean
  data: ProductPerformanceRow[]
  metadata: ProductPerformanceMetadata
}

function filtersToQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams({
    marketplaceId: filters.marketplaceId || 'all',
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return `?${params.toString()}`
}

export function formatInrCompact(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)}Cr`
  }
  if (abs >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`
  }
  if (abs >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

export function fetchTopProducts(token: string, filters: DashboardFilters) {
  return apiRequest<ProductPerformanceListResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.productPerformance.top}${filtersToQuery(filters)}`,
    token,
    rawPath: true,
  })
}

export function fetchLowProducts(token: string, filters: DashboardFilters) {
  return apiRequest<ProductPerformanceListResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.productPerformance.low}${filtersToQuery(filters)}`,
    token,
    rawPath: true,
  })
}

export async function syncProductPerformance(token: string, filters: DashboardFilters) {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.productPerformance.sync}${filtersToQuery(filters)}`
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    const parsed: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const detail =
        typeof parsed === 'object' &&
        parsed !== null &&
        'detail' in parsed &&
        typeof (parsed as { detail: unknown }).detail === 'string'
          ? (parsed as { detail: string }).detail
          : 'Could not sync product performance'
      throw new Error(detail)
    }
    return parsed
  } finally {
    window.clearTimeout(timer)
  }
}