import type { OrderRow } from './ordersApi'

export type OrderStatusTabId =
  | 'pending'
  | 'pendingavailability'
  | 'unshipped'
  | 'partiallyshipped'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'unfulfillable'
  | 'invoiceunconfirmed'
  | 'other'

/** Same bucket logic as the Orders page status tabs. */
export function orderStatusTabId(row: OrderRow): OrderStatusTabId {
  const easyShip = (row.easy_ship_status ?? '').replace(/[\s_-]/g, '').toLowerCase()
  if (easyShip === 'delivered') {
    return 'delivered'
  }
  const status = (row.order_status ?? '').replace(/[\s_-]/g, '').toLowerCase()
  if (status === 'cancelled' || status === 'canceled') {
    return 'canceled'
  }
  const known: OrderStatusTabId[] = [
    'pending',
    'pendingavailability',
    'unshipped',
    'partiallyshipped',
    'shipped',
    'unfulfillable',
    'invoiceunconfirmed',
  ]
  if (known.includes(status as OrderStatusTabId)) {
    return status as OrderStatusTabId
  }
  return 'other'
}

const PENDING_KPI_TABS: ReadonlySet<OrderStatusTabId> = new Set([
  'pending',
  'pendingavailability',
  'unshipped',
  'partiallyshipped',
  'unfulfillable',
  'invoiceunconfirmed',
])

export interface OrderOverviewCounts {
  total: number
  delivered: number
  pending: number
  cancelled: number
  shipped: number
  other: number
}

export type OrderStatusTally = Record<OrderStatusTabId, number>

export function tallyOrderStatusTabs(orders: OrderRow[]): OrderStatusTally {
  const tally: OrderStatusTally = {
    pending: 0,
    pendingavailability: 0,
    unshipped: 0,
    partiallyshipped: 0,
    shipped: 0,
    delivered: 0,
    canceled: 0,
    unfulfillable: 0,
    invoiceunconfirmed: 0,
    other: 0,
  }
  for (const row of orders) {
    const tab = orderStatusTabId(row)
    tally[tab] += 1
  }
  return tally
}

export function statusTabLabel(tab: OrderStatusTabId | 'all'): string {
  const labels: Record<OrderStatusTabId | 'all', string> = {
    all: 'All Orders',
    pending: 'Pending',
    pendingavailability: 'Pending availability',
    unshipped: 'Unshipped',
    partiallyshipped: 'Partially shipped',
    shipped: 'Shipped',
    delivered: 'Delivered',
    canceled: 'Cancelled',
    unfulfillable: 'Unfulfillable',
    invoiceunconfirmed: 'Invoice unconfirmed',
    other: 'Other',
  }
  return labels[tab]
}

export function countOrdersByStatusTab(orders: OrderRow[]): OrderOverviewCounts {
  const tally: Partial<Record<OrderStatusTabId, number>> = {}
  for (const row of orders) {
    const tab = orderStatusTabId(row)
    tally[tab] = (tally[tab] ?? 0) + 1
  }
  let pending = 0
  for (const tab of PENDING_KPI_TABS) {
    pending += tally[tab] ?? 0
  }
  return {
    total: orders.length,
    delivered: tally.delivered ?? 0,
    pending,
    cancelled: tally.canceled ?? 0,
    shipped: tally.shipped ?? 0,
    other: tally.other ?? 0,
  }
}

export interface OrderDistributionSegment {
  status: string
  label: string
  count: number
  percentage: number
  color: string
}

const DONUT_COLORS = {
  delivered: '#22C55E',
  pending: '#F59E0B',
  shipped: '#3B82F6',
  cancelled: '#EF4444',
  other: '#A855F7',
} as const

function integerPercentages(counts: Record<string, number>, total: number): Record<string, number> {
  if (total <= 0) {
    return Object.fromEntries(Object.keys(counts).map((k) => [k, 0]))
  }
  const raw = Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, (v / total) * 100]))
  const floors = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.floor(v)]))
  let remainder = 100 - Object.values(floors).reduce((a, b) => a + b, 0)
  const byFrac = Object.keys(raw).sort((a, b) => (raw[b] - floors[b]) - (raw[a] - floors[a]))
  const pct = { ...floors }
  let i = 0
  while (remainder > 0 && byFrac.length > 0) {
    const key = byFrac[i % byFrac.length]
    pct[key] += 1
    remainder -= 1
    i += 1
  }
  return pct
}

/** Donut + legend buckets aligned with Orders page tab logic. */
export function buildOrderDistributionFromOrders(orders: OrderRow[]): {
  total: number
  segments: OrderDistributionSegment[]
} {
  const c = countOrdersByStatusTab(orders)
  const buckets = {
    delivered: c.delivered,
    pending: c.pending,
    shipped: c.shipped,
    cancelled: c.cancelled,
    other: c.other,
  }
  const total = c.total
  const pct = integerPercentages(buckets, total)
  const segments: OrderDistributionSegment[] = [
    { status: 'DELIVERED', label: 'Delivered', count: buckets.delivered, percentage: pct.delivered, color: DONUT_COLORS.delivered },
    { status: 'PENDING', label: 'Pending', count: buckets.pending, percentage: pct.pending, color: DONUT_COLORS.pending },
    { status: 'SHIPPED', label: 'Shipped', count: buckets.shipped, percentage: pct.shipped, color: DONUT_COLORS.shipped },
    { status: 'CANCELLED', label: 'Cancelled', count: buckets.cancelled, percentage: pct.cancelled, color: DONUT_COLORS.cancelled },
    { status: 'OTHER', label: 'Other', count: buckets.other, percentage: pct.other, color: DONUT_COLORS.other },
  ]
  return { total, segments }
}