import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { fetchMarketplaces, fetchStatCards, fetchSalesTrend } from '../dashboard/api/dashboardApi'
import type { MarketplaceRow, SalesTrendPoint, StatCardData } from '../dashboard/types/dashboard.types'
import { fetchOrderStatus, type OrderStatusData } from '../dashboard/api/orderStatusApi'
import { downloadDashboardExportReport } from '../dashboard/api/exportReport'
import { AllReportsGrid } from './AllReportsGrid'
import { buildOverviewKpis, OverviewKpiCards } from './overview/OverviewKpiCards'
import { OverviewMarketplaceWidget } from './overview/OverviewMarketplaceWidget'
import { OverviewOrderStatusWidget } from './overview/OverviewOrderStatusWidget'
import { OverviewSalesTrendWidget } from './overview/OverviewSalesTrendWidget'
import { ReportOverviewHeaderActions } from './ReportOverviewHeaderActions'
import { reportBySlug } from './reportsCatalog'
import { ReportPageHeader } from './ReportPageHeader'
import './ReportsPage.css'

const REPORT = reportBySlug('overview')!

function messageFromReason(reason: unknown): string {
  if (reason instanceof Error) {
    return reason.message
  }
  return String(reason)
}

export function ReportsOverviewPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [stats, setStats] = useState<StatCardData[]>([])
  const [orderStatus, setOrderStatus] = useState<OrderStatusData | null>(null)
  const [salesPoints, setSalesPoints] = useState<SalesTrendPoint[]>([])
  const [marketplaces, setMarketplaces] = useState<MarketplaceRow[]>([])
  const [currencySymbol, setCurrencySymbol] = useState('₹')
  const [loading, setLoading] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [loadErrors, setLoadErrors] = useState<string[]>([])
  const [exportError, setExportError] = useState<string | null>(null)
  const [sellerError, setSellerError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setSellerError('Select a seller account to load overview metrics.')
      setStats([])
      setOrderStatus(null)
      setSalesPoints([])
      setMarketplaces([])
      return
    }
    setSellerError(null)
    setLoading(true)
    setLoadErrors([])

    const [statsResult, trendResult, statusResult, marketplaceResult] = await Promise.allSettled([
      fetchStatCards(token, filters),
      fetchSalesTrend(token, filters),
      fetchOrderStatus(token, filters),
      fetchMarketplaces(token, filters),
    ])

    const errors: string[] = []

    if (statsResult.status === 'fulfilled') {
      setStats(statsResult.value)
    } else {
      setStats([])
      errors.push(`Stats: ${messageFromReason(statsResult.reason)}`)
    }

    if (trendResult.status === 'fulfilled') {
      setSalesPoints(trendResult.value.points ?? [])
      setCurrencySymbol(trendResult.value.currencySymbol ?? '₹')
    } else {
      setSalesPoints([])
      errors.push(`Sales trend: ${messageFromReason(trendResult.reason)}`)
    }

    if (statusResult.status === 'fulfilled') {
      setOrderStatus(statusResult.value.data)
    } else {
      setOrderStatus(null)
      errors.push(`Order status: ${messageFromReason(statusResult.reason)}`)
    }

    if (marketplaceResult.status === 'fulfilled') {
      setMarketplaces(marketplaceResult.value)
    } else {
      setMarketplaces([])
      errors.push(`Marketplaces: ${messageFromReason(marketplaceResult.reason)}`)
    }

    setLoadErrors(errors)
    setLoading(false)
  }, [token, filters, needsSeller])

  useEffect(() => {
    void load()
  }, [load])

  const orderCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const seg of orderStatus?.statuses ?? []) {
      map[seg.status] = seg.count
    }
    return {
      delivered: map.DELIVERED ?? 0,
      pending: (map.PROCESSING ?? 0) + (map.IN_TRANSIT ?? 0),
      cancelled: map.CANCELLED ?? 0,
      total: orderStatus?.total_orders ?? 0,
    }
  }, [orderStatus])

  const kpiMetrics = useMemo(() => buildOverviewKpis(stats, orderCounts), [stats, orderCounts])
  const gmv = stats.find((s) => s.id === 'gmv')
  const ordersCard = stats.find((s) => s.id === 'net-sales')

  const exportOverviewCsv = useCallback(() => {
    const lines = [
      'Metric,Value',
      `Total Sales,${gmv?.value ?? '—'}`,
      `Total Orders,${ordersCard?.value ?? orderCounts.total}`,
      `Delivered Orders,${orderCounts.delivered}`,
      `Pending Orders,${orderCounts.pending}`,
      `Cancelled Orders,${orderCounts.cancelled}`,
      `Period,${filters.dateFrom} – ${filters.dateTo}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `overview-report-${filters.dateFrom}-to-${filters.dateTo}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [filters.dateFrom, filters.dateTo, gmv?.value, orderCounts, ordersCard?.value])

  const exportListings = useCallback(async () => {
    setExportBusy(true)
    setExportError(null)
    try {
      await downloadDashboardExportReport(filters)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExportBusy(false)
    }
  }, [filters])

  return (
    <div className="reports-page">
      <ReportPageHeader
        report={REPORT}
        actions={
          <ReportOverviewHeaderActions
            onPrepare={() => void load()}
            prepareBusy={loading}
            prepareDisabled={needsSeller && !filters.sellerId?.trim()}
            onExportOverview={exportOverviewCsv}
            onExportListings={() => void exportListings()}
            exportBusy={exportBusy}
          />
        }
      />

      {exportError && (
        <p className="reports-page__error" role="alert">
          {exportError}
        </p>
      )}

      {sellerError && (
        <p className="reports-page__error" role="alert">
          {sellerError}
        </p>
      )}

      {loadErrors.length > 0 && (
        <div className="reports-page__warnings" role="alert">
          {loadErrors.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      <OverviewKpiCards metrics={kpiMetrics} loading={loading} />

      <div className="reports-widgets-row">
        <OverviewSalesTrendWidget points={salesPoints} currencySymbol={currencySymbol} />
        <OverviewOrderStatusWidget data={orderStatus} />
        <OverviewMarketplaceWidget
          rows={marketplaces}
          salesPoints={salesPoints}
          currencySymbol={currencySymbol}
          totalSalesLabel={gmv?.value}
        />
      </div>

      <AllReportsGrid />
    </div>
  )
}