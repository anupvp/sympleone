import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'
import type { DashboardFilters } from '../dashboard/types/dashboard.types'
import { resolveSalesDateRange } from '../dashboard/utils/salesPeriodUtils'
import { ordersCreatedRange } from './ordersQueryParams'

export interface OrderMoney {
  currency_code: string
  amount: string
}

export interface OrderRow {
  amazon_order_id: string
  purchase_date: string | null
  order_status: string | null
  order_total: OrderMoney | null
  payment_method: string | null
  fulfillment_channel: string | null
  is_prime: boolean
  sales_channel: string | null
  ship_city: string | null
  ship_state: string | null
  easy_ship_status: string | null
  number_of_items_shipped: number
  number_of_items_unshipped: number
}

export interface OrdersListResponse {
  orders: OrderRow[]
  created_after: string | null
  created_before: string | null
}

function ordersQuery(filters: DashboardFilters) {
  const { dateFrom, dateTo } = resolveSalesDateRange(filters)
  const { CreatedAfter, CreatedBefore } = ordersCreatedRange(dateFrom, dateTo)
  const params = new URLSearchParams({
    marketplaceId: filters.marketplaceId || 'all',
    CreatedAfter,
    CreatedBefore,
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return `?${params.toString()}`
}

export function fetchOrders(token: string, filters: DashboardFilters) {
  return apiRequest<OrdersListResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.orders}${ordersQuery(filters)}`,
    token,
    rawPath: true,
  })
}
