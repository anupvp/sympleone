import { ModuleFrame } from '../../components/ModuleFrame'
import { SalesTrendPeriodControl } from '../../components/SalesTrendPeriodControl'
import type { DashboardModuleState, SalesTrendData } from '../../types/dashboard.types'
import {
  chartYMax,
  formatLakhAxisLabel,
  shortenXLabel,
  xLabelIndices,
  yAxisTicks,
} from '../../utils/chartAxisUtils'

interface SalesTrendModuleProps {
  module: DashboardModuleState<SalesTrendData>
}

export function SalesTrendModule({ module }: SalesTrendModuleProps) {
  const data = module.data
  const width = 520
  const height = 200
  const pad = { top: 16, right: 12, bottom: 32, left: 48 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  let chart = null
  if (data?.points.length) {
    const points = data.points
    const dataMax = Math.max(
      ...points.flatMap((p) => [p.netSales, p.previousPeriod]),
      0,
    )
    const maxY = chartYMax(dataMax)
    const step = innerW / Math.max(points.length - 1, 1)
    const yTicks = yAxisTicks(maxY, 4)
    const xIndices = new Set(xLabelIndices(points.length, 7))

    const toPath = (key: 'netSales' | 'previousPeriod') =>
      points
        .map((p, i) => {
          const x = pad.left + i * step
          const y = pad.top + innerH - (p[key] / maxY) * innerH
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' ')

    chart = (
      <svg
        className="line-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Sales trend"
      >
        {yTicks.map((tickValue) => {
          const t = tickValue / maxY
          const y = pad.top + innerH * (1 - t)
          const label = formatLakhAxisLabel(tickValue, data.currencySymbol)
          return (
            <g key={tickValue}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                className="line-chart__grid"
              />
              <text x={4} y={y + 4} className="line-chart__axis">
                {label}
              </text>
            </g>
          )
        })}
        <path
          d={toPath('previousPeriod')}
          className="line-chart__line line-chart__line--muted"
        />
        <path
          d={toPath('netSales')}
          className="line-chart__line line-chart__line--primary"
        />
        {points.map((p, i) =>
          xIndices.has(i) ? (
            <text
              key={`${p.date}-${i}`}
              x={pad.left + i * step}
              y={height - 8}
              className="line-chart__label"
              textAnchor="middle"
            >
              {shortenXLabel(p.date, points.length)}
            </text>
          ) : null,
        )}
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
