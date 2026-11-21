import { apiRequest } from '../../../api/httpClient'
import { API_CONFIG } from '../../../config/api.config'
import type { DashboardFilters } from '../types/dashboard.types'

const SYNC_TIMEOUT_MS = 180_000

export interface OrderStatusSegment {
  status: string
  label: string
  count: number
  percentage: number
  color: string
}

export interface OrderStatusData {
  total_orders: number
  statuses: OrderStatusSegment[]
  currency: string
  last_synced_at: string | null
  data_coverage: {
    total_orders: number
    orders_with_verified_delivery: number
    orders_without_tracking_information: number
  }
  sync_in_progress: boolean
  last_sync_truncated: boolean
}

export interface OrderStatusResponse {
  success: boolean
  data: OrderStatusData
  metadata: {
    seller_id: string
    marketplace_id: string
    start_date: string
    end_date: string
  }
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

export function fetchOrderStatus(token: string, filters: DashboardFilters) {
  return apiRequest<OrderStatusResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.orderStatus.status}${filtersToQuery(filters)}`,
    token,
    rawPath: true,
  })
}

export async function syncOrderStatus(token: string, filters: DashboardFilters) {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.orderStatus.sync}${filtersToQuery(filters)}`
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
          : 'Could not sync order status'
      throw new Error(detail)
    }
    return parsed
  } finally {
    window.clearTimeout(timer)
  }
}