import { useEffect } from 'react'
import { AppShell } from '../../layout/AppShell'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { DashboardToolbar } from './layout/DashboardToolbar'
import { AlertsModule } from './modules/alerts/AlertsModule'
import { ProfitabilityModule } from './modules/charts/ProfitabilityModule'
import { SalesTrendModule } from './modules/charts/SalesTrendModule'
import { StatCardsModule } from './modules/stat-cards/StatCardsModule'
import { MarketplaceTableModule } from './modules/tables/MarketplaceTableModule'
import { loadDashboard } from './state/dashboardSlice'
import './dashboard.css'

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const dashboard = useAppSelector((s) => s.dashboard)

  useEffect(() => {
    void dispatch(loadDashboard())
  }, [dispatch, dashboard.filters])

  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <div className="dash-content">
        <StatCardsModule module={dashboard.stats} />
        <div className="dash-charts-row">
          <SalesTrendModule module={dashboard.salesTrend} />
          <ProfitabilityModule module={dashboard.profitability} />
        </div>
        <AlertsModule module={dashboard.alerts} />
        <MarketplaceTableModule module={dashboard.marketplaces} />
      </div>
    </AppShell>
  )
}
