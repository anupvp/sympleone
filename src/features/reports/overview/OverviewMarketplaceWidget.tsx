import { useMemo } from 'react'
import type { MarketplaceRow } from '../../dashboard/types/dashboard.types'
import { formatSalesAmount } from '../../dashboard/utils/salesTrendFormat'
import type { SalesTrendPoint } from '../../dashboard/types/dashboard.types'

interface MarketplaceBar {
  id: string
  name: string
  amount: number
  orders: number
}

function parseAmountText(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, '')
  const match = /^([\d.]+)([KkLlCc]r?)?$/.exec(cleaned)
  if (!match) {
    return null
  }
  const n = Number(match[1])
  const suffix = (match[2] ?? '').toLowerCase()
  if (suffix.startsWith('l')) {
    return n * 100_000
  }
  if (suffix.startsWith('c')) {
    return n * 10_000_000
  }
  if (suffix.startsWith('k')) {
    return n * 1_000
  }
  return n
}

export function OverviewMarketplaceWidget({
  rows,
  salesPoints,
  currencySymbol,
  totalSalesLabel,
}: {
  rows: MarketplaceRow[]
  salesPoints: SalesTrendPoint[]
  currencySymbol: string
  totalSalesLabel?: string
}) {
  const bars = useMemo((): MarketplaceBar[] => {
    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        amount: parseAmountText(row.gmv) ?? parseAmountText(row.netSales) ?? 0,
        orders: row.orders,
      }))
    }
    const total = salesPoints.reduce((sum, p) => sum + p.netSalesAmount, 0)
    if (total <= 0 && !totalSalesLabel) {
      return []
    }
    return [
      {
        id: 'amazon',
        name: 'Amazon',
        amount: total > 0 ? total : parseAmountText(totalSalesLabel ?? '') ?? 0,
        orders: salesPoints.reduce((sum, p) => sum + p.orderCount, 0),
      },
    ]
  }, [rows, salesPoints, totalSalesLabel])

  const total = bars.reduce((sum, b) => sum + b.amount, 0)

  return (
    <section className="reports-widget">
      <header className="reports-widget__head">
        <h2 className="reports-widget__title">Sales by Marketplace</h2>
      </header>
      {bars.length === 0 ? (
        <p className="reports-panel__empty">No marketplace sales for this period.</p>
      ) : (
        <ul className="reports-marketplace-bars">
          {bars.map((bar, index) => {
            const pct = total > 0 ? (bar.amount / total) * 100 : 0
            const shades = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc']
            const color = shades[index % shades.length]
            return (
              <li key={bar.id} className="reports-marketplace-bars__row">
                <div className="reports-marketplace-bars__head">
                  <span className="reports-marketplace-bars__name">{bar.name}</span>
                  <span className="reports-marketplace-bars__value">
                    {formatSalesAmount(bar.amount, currencySymbol)}
                    <span className="reports-marketplace-bars__pct">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="reports-marketplace-bars__track">
                  <div
                    className="reports-marketplace-bars__fill"
                    style={{ width: `${Math.max(pct, 2)}%`, background: color }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}