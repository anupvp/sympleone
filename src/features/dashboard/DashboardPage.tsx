import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
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
import { downloadDashboardExportReport } from './api/exportReport'
import { loadDashboard, setFilters } from './state/dashboardSlice'
import './dashboard.css'

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const dashboard = useAppSelector((s) => s.dashboard)
  const user = useAppSelector((s) => s.auth.user)
  const filters = dashboard.filters
  const [sellerContextLoaded, setSellerContextLoaded] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const needsSeller = needsSellerDashboardContext(user)
  const noSellerContext = needsSeller && !filters.sellerId?.trim()
  const handleSellerContextLoaded = useCallback(() => {
    setSellerContextLoaded(true)
  }, [])

  useEffect(() => {
    const sellerId = searchParams.get('sellerId')
    if (sellerId?.trim()) {
      dispatch(setFilters({ sellerId: sellerId.trim() }))
    }
  }, [searchParams, dispatch])

  useEffect(() => {
    if (needsSeller && !filters.sellerId && !sellerContextLoaded) {
      return
    }
    void dispatch(loadDashboard())
  }, [
    dispatch,
    needsSeller,
    sellerContextLoaded,
    filters.sellerId,
    filters.marketplaceId,
    filters.dateFrom,
    filters.dateTo,
    filters.salesPeriodMode,
    filters.salesDailyDate,
    filters.salesMonth,
    filters.salesYear,
  ])

  const handleExportReport = useCallback(async () => {
    if (noSellerContext) {
      setExportError('Select a seller account to export a report.')
      return
    }
    setExportError(null)
    setExportLoading(true)
    try {
      await downloadDashboardExportReport(filters)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not download report'
      setExportError(message)
    } finally {
      setExportLoading(false)
    }
  }, [filters, noSellerContext])

  return (
    <AppShell toolbar={<DashboardToolbar onSellerContextLoaded={handleSellerContextLoaded} />}>
      <div className="dash-content">
        <DashboardPageHeader
          onExportReport={handleExportReport}
          exportLoading={exportLoading}
          exportDisabled={noSellerContext}
          exportError={exportError}
        />
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
