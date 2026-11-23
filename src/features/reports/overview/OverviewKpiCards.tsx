import type { StatCardData } from '../../dashboard/types/dashboard.types'

export interface OverviewKpiMetric {
  id: string
  label: string
  value: string
  changePercent?: number | null
  comparisonLabel?: string
  accent: 'green' | 'blue' | 'teal' | 'amber' | 'rose' | 'slate'
  icon: 'rupee' | 'cart' | 'truck' | 'clock' | 'return' | 'cancel'
}

const ICONS: Record<OverviewKpiMetric['icon'], string> = {
  rupee: 'M9 8h6M12 8V5M7 12h10M9 16h6',
  cart: 'M4 6h2l2 10h9l2-8H8',
  truck: 'M3 12h11v5H3zM14 12h3l2 3v2h-5zM7 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  clock: 'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  return: 'M6 9l-6 6 6 6M6 21V9',
  cancel: 'M8 8l8 8M16 8l-8 8M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
}

export function buildOverviewKpis(
  stats: StatCardData[],
  orderCounts: {
    delivered: number
    pending: number
    cancelled: number
    total: number
  },
): OverviewKpiMetric[] {
  const byId = new Map(stats.map((s) => [s.id, s]))
  const gmv = byId.get('gmv')
  const orders = byId.get('net-sales')

  return [
    {
      id: 'total-sales',
      label: 'Total Sales',
      value: gmv?.value ?? '—',
      changePercent: gmv?.changePercent,
      comparisonLabel: gmv?.comparisonLabel,
      accent: 'green',
      icon: 'rupee',
    },
    {
      id: 'total-orders',
      label: 'Total Orders',
      value: orders?.value ?? orderCounts.total.toLocaleString('en-IN'),
      changePercent: orders?.changePercent,
      comparisonLabel: orders?.comparisonLabel,
      accent: 'blue',
      icon: 'cart',
    },
    {
      id: 'delivered',
      label: 'Delivered Orders',
      value: orderCounts.delivered.toLocaleString('en-IN'),
      accent: 'teal',
      icon: 'truck',
    },
    {
      id: 'pending',
      label: 'Pending Orders',
      value: orderCounts.pending.toLocaleString('en-IN'),
      accent: 'amber',
      icon: 'clock',
    },
    {
      id: 'returned',
      label: 'Returned Orders',
      value: '—',
      accent: 'rose',
      icon: 'return',
    },
    {
      id: 'cancelled',
      label: 'Cancelled Orders',
      value: orderCounts.cancelled.toLocaleString('en-IN'),
      accent: 'slate',
      icon: 'cancel',
    },
  ]
}

export function OverviewKpiCards({
  metrics,
  loading,
}: {
  metrics: OverviewKpiMetric[]
  loading?: boolean
}) {
  return (
    <div className="reports-overview-kpis" aria-busy={loading}>
      {metrics.map((metric) => {
        const change = metric.changePercent
        const hasChange = change !== undefined && change !== null
        const positive = hasChange && change >= 0
        return (
          <article key={metric.id} className={`reports-overview-kpi reports-overview-kpi--${metric.accent}`}>
            <div className={`reports-overview-kpi__icon reports-overview-kpi__icon--${metric.accent}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d={ICONS[metric.icon]} />
              </svg>
            </div>
            <div className="reports-overview-kpi__body">
              <p className="reports-overview-kpi__label">{metric.label}</p>
              <p className="reports-overview-kpi__value">{loading ? '…' : metric.value}</p>
              {hasChange && !loading && (
                <p className={`reports-overview-kpi__change${positive ? ' is-up' : ' is-down'}`}>
                  {positive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                  {metric.comparisonLabel ? (
                    <span className="reports-overview-kpi__compare"> {metric.comparisonLabel}</span>
                  ) : null}
                </p>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}