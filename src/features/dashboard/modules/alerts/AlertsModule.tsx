import { ModuleFrame } from '../../components/ModuleFrame'
import type { AlertActionItem, DashboardModuleState } from '../../types/dashboard.types'
import { AlertActionCard } from './AlertActionCard'

interface AlertsModuleProps {
  module: DashboardModuleState<AlertActionItem[]>
}

export function AlertsModule({ module }: AlertsModuleProps) {
  return (
    <ModuleFrame
      title="Alerts / Action Center"
      status={module.status}
      error={module.error}
      className="alerts-module"
    >
      <div className="alerts-scroll">
        {module.data?.map((item) => (
          <AlertActionCard key={item.id} item={item} />
        ))}
      </div>
    </ModuleFrame>
  )
}
