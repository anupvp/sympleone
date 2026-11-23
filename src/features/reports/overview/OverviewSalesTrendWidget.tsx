import { useMemo, useState } from 'react'
import type { SalesTrendPoint } from '../../dashboard/types/dashboard.types'
import { formatSalesAmount } from '../../dashboard/utils/salesTrendFormat'

type TrendMode = 'sales' | 'orders'

interface MonthBucket {
  key: string
  label: string
  sales: number
  orders: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function bucketByMonth(points: SalesTrendPoint[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>()
  for (const p of points) {
    const key = p.date.slice(0, 7)
    const month = Number(p.date.slice(5, 7))
    const label = MONTHS[month - 1] ?? key
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        key,
        label,
        sales: p.netSalesAmount,
        orders: p.orderCount,
      })
    } else {
      existing.sales += p.netSalesAmount
      existing.orders += p.orderCount
    }
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key))
}

export function OverviewSalesTrendWidget({
  points,
  currencySymbol,
}: {
  points: SalesTrendPoint[]
  currencySymbol: string
}) {
  const [mode, setMode] = useState<TrendMode>('sales')
  const buckets = useMemo(() => bucketByMonth(points), [points])

  if (buckets.length === 0) {
    return (
      <section className="reports-widget">
        <header className="reports-widget__head">
          <h2 className="reports-widget__title">Sales Trend</h2>
        </header>
        <p className="reports-panel__empty">No sales trend for this period.</p>
      </section>
    )
  }

  const values = buckets.map((b) => (mode === 'sales' ? b.sales : b.orders))
  const max = Math.max(...values, 1)
  const chartH = 140
  const barGap = 10
  const barW = Math.min(48, Math.max(28, Math.floor(320 / buckets.length) - barGap))

  return (
    <section className="reports-widget reports-widget--wide">
      <header className="reports-widget__head">
        <h2 className="reports-widget__title">Sales Trend</h2>
        <div className="reports-widget__toggle" role="tablist" aria-label="Sales trend metric">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sales'}
            className={`reports-widget__toggle-btn${mode === 'sales' ? ' is-active' : ''}`}
            onClick={() => setMode('sales')}
          >
            Sales ({currencySymbol} L)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'orders'}
            className={`reports-widget__toggle-btn${mode === 'orders' ? ' is-active' : ''}`}
            onClick={() => setMode('orders')}
          >
            Orders
          </button>
        </div>
      </header>
      <div className="reports-bar-chart" role="img">
        <div className="reports-bar-chart__y">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <span key={t}>{Math.round(max * t).toLocaleString('en-IN')}</span>
          ))}
        </div>
        <div className="reports-bar-chart__plot">
          {buckets.map((bucket, i) => {
            const val = mode === 'sales' ? bucket.sales : bucket.orders
            const h = (val / max) * chartH
            const isLast = i === buckets.length - 1
            return (
              <div key={bucket.key} className="reports-bar-chart__col">
                <div
                  className={`reports-bar-chart__bar${isLast ? ' reports-bar-chart__bar--emphasis' : ''}`}
                  style={{ height: `${h}px`, width: `${barW}px` }}
                  title={
                    mode === 'sales'
                      ? `${bucket.label}: ${formatSalesAmount(val, currencySymbol)}`
                      : `${bucket.label}: ${val} orders`
                  }
                />
                <span className="reports-bar-chart__x">{bucket.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}