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

function meterClass(status: AccountHealthMetric['status']) {
  if (status === 'critical') {
    return 'account-health-meter__fill--critical'
  }
  if (status === 'warning') {
    return 'account-health-meter__fill--warning'
  }
  return 'account-health-meter__fill--good'
}

function HealthRow({ metric }: { metric: AccountHealthMetric }) {
  const filters = useAppSelector((s) => s.dashboard.filters)

  const onOpen = () => {
    openAccountHealthReport(metric.id as AccountHealthMetricId, filters)
  }

  return (
    <li>
      <button type="button" className="account-health-row" onClick={onOpen}>
        <span className="account-health-row__label">{metric.label}</span>
        <span className="account-health-meter" aria-hidden>
          <span
            className={`account-health-meter__fill ${meterClass(metric.status)}`}
            style={{ width: `${metric.score}%` }}
          />
        </span>
        <span className="account-health-row__score">{metric.score}%</span>
      </button>
    </li>
  )
}

export function AccountHealthModule({ module }: AccountHealthModuleProps) {
  const metrics = module.data?.metrics ?? []

  return (
    <ModuleFrame
      title="Account Health"
      status={module.status}
      error={module.error}
      className="chart-card account-health-card"
    >
      {metrics.length > 0 ? (
        <ul className="account-health-list">
          {metrics.map((metric) => (
            <HealthRow key={metric.id} metric={metric} />
          ))}
        </ul>
      ) : (
        <p className="account-health-empty">No account health data for this period.</p>
      )}
    </ModuleFrame>
  )
}
