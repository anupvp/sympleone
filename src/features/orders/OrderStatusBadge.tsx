import { orderStatusTabId, statusTabLabel, type OrderStatusTabId } from './orderMetrics'
import type { OrderRow } from './ordersApi'

const TAB_CLASS: Record<OrderStatusTabId, string> = {
  pending: 'pending',
  unshipped: 'pending',
  partiallyshipped: 'partiallyshipped',
  shipped: 'shipped',
  delivered: 'delivered',
  canceled: 'canceled',
  unfulfillable: 'unfulfillable',
  invoiceunconfirmed: 'unfulfillable',
  pendingavailability: 'pending',
  other: 'other',
}

function displayLabel(row: OrderRow, tab: OrderStatusTabId): string {
  if (row.easy_ship_status?.trim() && tab === 'delivered') {
    return 'Delivered'
  }
  const raw = row.order_status?.trim()
  if (raw) {
    const norm = raw.replace(/_/g, ' ')
    return norm.charAt(0).toUpperCase() + norm.slice(1).toLowerCase()
  }
  return statusTabLabel(tab)
}

export function OrderStatusBadge({ row }: { row: OrderRow }) {
  const tab = orderStatusTabId(row)
  const styleClass = TAB_CLASS[tab]
  const label = displayLabel(row, tab)
  return (
    <span className={`orders-status-pill orders-status-pill--${styleClass}`}>
      <span className="orders-status-pill__dot" aria-hidden />
      {label}
    </span>
  )
}