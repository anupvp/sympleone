import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { DashboardPageHeader } from './layout/DashboardPageHeader'
import { DashboardToolbar } from './layout/DashboardToolbar'
import { AccountHealthModule } from './modules/charts/AccountHealthModule'
import { SalesTrendModule } from './modules/charts/SalesTrendModule'
import { AlertsModule } from './modules/alerts/AlertsModule'
import { StatCardsModule } from './modules/stat-cards/StatCardsModule'
import { OrderStatusModule } from './modules/widgets/OrderStatusModule'
import { ProductPerformanceModule } from './modules/widgets/ProductPerformanceModule'
import { QuickActionsModule } from './modules/widgets/QuickActionsModule'
import { SalesByRegionModule } from './modules/widgets/SalesByRegionModule'
import { TopCategoriesModule } from './modules/widgets/TopCategoriesModule'
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
        <DashboardPageHeader />
        <StatCardsModule module={dashboard.stats} />
        <div className="dash-row dash-row--charts">
          <SalesTrendModule module={dashboard.salesTrend} />
          <SalesByRegionModule module={dashboard.salesTrend} />
        </div>
        <div className="dash-row dash-row--triple">
          <ProductPerformanceModule />
          <AccountHealthModule module={dashboard.accountHealth} />
          <QuickActionsModule />
        </div>
        <div className="dash-row dash-row--triple" id="alerts">
          <AlertsModule module={dashboard.alerts} />
          <OrderStatusModule />
          <TopCategoriesModule />
        </div>
      </div>
    </AppShell>
  )
}
