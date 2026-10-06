import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { DashboardToolbar } from './layout/DashboardToolbar'
import { AccountHealthModule } from './modules/charts/AccountHealthModule'
import { AlertsModule } from './modules/alerts/AlertsModule'
import { ProfitabilityModule } from './modules/charts/ProfitabilityModule'
import { SalesTrendModule } from './modules/charts/SalesTrendModule'
import { StatCardsModule } from './modules/stat-cards/StatCardsModule'
import { AdminSellersOverviewModule } from './modules/AdminSellersOverviewModule'
import { MarketplaceTableModule } from './modules/tables/MarketplaceTableModule'
import { loadDashboard, setFilters } from './state/dashboardSlice'
import './dashboard.css'

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const dashboard = useAppSelector((s) => s.dashboard)
  const filters = dashboard.filters

  useEffect(() => {
    const sellerId = searchParams.get('sellerId')
    if (sellerId?.trim()) {
      dispatch(setFilters({ sellerId: sellerId.trim() }))
    }
  }, [searchParams, dispatch])

  useEffect(() => {
    void dispatch(loadDashboard())
  }, [
    dispatch,
    filters.marketplaceId,
    filters.dateFrom,
    filters.dateTo,
    filters.salesPeriodMode,
    filters.salesDailyDate,
    filters.salesMonth,
    filters.salesYear,
    filters.sellerId,
  ])

  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <div className="dash-content">
        <AdminSellersOverviewModule />
        <StatCardsModule module={dashboard.stats} />
        <div className="dash-charts-row">
          <SalesTrendModule module={dashboard.salesTrend} />
          <div className="dash-charts-row__pair">
            <ProfitabilityModule module={dashboard.profitability} />
            <AccountHealthModule module={dashboard.accountHealth} />
          </div>
        </div>
        <AlertsModule module={dashboard.alerts} />
        <MarketplaceTableModule module={dashboard.marketplaces} />
      </div>
    </AppShell>
  )
}
