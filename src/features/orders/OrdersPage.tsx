import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { DashboardToolbar } from '../dashboard/layout/DashboardToolbar'
import { fetchStatCards } from '../dashboard/api/dashboardApi'
import { fetchFbaInventory, type FbaInventoryResponse } from '../inventory/fbaInventoryApi'
import {
  fetchOrders,
  type OrderFulfillmentType,
  type OrderRow,
  type OrdersFulfillmentSummary,
} from './ordersApi'
import { orderStatusTabId, tallyOrderStatusTabs, type OrderStatusTabId } from './orderMetrics'
import { OrderStatusBadge } from './OrderStatusBadge'
import {
  OrdersSummaryKpis,
  ordersKpiCountsFromTally,
  type OrdersKpiId,
} from './OrdersSummaryKpis'
import { downloadOrdersCsv } from './ordersExport'
import './OrdersPage.css'

function formatPurchaseDate(iso: string | null) {
  if (!iso) {
    return '—'
  }
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function formatTotal(row: OrderRow) {
  if (!row.order_total?.amount) {
    return '—'
  }
  const amount = Number.parseFloat(row.order_total.amount)
  const sym = row.order_total.currency_code === 'INR' ? '₹' : `${row.order_total.currency_code} `
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : row.order_total.amount
  return `${sym}${formatted}`
}

function itemCount(row: OrderRow) {
  return row.number_of_items_shipped + row.number_of_items_unshipped
}

function buyerLabel(row: OrderRow) {
  if (row.ship_city?.trim()) {
    const city = row.ship_city.trim()
    const initial = city.charAt(0).toUpperCase()
    return `${initial}. (${city})`
  }
  return '—'
}

type OrderTabId = 'all' | OrderStatusTabId

type FulfillmentFilter = 'all' | OrderFulfillmentType

type PageView = 'orders' | 'fba_inventory'

const PRIMARY_STATUS_TABS: { id: OrderTabId; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'unshipped', label: 'Unshipped' },
  { id: 'partiallyshipped', label: 'Partially shipped' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'canceled', label: 'Canceled' },
  { id: 'unfulfillable', label: 'Unfulfillable' },
]

const SECONDARY_STATUS_TABS: { id: OrderTabId; label: string }[] = [
  { id: 'invoiceunconfirmed', label: 'Invoice unconfirmed' },
  { id: 'pendingavailability', label: 'Pending availability' },
]

const FULFILLMENT_TABS: { id: FulfillmentFilter; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'FBA', label: 'FBA' },
  { id: 'FBM', label: 'FBM' },
  { id: 'SELF_SHIP', label: 'Self Ship' },
]

const PAGE_SIZES = [5, 10, 25, 50] as const

const orderTabId = orderStatusTabId

function fulfillmentCount(summary: OrdersFulfillmentSummary, id: FulfillmentFilter, rows: OrderRow[]) {
  if (id === 'all') {
    return summary.total || rows.length
  }
  if (id === 'FBA') {
    return summary.fba
  }
  if (id === 'SELF_SHIP') {
    return summary.self_ship
  }
  return summary.fbm
}

function kpiIdToTab(id: OrdersKpiId): OrderTabId {
  return id === 'canceled' ? 'canceled' : id
}

function tabToKpiId(tab: OrderTabId): OrdersKpiId | null {
  if (tab === 'all') {
    return 'all'
  }
  if (
    tab === 'pending' ||
    tab === 'unshipped' ||
    tab === 'shipped' ||
    tab === 'delivered' ||
    tab === 'canceled'
  ) {
    return tab === 'canceled' ? 'canceled' : tab
  }
  return null
}

const ORDERS_SKELETON_ROWS = 5
const SKELETON_WIDTHS = ['72%', '80%', '50%', '42%', '48%', '40%', '52%', '28%']

function OrdersTableSkeletonBody() {
  return (
    <>
      {Array.from({ length: ORDERS_SKELETON_ROWS }, (_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className="orders-table__row--skeleton" aria-hidden="true">
          <td>
            <span className="orders-table__skeleton" style={{ width: '1rem' }} />
          </td>
          {SKELETON_WIDTHS.map((width, colIndex) => (
            <td key={colIndex}>
              <span className="orders-table__skeleton" style={{ width }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function fulfillmentBadgeClass(type: OrderFulfillmentType): string {
  if (type === 'FBA') {
    return 'orders-type-badge orders-type-badge--fba'
  }
  if (type === 'SELF_SHIP') {
    return 'orders-type-badge orders-type-badge--self-ship'
  }
  return 'orders-type-badge orders-type-badge--fbm'
}

const EMPTY_SUMMARY: OrdersFulfillmentSummary = {
  total: 0,
  fba: 0,
  fbm: 0,
  self_ship: 0,
}

export function OrdersPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [rows, setRows] = useState<OrderRow[]>([])
  const [summary, setSummary] = useState<OrdersFulfillmentSummary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<OrderTabId>('all')
  const [fulfillmentTab, setFulfillmentTab] = useState<FulfillmentFilter>('all')
  const [pageView, setPageView] = useState<PageView>('orders')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(25)
  const [ordersChangePercent, setOrdersChangePercent] = useState<number | null>(null)

  const [inventory, setInventory] = useState<FbaInventoryResponse | null>(null)
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [inventoryError, setInventoryError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setRows([])
      setSummary(EMPTY_SUMMARY)
      setError('Select a seller account to load orders.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [data, stats] = await Promise.all([
        fetchOrders(token, filters),
        fetchStatCards(token, filters).catch(() => []),
      ])
      setRows(data.orders)
      setSummary(data.summary ?? EMPTY_SUMMARY)
      const ordersCard = stats.find((s) => s.id === 'net-sales')
      setOrdersChangePercent(ordersCard?.changePercent ?? null)
    } catch (e) {
      setRows([])
      setSummary(EMPTY_SUMMARY)
      setOrdersChangePercent(null)
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [token, filters.marketplaceId, filters.dateFrom, filters.dateTo, filters.sellerId, needsSeller])

  const loadInventory = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setInventory(null)
      setInventoryError('Select a seller account to load FBA inventory.')
      return
    }
    setInventoryLoading(true)
    setInventoryError(null)
    try {
      const data = await fetchFbaInventory(token, filters)
      setInventory(data)
    } catch (e) {
      setInventory(null)
      setInventoryError(e instanceof Error ? e.message : 'Failed to load FBA inventory')
    } finally {
      setInventoryLoading(false)
    }
  }, [token, filters.marketplaceId, filters.sellerId, needsSeller])

  useEffect(() => {
    if (pageView === 'orders') {
      void load()
    }
  }, [load, pageView])

  useEffect(() => {
    if (pageView === 'fba_inventory') {
      void loadInventory()
    }
  }, [loadInventory, pageView])

  useEffect(() => {
    setPage(1)
  }, [tab, fulfillmentTab, filters.dateFrom, filters.dateTo, filters.sellerId, filters.marketplaceId])

  const rowsForFulfillment = useMemo(() => {
    if (fulfillmentTab === 'all') {
      return rows
    }
    return rows.filter((row) => row.fulfillment_type === fulfillmentTab)
  }, [rows, fulfillmentTab])

  const statusTally = useMemo(() => tallyOrderStatusTabs(rowsForFulfillment), [rowsForFulfillment])

  const counts = useMemo(() => {
    const tally: Record<OrderTabId, number> = {
      all: rowsForFulfillment.length,
      ...statusTally,
    }
    return tally
  }, [rowsForFulfillment.length, statusTally])

  const kpiCounts = useMemo(
    () =>
      ordersKpiCountsFromTally(rowsForFulfillment.length, {
        pending: statusTally.pending,
        unshipped: statusTally.unshipped,
        shipped: statusTally.shipped,
        delivered: statusTally.delivered,
        canceled: statusTally.canceled,
      }),
    [rowsForFulfillment.length, statusTally],
  )

  const visibleRows = useMemo(
    () => (tab === 'all' ? rowsForFulfillment : rowsForFulfillment.filter((row) => orderTabId(row) === tab)),
    [rowsForFulfillment, tab],
  )

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const pagedRows = visibleRows.slice(pageStart, pageStart + pageSize)

  const activeKpiId = tabToKpiId(tab)

  const periodLabel =
    filters.dateFrom && filters.dateTo
      ? `${new Date(filters.dateFrom).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} – ${new Date(filters.dateTo).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}`
      : ''

  const exportFilename = `orders-${filters.dateFrom ?? 'export'}-to-${filters.dateTo ?? 'export'}.csv`

  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <div className="orders-page">
        <header className="orders-page__head">
          <h1>Orders</h1>
          <p className="orders-page__meta">
            Amazon SP-API for the selected period
            {periodLabel ? ` · ${periodLabel}` : ''}
          </p>
        </header>

        <div className="orders-page__views" role="tablist" aria-label="Orders page section">
          <button
            type="button"
            role="tab"
            aria-selected={pageView === 'orders'}
            className={`orders-page__view-btn${pageView === 'orders' ? ' orders-page__view-btn--active' : ''}`}
            onClick={() => setPageView('orders')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M4 6h2l2 10h9l2-8H8" />
            </svg>
            Orders
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pageView === 'fba_inventory'}
            className={`orders-page__view-btn${pageView === 'fba_inventory' ? ' orders-page__view-btn--active' : ''}`}
            onClick={() => setPageView('fba_inventory')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M4 7h16v10H4zM8 7V5h8v2" />
            </svg>
            FBA Inventory
          </button>
        </div>

        {pageView === 'orders' && (
          <>
            {error && (
              <p className="orders-page__error" role="alert">
                {error}
              </p>
            )}

            <OrdersSummaryKpis
              counts={kpiCounts}
              loading={loading}
              activeId={activeKpiId}
              allOrdersChangePercent={ordersChangePercent}
              onSelect={(id) => {
                setTab(kpiIdToTab(id))
              }}
            />

            <div className="orders-fulfillment-tabs" role="tablist" aria-label="Fulfillment type">
              {FULFILLMENT_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={fulfillmentTab === item.id}
                  className={`orders-pill${fulfillmentTab === item.id ? ' orders-pill--active' : ''}`}
                  onClick={() => {
                    setFulfillmentTab(item.id)
                    setTab('all')
                  }}
                >
                  {item.label}
                  <span className="orders-pill__count">{fulfillmentCount(summary, item.id, rows)}</span>
                </button>
              ))}
            </div>

            <div className="orders-tabs" role="tablist" aria-label="Order status">
              {PRIMARY_STATUS_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`orders-pill orders-pill--compact${tab === item.id ? ' orders-pill--active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  <span className="orders-pill__count">{counts[item.id]}</span>
                </button>
              ))}
            </div>

            <div className="orders-tabs orders-tabs--secondary" role="tablist" aria-label="Additional statuses">
              {SECONDARY_STATUS_TABS.filter((item) => counts[item.id] > 0 || tab === item.id).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`orders-pill orders-pill--compact${tab === item.id ? ' orders-pill--active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  <span className="orders-pill__count">{counts[item.id]}</span>
                </button>
              ))}
            </div>

            {!loading && !error && rows.length === 0 && (
              <p className="orders-page__empty">No orders found for this period.</p>
            )}

            {!loading && !error && rows.length > 0 && visibleRows.length === 0 && (
              <p className="orders-page__empty">No orders match these filters.</p>
            )}

            {(loading || visibleRows.length > 0) && (
              <div className="orders-table-panel">
                <div className="orders-table-panel__head">
                  <h2 className="orders-table-panel__title">
                    Orders ({loading ? '…' : visibleRows.length.toLocaleString('en-IN')})
                  </h2>
                  <div className="orders-table-panel__actions">
                    <button
                      type="button"
                      className="orders-toolbar-btn"
                      disabled={loading || visibleRows.length === 0}
                      onClick={() => downloadOrdersCsv(visibleRows, exportFilename)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="orders-toolbar-btn"
                      disabled={loading || visibleRows.length === 0}
                      onClick={() => downloadOrdersCsv(visibleRows, exportFilename)}
                    >
                      Export
                    </button>
                    <button
                      type="button"
                      className="orders-toolbar-btn orders-toolbar-btn--primary"
                      disabled={loading}
                      onClick={() => void load()}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="orders-table-wrap" aria-busy={loading}>
                  <table className="orders-table orders-table--ui">
                    <thead>
                      <tr>
                        <th className="orders-table__check-col" aria-label="Select" />
                        <th>Order ID</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th>Fulfillment</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Buyer</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <OrdersTableSkeletonBody />
                      ) : (
                        pagedRows.map((row) => (
                          <tr key={row.amazon_order_id}>
                            <td>
                              <input type="checkbox" className="orders-table__check" aria-label={`Select ${row.amazon_order_id}`} />
                            </td>
                            <td>
                              <span className="orders-table__id">
                                <span aria-hidden>#</span> {row.amazon_order_id}
                              </span>
                            </td>
                            <td>{formatPurchaseDate(row.purchase_date)}</td>
                            <td>
                              <OrderStatusBadge row={row} />
                            </td>
                            <td>
                              <span className={fulfillmentBadgeClass(row.fulfillment_type)}>
                                {row.fulfillment_type === 'SELF_SHIP' ? 'Self Ship' : row.fulfillment_type}
                              </span>
                            </td>
                            <td>{itemCount(row)}</td>
                            <td className="orders-table__amount">{formatTotal(row)}</td>
                            <td>{buyerLabel(row)}</td>
                            <td className="orders-table__actions">
                              <button type="button" className="orders-row-action" title="View order" aria-label="View order">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                                  <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
                                  <circle cx="12" cy="12" r="2.5" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {loading && <span className="orders-page__sr-only">Loading orders…</span>}
                </div>

                {!loading && visibleRows.length > 0 && (
                  <footer className="orders-pagination">
                    <p className="orders-pagination__summary">
                      Showing {pageStart + 1} – {Math.min(pageStart + pageSize, visibleRows.length)} of{' '}
                      {visibleRows.length.toLocaleString('en-IN')} orders
                    </p>
                    <div className="orders-pagination__controls">
                      <button
                        type="button"
                        className="orders-pagination__btn"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-label="Previous page"
                      >
                        ‹
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            className={`orders-pagination__btn${pageNum === safePage ? ' orders-pagination__btn--active' : ''}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      {totalPages > 5 && <span className="orders-pagination__ellipsis">…</span>}
                      <button
                        type="button"
                        className="orders-pagination__btn"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Next page"
                      >
                        ›
                      </button>
                    </div>
                    <label className="orders-pagination__size">
                      Rows per page
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])
                          setPage(1)
                        }}
                      >
                        {PAGE_SIZES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </footer>
                )}
              </div>
            )}
          </>
        )}

        {pageView === 'fba_inventory' && (
          <div className="orders-inventory-panel">
            {inventoryError && (
              <p className="orders-page__error" role="alert">
                {inventoryError}
              </p>
            )}

            {inventoryLoading && <p className="orders-page__meta">Loading FBA inventory…</p>}

            {!inventoryLoading && inventory && (
              <>
                <ul className="orders-inventory-metrics">
                  <li>
                    <span className="orders-inventory-metrics__label">Fulfillable</span>
                    <strong>{inventory.metrics.fulfillable.toLocaleString('en-IN')}</strong>
                  </li>
                  <li>
                    <span className="orders-inventory-metrics__label">Reserved</span>
                    <strong>{inventory.metrics.reserved.toLocaleString('en-IN')}</strong>
                  </li>
                  <li>
                    <span className="orders-inventory-metrics__label">Inbound</span>
                    <strong>{inventory.metrics.inbound.toLocaleString('en-IN')}</strong>
                  </li>
                  <li>
                    <span className="orders-inventory-metrics__label">Unfulfillable</span>
                    <strong>{inventory.metrics.unfulfillable.toLocaleString('en-IN')}</strong>
                  </li>
                  <li>
                    <span className="orders-inventory-metrics__label">SKU lines</span>
                    <strong>{inventory.items.length.toLocaleString('en-IN')}</strong>
                  </li>
                </ul>

                <div className="orders-inventory-panel__actions">
                  <Link to="/app/fba-inventory" className="orders-inventory-panel__link">
                    Open full FBA Inventory →
                  </Link>
                </div>

                {inventory.isEmpty ? (
                  <p className="orders-page__empty">No FBA inventory records from Amazon for this seller.</p>
                ) : (
                  <div className="orders-table-wrap">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product</th>
                          <th>Fulfillable</th>
                          <th>Reserved</th>
                          <th>Inbound</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.items.slice(0, 25).map((item) => (
                          <tr key={`${item.sellerSku ?? ''}-${item.fnSku ?? ''}-${item.asin ?? ''}`}>
                            <td className="orders-table__id">{item.sellerSku ?? '—'}</td>
                            <td className="orders-table__product-name" title={item.productName ?? undefined}>
                              {item.productName ?? '—'}
                            </td>
                            <td>{item.fulfillable}</td>
                            <td>{item.reserved}</td>
                            <td>{item.inbound}</td>
                            <td>{item.totalQuantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {inventory.items.length > 25 && (
                      <p className="orders-page__meta orders-inventory-panel__more">
                        Showing 25 of {inventory.items.length} SKU lines.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}