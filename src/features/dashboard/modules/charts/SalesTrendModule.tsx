import { useState } from 'react'
import { ModuleFrame } from '../../components/ModuleFrame'
import type { DashboardModuleState, SalesTrendData } from '../../types/dashboard.types'
import {
  chartYMax,
  formatLakhAxisLabel,
  shortenXLabel,
  xLabelIndices,
  yAxisTicks,
} from '../../utils/chartAxisUtils'
import {
  chartOrderYMax,
  formatOrderCount,
  formatSalesAmount,
  orderAxisTicks,
} from '../../utils/salesTrendFormat'

interface SalesTrendModuleProps {
  module: DashboardModuleState<SalesTrendData>
}

export function SalesTrendModule({ module }: SalesTrendModuleProps) {
  const data = module.data
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 520
  const height = 200
  const pad = { top: 16, right: 40, bottom: 32, left: 48 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  let chart = null
  const chartPoints = data?.points
  if (chartPoints && chartPoints.length > 0) {
    const points = chartPoints
    const symbol = data.currencySymbol
    const salesMax = Math.max(
      0,
      ...points.flatMap((p) => [Number(p.netSales) || 0, Number(p.previousPeriod) || 0]),
    )
    const ordersMax = Math.max(
      0,
      ...points.map((p) => Number(p.orderCount) || 0),
    )
    const maxYSales = chartYMax(salesMax)
    const maxYOrders = chartOrderYMax(ordersMax)
    const step = innerW / Math.max(points.length - 1, 1)
    const salesYTicks = yAxisTicks(maxYSales, 4)
    const orderYTicks = orderAxisTicks(maxYOrders, 4)
    const xIndices = new Set(xLabelIndices(points.length, 7))

    const salesY = (value: number) =>
      pad.top + innerH - (value / maxYSales) * innerH
    const orderY = (value: number) =>
      pad.top + innerH - (value / maxYOrders) * innerH

    const toSalesPath = (key: 'netSales' | 'previousPeriod') =>
      points
        .map((p, i) => {
          const x = pad.left + i * step
          const y = salesY(p[key])
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' ')

    const orderPath = points
      .map((p, i) => {
        const x = pad.left + i * step
        const y = orderY(Number(p.orderCount) || 0)
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')

    const activeIndex =
      hoverIndex !== null && hoverIndex >= 0 && hoverIndex < points.length
        ? hoverIndex
        : null
    const active = activeIndex !== null ? points[activeIndex] : null
    const tooltipX =
      activeIndex !== null ? pad.left + activeIndex * step : 0

    chart = (
      <div className="line-chart-wrap">
        <svg
          className="line-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Sales trend and order count"
        >
          {salesYTicks.map((tickValue) => {
            const y = salesY(tickValue)
            const label = formatLakhAxisLabel(tickValue, symbol)
            return (
              <g key={`sales-${tickValue}`}>
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
          {orderYTicks.map((tickValue) => {
            const y = orderY(tickValue)
            return (
              <text
                key={`orders-${tickValue}`}
                x={width - 4}
                y={y + 4}
                className="line-chart__axis line-chart__axis--right"
                textAnchor="end"
              >
                {formatOrderCount(tickValue)}
              </text>
            )
          })}
          <path
            d={toSalesPath('previousPeriod')}
            className="line-chart__line line-chart__line--muted"
          />
          <path
            d={toSalesPath('netSales')}
            className="line-chart__line line-chart__line--primary"
          />
          <path
            d={orderPath}
            className="line-chart__line line-chart__line--orders"
          />
          {activeIndex !== null && (
            <line
              x1={tooltipX}
              y1={pad.top}
              x2={tooltipX}
              y2={pad.top + innerH}
              className="line-chart__cursor"
            />
          )}
          {points.map((p, i) => {
            const x = pad.left + i * step
            const highlighted = activeIndex === i
            return (
              <g key={`${p.date}-${i}`}>
                <circle
                  cx={x}
                  cy={salesY(p.netSales)}
                  r={highlighted ? 4 : 0}
                  className="line-chart__dot line-chart__dot--primary"
                />
                <circle
                  cx={x}
                  cy={orderY(p.orderCount)}
                  r={highlighted ? 4 : 0}
                  className="line-chart__dot line-chart__dot--orders"
                />
              </g>
            )
          })}
          {points.map((p, i) =>
            xIndices.has(i) ? (
              <text
                key={`label-${p.date}-${i}`}
                x={pad.left + i * step}
                y={height - 8}
                className="line-chart__label"
                textAnchor="middle"
              >
                {shortenXLabel(p.date, points.length)}
              </text>
            ) : null,
          )}
          {points.map((_, i) => (
            <rect
              key={`hit-${i}`}
              x={pad.left + i * step - step / 2}
              y={pad.top}
              width={step}
              height={innerH}
              fill="transparent"
              className="line-chart__hit"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>
        {active && activeIndex !== null && (
          <div
            className="line-chart__tooltip"
            style={{
              left: `${(tooltipX / width) * 100}%`,
            }}
          >
            <p className="line-chart__tooltip-title">{active.date}</p>
            <dl className="line-chart__tooltip-rows">
              <div className="line-chart__tooltip-row">
                <dt>
                  <span className="dot dot--primary" /> Net sales
                </dt>
                <dd>{formatSalesAmount(active.netSalesAmount, symbol)}</dd>
              </div>
              <div className="line-chart__tooltip-row">
                <dt>
                  <span className="dot dot--muted" /> Previous period sales
                </dt>
                <dd>
                  {formatSalesAmount(active.previousPeriodAmount, symbol)}
                </dd>
              </div>
              <div className="line-chart__tooltip-row">
                <dt>
                  <span className="dot dot--orders" /> Orders
                </dt>
                <dd>{formatOrderCount(active.orderCount)}</dd>
              </div>
              <div className="line-chart__tooltip-row">
                <dt>Previous period orders</dt>
                <dd>{formatOrderCount(active.previousPeriodOrderCount)}</dd>
              </div>
            </dl>
          </div>
        )}
        <p className="line-chart__axis-hint">
          Left axis: net sales (lakhs). Right axis: order count.
        </p>
      </div>
    )
  }

  return (
    <ModuleFrame
      title="Sales Trend"
      status={module.status}
      error={module.error}
      className="chart-card"
    >
      <div className="chart-legend">
        <span><i className="dot dot--primary" /> Net sales</span>
        <span><i className="dot dot--muted" /> Previous period (sales)</span>
        <span><i className="dot dot--orders" /> Orders</span>
      </div>
      {chart}
    </ModuleFrame>
  )
}
