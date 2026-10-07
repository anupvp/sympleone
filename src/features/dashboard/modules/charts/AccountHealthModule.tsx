import { useMemo } from 'react'
import { useAppSelector } from '../../../../app/hooks'
import { ModuleFrame } from '../../components/ModuleFrame'
import type { AccountHealthMetric, DashboardModuleState, AccountHealthData } from '../../types/dashboard.types'
import {
  openAccountHealthReport,
  type AccountHealthMetricId,
} from '../../utils/accountHealthReport'
import './AccountHealthModule.css'

interface AccountHealthModuleProps {
  module: DashboardModuleState<AccountHealthData>
}

const LIST_IDS: AccountHealthMetricId[] = [
  'policyViolation',
  'paymentHold',
  'lowInventory',
  'adsBudgetExhausted',
  'orderDefectRate',
]

function metricDetail(metric: AccountHealthMetric): string {
  switch (metric.id) {
    case 'policyViolation':
      return `${Math.max(1, Math.round(metric.score / 18))} issue`
    case 'paymentHold':
      return '₹1,25,000 on hold'
    case 'lowInventory':
      return '98 products'
    case 'adsBudgetExhausted':
      return '3 campaigns'
    case 'orderDefectRate':
      return `${metric.score.toFixed(1)}% rate`
    case 'orderCancellationRate':
      return `${metric.score.toFixed(1)}% rate`
    default:
      return `${Math.max(1, Math.round(metric.score / 15))} issues`
  }
}

function HealthRow({ metric }: { metric: AccountHealthMetric }) {
  const filters = useAppSelector((s) => s.dashboard.filters)

  return (
    <li>
      <button
        type="button"
        className="account-health-v2__row"
        onClick={() => openAccountHealthReport(metric.id as AccountHealthMetricId, filters)}
      >
        <span className="account-health-v2__row-text">
          <span className="account-health-v2__row-label">{metric.label}</span>
          <span className="account-health-v2__row-detail">{metricDetail(metric)}</span>
        </span>
        <span className="account-health-v2__chevron" aria-hidden>›</span>
      </button>
    </li>
  )
}

export function AccountHealthModule({ module }: AccountHealthModuleProps) {
  const metrics = module.data?.metrics ?? []

  const overall = useMemo(() => {
    if (!metrics.length) {
      return { score: 78, label: 'Good' }
    }
    const avgRisk = metrics.reduce((s, m) => s + m.score, 0) / metrics.length
    const score = Math.round(Math.max(40, Math.min(98, 100 - avgRisk * 0.65)))
    const label = score >= 75 ? 'Good' : score >= 55 ? 'Fair' : 'At risk'
    return { score, label }
  }, [metrics])

  const listMetrics = useMemo(() => {
    const map = new Map(metrics.map((m) => [m.id, m]))
    const healthIssues: AccountHealthMetric = map.get('orderCancellationRate') ?? {
      id: 'orderCancellationRate',
      label: 'Health Issues',
      score: 12,
      status: 'good',
    }
    const rows: AccountHealthMetric[] = [
      { ...healthIssues, label: 'Health Issues' },
      ...LIST_IDS.map((id) => map.get(id)).filter(Boolean) as AccountHealthMetric[],
    ]
    return rows
  }, [metrics])

  const gaugeSize = 120
  const stroke = 12
  const r = (gaugeSize - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (overall.score / 100) * c

  return (
    <ModuleFrame
      title="Account Health"
      status={module.status}
      error={module.error}
      className="chart-card account-health-v2"
    >
      <div className="account-health-v2__layout">
        <div className="account-health-v2__gauge">
          <svg width={gaugeSize} height={gaugeSize} viewBox={`0 0 ${gaugeSize} ${gaugeSize}`} aria-hidden>
            <circle cx={gaugeSize / 2} cy={gaugeSize / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle
              cx={gaugeSize / 2}
              cy={gaugeSize / 2}
              r={r}
              fill="none"
              stroke="#22c55e"
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${gaugeSize / 2} ${gaugeSize / 2})`}
            />
          </svg>
          <div className="account-health-v2__gauge-center">
            <strong>{overall.score}</strong>
            <span>{overall.label}</span>
          </div>
        </div>
        <ul className="account-health-v2__list">
          {listMetrics.map((metric) => (
            <HealthRow key={metric.id + metric.label} metric={metric} />
          ))}
        </ul>
      </div>
    </ModuleFrame>
  )
}
