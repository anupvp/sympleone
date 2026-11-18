import { useMemo, useState } from 'react'
import type { FinanceDailyPoint, FinanceTypeBreakdown } from './financesApi'

function formatMoney(amount: number, currency: string) {
  const sym = currency === 'INR' ? '₹' : `${currency} `
  const abs = Math.abs(amount)
  const formatted =
    abs >= 1000 ? `${(amount / 1000).toFixed(1)}K` : amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return `${sym}${formatted}`
}

function shortDate(iso: string) {
  try {
    const d = new Date(`${iso}T00:00:00`)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

interface FinancesTransactionsChartProps {
  dailySeries: FinanceDailyPoint[]
  byType: FinanceTypeBreakdown[]
  currencyCode: string
}

export function FinancesTransactionsChart({
  dailySeries,
  byType,
  currencyCode,
}: FinancesTransactionsChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const pointsWithActivity = useMemo(
    () => dailySeries.filter((p) => p.count > 0),
    [dailySeries],
  )

  const width = 720
  const height = 220
  const pad = { top: 20, right: 24, bottom: 36, left: 52 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const chart = useMemo(() => {
    const series = dailySeries.length > 0 ? dailySeries : []
    if (series.length === 0) {
      return null
    }
    const values = series.map((p) => p.netAmount)
    const maxAbs = Math.max(1, ...values.map((v) => Math.abs(v)))
    const barGap = 2
    const barW = Math.max(4, innerW / series.length - barGap)
    const zeroY = pad.top + innerH / 2
    const scale = (innerH / 2 - 8) / maxAbs

    return series.map((point, i) => {
      const amount = point.netAmount
      const barH = Math.abs(amount) * scale
      const x = pad.left + i * (barW + barGap)
      const y = amount >= 0 ? zeroY - barH : zeroY
      return {
        ...point,
        x,
        y,
        w: barW,
        h: Math.max(barH, amount !== 0 ? 2 : 0),
        positive: amount >= 0,
      }
    })
  }, [dailySeries, innerH, innerW, pad.left, pad.top])

  const typeMax = Math.max(1, ...byType.map((t) => Math.abs(t.totalAmount)))

  const active =
    hoverIndex !== null && chart && hoverIndex >= 0 && hoverIndex < chart.length
      ? chart[hoverIndex]
      : null

  return (
    <div className="finances-chart-grid">
      <div className="finances-chart-panel">
        <p className="finances-chart-panel__label">Daily net amount</p>
        {chart && chart.length > 0 ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="finances-chart-svg"
            role="img"
            aria-label="Daily finance transaction amounts"
          >
            <line
              x1={pad.left}
              y1={pad.top + innerH / 2}
              x2={width - pad.right}
              y2={pad.top + innerH / 2}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
            {chart.map((bar, i) => (
              <rect
                key={bar.date}
                x={bar.x}
                y={bar.y}
                width={bar.w}
                height={bar.h}
                rx={2}
                fill={bar.positive ? '#10b981' : '#ef4444'}
                opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.35}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            ))}
            {pointsWithActivity.length <= 12 &&
              chart
                .filter((_, i) => dailySeries[i]?.count > 0)
                .map((bar) => (
                  <text
                    key={`${bar.date}-label`}
                    x={bar.x + bar.w / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#64748b"
                    transform={
                      chart.length > 20 ? `rotate(-40 ${bar.x + bar.w / 2} ${height - 10})` : undefined
                    }
                  >
                    {shortDate(bar.date)}
                  </text>
                ))}
            {active && (
              <g>
                <rect
                  x={Math.min(active.x, width - 160)}
                  y={8}
                  width={150}
                  height={52}
                  rx={6}
                  fill="#0f172a"
                  opacity={0.92}
                />
                <text x={Math.min(active.x, width - 160) + 8} y={26} fill="#f8fafc" fontSize={11}>
                  {shortDate(active.date)}
                </text>
                <text x={Math.min(active.x, width - 160) + 8} y={42} fill="#cbd5e1" fontSize={11}>
                  {formatMoney(active.netAmount, currencyCode)} · {active.count} txn
                </text>
              </g>
            )}
          </svg>
        ) : (
          <p className="finances-chart-empty">No transactions in this period.</p>
        )}
      </div>

      <div className="finances-chart-panel finances-chart-panel--types">
        <p className="finances-chart-panel__label">By transaction type</p>
        {byType.length > 0 ? (
          <ul className="finances-type-bars">
            {byType.slice(0, 8).map((row) => {
              const pct = (Math.abs(row.totalAmount) / typeMax) * 100
              return (
                <li key={row.transactionType} className="finances-type-bars__row">
                  <div className="finances-type-bars__head">
                    <span className="finances-type-bars__name">{row.transactionType}</span>
                    <span className="finances-type-bars__value">
                      {formatMoney(row.totalAmount, currencyCode)}
                      <span className="finances-type-bars__count">({row.count})</span>
                    </span>
                  </div>
                  <div className="finances-type-bars__track">
                    <div
                      className={`finances-type-bars__fill ${row.totalAmount >= 0 ? 'is-pos' : 'is-neg'}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="finances-chart-empty">No type breakdown available.</p>
        )}
      </div>
    </div>
  )
}