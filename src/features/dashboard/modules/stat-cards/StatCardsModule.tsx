import { ModuleFrame } from '../../components/ModuleFrame'
import type { DashboardModuleState, StatCardData } from '../../types/dashboard.types'
import { StatCard } from './StatCard'

interface StatCardsModuleProps {
  module: DashboardModuleState<StatCardData[]>
}

export function StatCardsModule({ module }: StatCardsModuleProps) {
  return (
    <ModuleFrame status={module.status} error={module.error} className="stat-cards-module">
      <div className="stat-cards-grid">
        {module.data?.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>
    </ModuleFrame>
  )
}
