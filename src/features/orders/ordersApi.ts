import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'
import type { DashboardFilters } from '../dashboard/types/dashboard.types'
import { resolveSalesDateRange } from '../dashboard/utils/salesPeriodUtils'
import { ordersCreatedRange } from './ordersQueryParams'

export interface OrderMoney {
  currency_code: string
  amount: string
}

export type OrderFulfillmentType = 'FBA' | 'FBM' | 'SELF_SHIP'

export interface OrderRow {
  amazon_order_id: string
  purchase_date: string | null
  order_status: string | null
  order_total: OrderMoney | null
  payment_method: string | null
  fulfillment_channel: string | null
  fulfillment_type: OrderFulfillmentType
  fulfillment_label: string
  is_prime: boolean
  sales_channel: string | null
  ship_city: string | null
  ship_state: string | null
  easy_ship_status: string | null
  shipment_service_level: string | null
  number_of_items_shipped: number
  number_of_items_unshipped: number
}

export interface OrdersFulfillmentSummary {
  total: number
  fba: number
  fbm: number
  self_ship: number
}

export interface OrdersListResponse {
  orders: OrderRow[]
  created_after: string | null
  created_before: string | null
  summary: OrdersFulfillmentSummary
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

export async function fetchOrders(token: string, filters: DashboardFilters): Promise<OrdersListResponse> {
  const data = await apiRequest<OrdersListResponse>({
    method: 'GET',
    endpoint: `${API_CONFIG.endpoints.orders}${ordersQuery(filters)}`,
    token,
    rawPath: true,
  })
  const orders = data.orders.map((row) => {
    const fulfillment_type = row.fulfillment_type ?? inferFulfillmentType(row)
    return {
      ...row,
      fulfillment_type,
      fulfillment_label: row.fulfillment_label ?? labelForType(fulfillment_type),
    }
  })
  const summary =
    data.summary && data.summary.total > 0
      ? data.summary
      : buildFulfillmentSummary(orders)
  return { ...data, orders, summary }
}

function labelForType(type: OrderFulfillmentType): string {
  if (type === 'FBA') {
    return 'FBA'
  }
  if (type === 'SELF_SHIP') {
    return 'Self Ship'
  }
  return 'FBM'
}

function buildFulfillmentSummary(orders: OrderRow[]): OrdersFulfillmentSummary {
  const summary: OrdersFulfillmentSummary = {
    total: orders.length,
    fba: 0,
    fbm: 0,
    self_ship: 0,
  }
  for (const row of orders) {
    const t = row.fulfillment_type ?? inferFulfillmentType(row)
    if (t === 'FBA') {
      summary.fba += 1
    } else if (t === 'SELF_SHIP') {
      summary.self_ship += 1
    } else {
      summary.fbm += 1
    }
  }
  return summary
}

function inferFulfillmentType(row: OrderRow): OrderFulfillmentType {
  const ch = (row.fulfillment_channel ?? '').toUpperCase()
  if (ch === 'AFN') {
    return 'FBA'
  }
  if (row.easy_ship_status?.trim()) {
    return 'SELF_SHIP'
  }
  return 'FBM'
}

