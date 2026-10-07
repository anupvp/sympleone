import { useMemo } from 'react'
import { ModuleFrame } from '../../components/ModuleFrame'
import type { DashboardModuleState, SalesTrendData } from '../../types/dashboard.types'
import { aggregateIndiaDestinations } from '../../utils/aggregateIndiaDestinations'
import { formatSalesAmount } from '../../utils/salesTrendFormat'
import { IndiaSalesMap } from './IndiaSalesMap'

const TOP_STATE_COUNT = 5

interface SalesByRegionModuleProps {
  module: DashboardModuleState<SalesTrendData>
}

export function SalesByRegionModule({ module }: SalesByRegionModuleProps) {
  const symbol = module.data?.currencySymbol ?? '₹'
  const states = useMemo(
    () => aggregateIndiaDestinations(module.data?.destinations),
    [module.data?.destinations],
  )
  const salesByStateId = useMemo(
    () => Object.fromEntries(states.map((row) => [row.id, row.amount])),
    [states],
  )
  const topStates = states.slice(0, TOP_STATE_COUNT)

  return (
    <ModuleFrame
      title="Sales by Region"
      status={module.status}
      error={module.error}
      className="chart-card region-card"
    >
      <div className="region-layout">
        <IndiaSalesMap salesByStateId={salesByStateId} currencySymbol={symbol} />
        {topStates.length > 0 ? (
          <ol className="region-state-list">
            {topStates.map((row, index) => (
              <li key={row.id}>
                <span className="region-state-list__rank">{index + 1}</span>
                <span className="region-state-list__name">{row.name}</span>
                <span className="region-state-list__value">
                  {formatSalesAmount(row.amount, symbol)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="region-state-list__empty">No deliveries in this period.</p>
        )}
      </div>
    </ModuleFrame>
  )
}
