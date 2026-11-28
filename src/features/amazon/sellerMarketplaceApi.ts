import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'
import type { DashboardFilters } from '../dashboard/types/dashboard.types'

export interface SellerMarketplaceContext {
  selling_partner_id: string
  marketplace_id: string
  marketplace_label: string
  participating_marketplace_ids: string[]
}

export async function fetchSellerMarketplaceContext(
  token: string,
  filters: Pick<DashboardFilters, 'marketplaceId' | 'sellerId'>,
): Promise<SellerMarketplaceContext> {
  const params = new URLSearchParams({
    marketplaceId: filters.marketplaceId || 'all',
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return apiRequest<SellerMarketplaceContext>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.amazon.marketplaceContext}?${params.toString()}`,
    token,
    rawPath: true,
  })
}