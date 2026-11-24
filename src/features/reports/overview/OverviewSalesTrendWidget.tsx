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
const MONTH_WINDOW = 5

function monthKey(year: number, monthIndex0: number): string {
  const month = monthIndex0 + 1
  return `${year}-${String(month).padStart(2, '0')}`
}

function labelForMonthKey(key: string): string {
  const month = Number(key.slice(5, 7))
  return MONTHS[month - 1] ?? key
}

function parsePointDate(dateStr: string): Date | null {
  const raw = dateStr.trim()
  if (!raw) {
    return null
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(`${raw.slice(0, 10)}T12:00:00`)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

function parsePeriodEnd(periodEnd: string | undefined): Date {
  if (periodEnd?.trim()) {
    const d = parsePointDate(periodEnd.trim().slice(0, 10))
    if (d) {
      return d
    }
  }
  return new Date()
}

/** Rolling 5 calendar months ending at the anchor month (inclusive). */
function buildFiveMonthKeys(anchor: Date): string[] {
  const keys: string[] = []
  const anchorMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  for (let offset = MONTH_WINDOW - 1; offset >= 0; offset -= 1) {
    const d = new Date(anchorMonth.getFullYear(), anchorMonth.getMonth() - offset, 1)
    keys.push(monthKey(d.getFullYear(), d.getMonth()))
  }
  return keys
}

function aggregateFiveMonths(points: SalesTrendPoint[], periodEnd: string | undefined): MonthBucket[] {
  const anchor = parsePeriodEnd(periodEnd)
  const monthKeys = buildFiveMonthKeys(anchor)
  const map = new Map(
    monthKeys.map((key) => [key, { key, label: labelForMonthKey(key), sales: 0, orders: 0 }]),
  )

  const allowed = new Set(monthKeys)
  for (const p of points) {
    const d = parsePointDate(p.date)
    if (!d) {
      continue
    }
    const key = monthKey(d.getFullYear(), d.getMonth())
    if (!allowed.has(key)) {
      continue
    }
    const bucket = map.get(key)
    if (!bucket) {
      continue
    }
    bucket.sales += p.netSalesAmount
    bucket.orders += p.orderCount
  }

  return monthKeys.map((key) => map.get(key)!)
}

export function OverviewSalesTrendWidget({
  points,
  currencySymbol,
  periodEnd,
}: {
  points: SalesTrendPoint[]
  currencySymbol: string
  /** Dashboard filter end date (YYYY-MM-DD); chart ends on this month. */
  periodEnd?: string
}) {
  const [mode, setMode] = useState<TrendMode>('sales')
  const buckets = useMemo(() => aggregateFiveMonths(points, periodEnd), [points, periodEnd])

  const hasAnyData = buckets.some((b) => b.sales > 0 || b.orders > 0)

  if (!hasAnyData) {
    return (
      <section className="reports-widget">
        <header className="reports-widget__head">
          <h2 className="reports-widget__title">Sales Trend</h2>
        </header>
        <p className="reports-panel__empty">No sales trend for the last five months.</p>
      </section>
    )
  }

  const values = buckets.map((b) => (mode === 'sales' ? b.sales : b.orders))
  const max = Math.max(...values, 1)
  const chartH = 140
  const barW = 40

  const formatYAxis = (value: number) => {
    if (mode === 'sales') {
      const lakhs = value / 100_000
      if (lakhs >= 0.05) {
        return `${lakhs.toFixed(1)}L`
      }
      return Math.round(value).toLocaleString('en-IN')
    }
    return Math.round(value).toLocaleString('en-IN')
  }

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
      <div className="reports-bar-chart reports-bar-chart--five" role="img">
        <div className="reports-bar-chart__y">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <span key={t}>{formatYAxis(max * t)}</span>
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