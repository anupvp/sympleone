import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'
import type { DashboardFilters } from '../dashboard/types/dashboard.types'

export type ListingStatusTab = 'all' | 'active' | 'inactive' | 'out_of_stock' | 'draft' | 'suppressed'

export interface ProductSummary {
  total: number
  active: number
  inactive: number
  out_of_stock: number
  draft: number
  suppressed: number
}

export interface ProductListingRow {
  sku: string
  asin: string | null
  title: string
  category: string
  image_url: string | null
  listing_status: ListingStatusTab extends 'all' ? string : ListingStatusTab | string
  fulfillment_type: 'FBA' | 'FBM'
  fulfillment_label: string
  inventory_available: number
  inventory_label: string
  price_amount: string | null
  price_currency: string
  shipping_amount: string | null
  estimated_fees_amount: string | null
  performance_percent: number | null
  updated_at: string | null
}

export interface ProductsPageResponse {
  marketplace_id: string
  summary: ProductSummary
  products: ProductListingRow[]
}

function productsQuery(filters: DashboardFilters) {
  const params = new URLSearchParams({
    marketplaceId: filters.marketplaceId || 'all',
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return `?${params.toString()}`
}

export async function fetchProducts(token: string, filters: DashboardFilters): Promise<ProductsPageResponse> {
  return apiRequest<ProductsPageResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.products.list}${productsQuery(filters)}`,
    token,
    rawPath: true,
  })
}