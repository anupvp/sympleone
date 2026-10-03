import { ModuleFrame } from '../../components/ModuleFrame'
import { SalesTrendPeriodControl } from '../../components/SalesTrendPeriodControl'
import type { DashboardModuleState, SalesTrendData } from '../../types/dashboard.types'

interface SalesTrendModuleProps {
  module: DashboardModuleState<SalesTrendData>
}

export function SalesTrendModule({ module }: SalesTrendModuleProps) {
  const data = module.data
  const width = 520
  const height = 200
  const pad = { top: 16, right: 12, bottom: 28, left: 44 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  let chart = null
  if (data?.points.length) {
    const points = data.points
    const maxY = Math.max(
      ...points.flatMap((p) => [p.netSales, p.previousPeriod]),
      1,
    )
    const step = innerW / Math.max(points.length - 1, 1)

    const toPath = (key: 'netSales' | 'previousPeriod') =>
      points
        .map((p, i) => {
          const x = pad.left + i * step
          const y = pad.top + innerH - (p[key] / maxY) * innerH
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' ')

    chart = (
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sales trend">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.top + innerH * (1 - t)
          const label = `${data.currencySymbol}${Math.round(maxY * t)}L`
          return (
            <g key={t}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} className="line-chart__grid" />
              <text x={4} y={y + 4} className="line-chart__axis">{label}</text>
            </g>
          )
        })}
        <path d={toPath('previousPeriod')} className="line-chart__line line-chart__line--muted" />
        <path d={toPath('netSales')} className="line-chart__line line-chart__line--primary" />
        {points.map((p, i) => (
          <text
            key={p.date}
            x={pad.left + i * step}
            y={height - 6}
            className="line-chart__label"
            textAnchor="middle"
          >
            {p.date}
          </text>
        ))}
      </svg>
    )
  }

  return (
    <ModuleFrame
      title="Sales Trend"
      status={module.status}
      error={module.error}
      className="chart-card"
      action={<SalesTrendPeriodControl />}
    >
      <div className="chart-legend">
        <span><i className="dot dot--primary" /> Orders</span>
        <span><i className="dot dot--muted" /> Previous Period</span>
      </div>
      {chart}
    </ModuleFrame>
  )
}
