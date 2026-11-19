import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'
import type { DashboardFilters } from '../dashboard/types/dashboard.types'

export interface FbaInventoryMetrics {
  fulfillable: number
  reserved: number
  inbound: number
  unfulfillable: number
}

export interface FbaInventoryItem {
  asin: string | null
  sellerSku: string | null
  fnSku: string | null
  productName: string | null
  condition: string | null
  fulfillable: number
  reserved: number
  inbound: number
  unfulfillable: number
  totalQuantity: number
  lastUpdatedTime: string | null
}

export interface FbaInventoryResponse {
  marketplaceId: string
  granularityType: string | null
  truncated: boolean
  isEmpty: boolean
  metrics: FbaInventoryMetrics
  items: FbaInventoryItem[]
}

function fbaInventoryQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams({
    marketplaceId: filters.marketplaceId || 'all',
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return `?${params.toString()}`
}

export function fetchFbaInventory(token: string, filters: DashboardFilters) {
  return apiRequest<FbaInventoryResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.inventory.fba}${fbaInventoryQuery(filters)}`,
    token,
    rawPath: true,
  })
}