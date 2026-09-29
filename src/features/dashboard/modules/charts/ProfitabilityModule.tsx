import { ModuleFrame } from '../../components/ModuleFrame'
import type { DashboardModuleState, ProfitabilityData } from '../../types/dashboard.types'

interface ProfitabilityModuleProps {
  module: DashboardModuleState<ProfitabilityData>
}

export function ProfitabilityModule({ module }: ProfitabilityModuleProps) {
  const data = module.data
  const size = 160
  const stroke = 22
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  let rings = null
  if (data?.segments.length) {
    let offset = 0
    rings = data.segments.map((seg) => {
      const dash = (seg.percent / 100) * circumference
      const circle = (
        <circle
          key={seg.id}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={-offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )
      offset += dash
      return circle
    })
  }

  return (
    <ModuleFrame
      title="Profitability Breakdown"
      status={module.status}
      error={module.error}
      className="chart-card"
    >
      {data && (
        <div className="donut-layout">
          <div className="donut-wrap">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={stroke}
              />
              {rings}
            </svg>
            <div className="donut-center">
              <strong>{data.centerValue}</strong>
              <span>{data.centerLabel}</span>
            </div>
          </div>
          <ul className="donut-legend">
            {data.segments.map((seg) => (
              <li key={seg.id}>
                <span className="donut-legend__dot" style={{ background: seg.color }} />
                <span className="donut-legend__label">{seg.label}</span>
                <span className="donut-legend__value">
                  ₹{seg.amount}L ({seg.percent}%)
                </span>
              </li>
            ))}
            <li className="donut-legend__total">
              <span>{data.netProfit.label}</span>
              <strong>
                {data.netProfit.amount} ({data.netProfit.percent}%)
              </strong>
            </li>
          </ul>
        </div>
      )}
    </ModuleFrame>
  )
}
