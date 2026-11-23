import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { fetchStatCards, fetchSalesTrend } from '../dashboard/api/dashboardApi'
import type { SalesTrendPoint, StatCardData } from '../dashboard/types/dashboard.types'
import { fetchOrderStatus, type OrderStatusData } from '../dashboard/api/orderStatusApi'
import { downloadDashboardExportReport } from '../dashboard/api/exportReport'
import { AllReportsGrid } from './AllReportsGrid'
import { ReportOverviewHeaderActions } from './ReportOverviewHeaderActions'
import { reportBySlug } from './reportsCatalog'
import { ReportPageHeader } from './ReportPageHeader'
import './ReportsPage.css'

const REPORT = reportBySlug('overview')!

function formatChange(pct: number) {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}%`
}

function KpiCard({
  label,
  value,
  changePercent,
  tone,
}: {
  label: string
  value: string
  changePercent?: number | null
  tone?: 'default' | 'warn'
}) {
  const change = changePercent ?? null
  const changeClass =
    change === null
      ? 'reports-kpi__change reports-kpi__change--muted'
      : change >= 0
        ? 'reports-kpi__change reports-kpi__change--up'
        : 'reports-kpi__change reports-kpi__change--down'

  return (
    <article className={`reports-kpi${tone === 'warn' ? ' reports-kpi--warn' : ''}`}>
      <p className="reports-kpi__label">{label}</p>
      <p className="reports-kpi__value">{value}</p>
      {change !== null && (
        <p className={changeClass}>{formatChange(change)} vs prior period</p>
      )}
    </article>
  )
}

function OverviewSalesChart({ points, currencySymbol }: { points: SalesTrendPoint[]; currencySymbol: string }) {
  if (points.length === 0) {
    return <p className="reports-panel__empty">No sales trend for this period.</p>
  }
  const max = Math.max(...points.map((p) => p.netSales), 0.01)
  const height = 120
  const barW = 32
  const gap = 8
  const width = points.length * (barW + gap)

  return (
    <svg className="reports-sales-chart" width="100%" viewBox={`0 0 ${width} ${height + 24}`} role="img">
      {points.map((p, i) => {
        const barH = (p.netSales / max) * height
        const x = i * (barW + gap)
        const y = height - barH
        return (
          <g key={p.date}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#6366f1" opacity={0.9} />
            <text x={x + barW / 2} y={height + 14} textAnchor="middle" fontSize="9" fill="#64748b">
              {p.date.slice(5)}
            </text>
            <title>
              {p.date}: {currencySymbol}
              {p.netSalesAmount.toLocaleString('en-IN')}
            </title>
          </g>
        )
      })}
    </svg>
  )
}

function OverviewOrderDonut({ data }: { data: OrderStatusData | null }) {
  const segments = data?.statuses.filter((s) => s.count > 0) ?? []
  const total = data?.total_orders ?? 0
  const size = 120
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  if (total === 0) {
    return <p className="reports-panel__empty">Sync orders on the dashboard to populate status distribution.</p>
  }

  return (
    <div className="reports-donut-wrap">
      <div className="reports-donut-wrap__chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segments.map((seg) => {
          const dash = (seg.percentage / 100) * c
          const el = (
            <circle
              key={seg.status}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
          offset += dash
          return el
        })}
      </svg>
      <div className="reports-donut-wrap__center">
        <strong>{total.toLocaleString('en-IN')}</strong>
        <span>Orders</span>
      </div>
      </div>
      <ul className="reports-donut-legend">
        {segments.map((seg) => (
          <li key={seg.status}>
            <span className="reports-donut-legend__dot" style={{ background: seg.color }} />
            {seg.label} <strong>{seg.percentage}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ReportsOverviewPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [stats, setStats] = useState<StatCardData[]>([])
  const [orderStatus, setOrderStatus] = useState<OrderStatusData | null>(null)
  const [salesPoints, setSalesPoints] = useState<SalesTrendPoint[]>([])
  const [currencySymbol, setCurrencySymbol] = useState('₹')
  const [loading, setLoading] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setError('Select a seller account to load overview metrics.')
      setStats([])
      setOrderStatus(null)
      setSalesPoints([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [cards, trend, status] = await Promise.all([
        fetchStatCards(token, filters),
        fetchSalesTrend(token, filters),
        fetchOrderStatus(token, filters),
      ])
      setStats(cards)
      setSalesPoints(trend.points ?? [])
      setCurrencySymbol(trend.currencySymbol ?? '₹')
      setOrderStatus(status.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load overview')
      setStats([])
      setOrderStatus(null)
      setSalesPoints([])
    } finally {
      setLoading(false)
    }
  }, [token, filters, needsSeller])

  useEffect(() => {
    void load()
  }, [load])

  const stat = (id: string) => stats.find((c) => c.id === id)

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

  const gmv = stat('gmv')
  const ordersCard = stat('net-sales')

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

      {error && (
        <p className="reports-page__error" role="alert">
          {error}
        </p>
      )}

      <div className="reports-kpi-row" aria-busy={loading}>
        <KpiCard
          label="Total Sales"
          value={gmv?.value ?? '—'}
          changePercent={gmv?.changePercent}
        />
        <KpiCard
          label="Total Orders"
          value={ordersCard?.value ?? orderCounts.total.toLocaleString('en-IN')}
          changePercent={ordersCard?.changePercent}
        />
        <KpiCard label="Delivered Orders" value={orderCounts.delivered.toLocaleString('en-IN')} />
        <KpiCard label="Pending Orders" value={orderCounts.pending.toLocaleString('en-IN')} tone="warn" />
        <KpiCard label="Cancelled Orders" value={orderCounts.cancelled.toLocaleString('en-IN')} />
        <KpiCard label="Returned Orders" value="—" />
      </div>

      <div className="reports-panels">
        <section className="reports-panel">
          <h2 className="reports-panel__title">Sales trend</h2>
          <OverviewSalesChart points={salesPoints} currencySymbol={currencySymbol} />
        </section>
        <section className="reports-panel">
          <h2 className="reports-panel__title">Order status distribution</h2>
          <OverviewOrderDonut data={orderStatus} />
        </section>
      </div>

      <AllReportsGrid />
    </div>
  )
}