import { mockStatCards } from '../../data/dashboard.mock'
import { useAppSelector } from '../../../../app/hooks'
import { needsSellerDashboardContext } from '../../../auth/auth.utils'
import { ModuleFrame } from '../../components/ModuleFrame'
import type { DashboardModuleState, StatCardData } from '../../types/dashboard.types'
import { StatCard } from './StatCard'

interface StatCardsModuleProps {
  module: DashboardModuleState<StatCardData[]>
}

function placeholderStatCards(): StatCardData[] {
  return mockStatCards.map((card) => ({
    ...card,
    value: '—',
    changePercent: 0,
    comparisonLabel: '',
    subline: undefined,
    sparkline: undefined,
    placeholder: true,
  }))
}

function mergeKpiCards(apiCards: StatCardData[] | null | undefined): StatCardData[] {
  const template = mockStatCards
  if (!apiCards?.length) {
    return placeholderStatCards()
  }
  const byId = new Map(apiCards.map((c) => [c.id, c]))
  return template.map((card) => {
    const fromApi = byId.get(card.id)
    if (!fromApi) {
      return {
        ...card,
        value: '—',
        changePercent: 0,
        comparisonLabel: '',
        subline: undefined,
        sparkline: undefined,
        placeholder: true,
      }
    }
    return {
      ...card,
      value: fromApi.value,
      changePercent: fromApi.changePercent,
      comparisonLabel: fromApi.comparisonLabel || card.comparisonLabel,
      placeholder: false,
    }
  })
}

export function StatCardsModule({ module }: StatCardsModuleProps) {
  const user = useAppSelector((s) => s.auth.user)
  const sellerId = useAppSelector((s) => s.dashboard.filters.sellerId)
  const needsSeller = needsSellerDashboardContext(user)
  const noSellerContext = needsSeller && !sellerId?.trim()

  const cards = noSellerContext ? placeholderStatCards() : mergeKpiCards(module.data)

  return (
    <ModuleFrame status={module.status} error={noSellerContext ? null : module.error} className="stat-cards-module">
      <div className="stat-cards-grid">
        {cards.map((metric) => (
          <StatCard key={metric.id} metric={metric} />
        ))}
      </div>
    </ModuleFrame>
  )
}
