export type OrdersKpiId = 'all' | 'pending' | 'unshipped' | 'shipped' | 'delivered' | 'canceled'

const KPI_DEF: { id: OrdersKpiId; label: string; accent: string }[] = [
  { id: 'all', label: 'All Orders', accent: 'blue' },
  { id: 'pending', label: 'Pending', accent: 'amber' },
  { id: 'unshipped', label: 'Unshipped', accent: 'orange' },
  { id: 'shipped', label: 'Shipped', accent: 'green' },
  { id: 'delivered', label: 'Delivered', accent: 'teal' },
  { id: 'canceled', label: 'Cancelled', accent: 'rose' },
]

const ICONS: Record<OrdersKpiId, string> = {
  all: 'M4 6h2l2 10h9l2-8H8',
  pending: 'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  unshipped: 'M5 8h14v3H5zM7 11v8M17 11v8M9 19h6',
  shipped: 'M3 12h11v5H3zM14 12h3l2 3v2h-5z',
  delivered: 'M5 12l5 5L19 7',
  canceled: 'M8 8l8 8M16 8l-8 8',
}

export interface OrdersSummaryKpisProps {
  counts: Record<OrdersKpiId, number>
  loading?: boolean
  activeId?: OrdersKpiId | null
  allOrdersChangePercent?: number | null
  onSelect?: (id: OrdersKpiId) => void
}

export function OrdersSummaryKpis({
  counts,
  loading,
  activeId,
  allOrdersChangePercent,
  onSelect,
}: OrdersSummaryKpisProps) {
  return (
    <div className="orders-kpi-row" aria-busy={loading}>
      {KPI_DEF.map((kpi) => {
        const isActive = activeId === kpi.id
        const change = kpi.id === 'all' ? allOrdersChangePercent : null
        const hasChange = change !== undefined && change !== null
        const positive = hasChange && change >= 0
        return (
          <button
            key={kpi.id}
            type="button"
            className={`orders-kpi${isActive ? ' orders-kpi--active' : ''}`}
            onClick={() => onSelect?.(kpi.id)}
            disabled={!onSelect}
          >
            <div className={`orders-kpi__icon orders-kpi__icon--${kpi.accent}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d={ICONS[kpi.id]} />
              </svg>
            </div>
            <div className="orders-kpi__body">
              <p className="orders-kpi__label">{kpi.label}</p>
              <p className="orders-kpi__value">{loading ? '…' : counts[kpi.id].toLocaleString('en-IN')}</p>
              {hasChange && !loading && (
                <p className={`orders-kpi__change${positive ? ' is-up' : ' is-down'}`}>
                  {positive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function ordersKpiCountsFromTally(
  allCount: number,
  tally: {
    pending: number
    unshipped: number
    shipped: number
    delivered: number
    canceled: number
  },
): Record<OrdersKpiId, number> {
  return {
    all: allCount,
    pending: tally.pending,
    unshipped: tally.unshipped,
    shipped: tally.shipped,
    delivered: tally.delivered,
    canceled: tally.canceled,
  }
}