import { mockStatCards } from '../../data/dashboard.mock'
import { ModuleFrame } from '../../components/ModuleFrame'
import type { DashboardModuleState, StatCardData } from '../../types/dashboard.types'
import { StatCard } from './StatCard'

interface StatCardsModuleProps {
  module: DashboardModuleState<StatCardData[]>
}

function mergeKpiCards(apiCards: StatCardData[] | null | undefined): StatCardData[] {
  const template = mockStatCards
  if (!apiCards?.length) {
    return template
  }
  const byId = new Map(apiCards.map((c) => [c.id, c]))
  return template.map((card) => {
    const fromApi = byId.get(card.id)
    if (!fromApi) {
      return card
    }
    return {
      ...card,
      value: fromApi.value,
      changePercent: fromApi.changePercent,
      comparisonLabel: fromApi.comparisonLabel || card.comparisonLabel,
    }
  })
}

export function StatCardsModule({ module }: StatCardsModuleProps) {
  const cards = mergeKpiCards(module.data)

  return (
    <ModuleFrame status={module.status} error={module.error} className="stat-cards-module">
      <div className="stat-cards-grid">
        {cards.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>
    </ModuleFrame>
  )
}
