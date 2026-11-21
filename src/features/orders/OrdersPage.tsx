import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { DashboardToolbar } from '../dashboard/layout/DashboardToolbar'
import { fetchFbaInventory, type FbaInventoryResponse } from '../inventory/fbaInventoryApi'
import {
  fetchOrders,
  type OrderFulfillmentType,
  type OrderRow,
  type OrdersFulfillmentSummary,
} from './ordersApi'
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
  const sym = row.order_total.currency_code === 'INR' ? '₹' : `${row.order_total.currency_code} `
  return `${sym}${row.order_total.amount}`
}

type OrderTabId =
  | 'all'
  | 'pending'
  | 'pendingavailability'
  | 'unshipped'
  | 'partiallyshipped'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'unfulfillable'
  | 'invoiceunconfirmed'
  | 'other'

type FulfillmentFilter = 'all' | OrderFulfillmentType

type PageView = 'orders' | 'fba_inventory'

const ORDER_TABS: { id: OrderTabId; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'unshipped', label: 'Unshipped' },
  { id: 'partiallyshipped', label: 'Partially shipped' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'canceled', label: 'Canceled' },
  { id: 'unfulfillable', label: 'Unfulfillable' },
  { id: 'invoiceunconfirmed', label: 'Invoice unconfirmed' },
  { id: 'pendingavailability', label: 'Pending availability' },
]

const FULFILLMENT_TABS: { id: FulfillmentFilter; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'FBA', label: 'FBA' },
  { id: 'FBM', label: 'FBM' },
  { id: 'SELF_SHIP', label: 'Self Ship' },
]

function orderTabId(row: OrderRow): OrderTabId {
  const easyShip = (row.easy_ship_status ?? '').replace(/[\s_-]/g, '').toLowerCase()
  if (easyShip === 'delivered') {
    return 'delivered'
  }
  const status = (row.order_status ?? '').replace(/[\s_-]/g, '').toLowerCase()
  if (status === 'cancelled' || status === 'canceled') {
    return 'canceled'
  }
  const known: OrderTabId[] = [
    'pending',
    'pendingavailability',
    'unshipped',
    'partiallyshipped',
    'shipped',
    'unfulfillable',
    'invoiceunconfirmed',
  ]
  if (known.includes(status as OrderTabId)) {
    return status as OrderTabId
  }
  return 'other'
}

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

const ORDERS_SKELETON_ROWS = 8
const SKELETON_WIDTHS = ['72%', '80%', '50%', '42%', '48%', '55%', '38%', '40%', '52%']

function OrdersTableSkeletonBody() {
  return (
    <>
      {Array.from({ length: ORDERS_SKELETON_ROWS }, (_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className="orders-table__row--skeleton" aria-hidden="true">
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
      const data = await fetchOrders(token, filters)
      setRows(data.orders)
      setSummary(data.summary ?? EMPTY_SUMMARY)
    } catch (e) {
      setRows([])
      setSummary(EMPTY_SUMMARY)
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

  const rowsForFulfillment = useMemo(() => {
    if (fulfillmentTab === 'all') {
      return rows
    }
    return rows.filter((row) => row.fulfillment_type === fulfillmentTab)
  }, [rows, fulfillmentTab])

  const counts = useMemo(() => {
    const tally: Record<OrderTabId, number> = {
      all: rowsForFulfillment.length,
      pending: 0,
      pendingavailability: 0,
      unshipped: 0,
      partiallyshipped: 0,
      shipped: 0,
      delivered: 0,
      canceled: 0,
      unfulfillable: 0,
      invoiceunconfirmed: 0,
      other: 0,
    }
    for (const row of rowsForFulfillment) {
      tally[orderTabId(row)] += 1
    }
    return tally
  }, [rowsForFulfillment])

  const visibleRows = useMemo(
    () => (tab === 'all' ? rowsForFulfillment : rowsForFulfillment.filter((row) => orderTabId(row) === tab)),
    [rowsForFulfillment, tab],
  )

  const statusTabs = ORDER_TABS.filter((item) => item.id !== 'other' || counts.other > 0)

  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <div className="orders-page">
        <header className="orders-page__head">
          <h1>Orders</h1>
          <p className="orders-page__meta">
            Amazon SP-API for the selected period
            {filters.dateFrom && filters.dateTo ? ` · ${filters.dateFrom} – ${filters.dateTo}` : ''}
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
            Orders
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pageView === 'fba_inventory'}
            className={`orders-page__view-btn${pageView === 'fba_inventory' ? ' orders-page__view-btn--active' : ''}`}
            onClick={() => setPageView('fba_inventory')}
          >
            FBA inventory
          </button>
        </div>

        {pageView === 'orders' && (
          <>
            {error && (
              <p className="orders-page__error" role="alert">
                {error}
              </p>
            )}

            <div className="orders-fulfillment-tabs" role="tablist" aria-label="Fulfillment type">
              {FULFILLMENT_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={fulfillmentTab === item.id}
                  className={`orders-tabs__btn${fulfillmentTab === item.id ? ' orders-tabs__btn--active' : ''}`}
                  onClick={() => {
                    setFulfillmentTab(item.id)
                    setTab('all')
                  }}
                >
                  {item.label}
                  <span className="orders-tabs__count">
                    {fulfillmentCount(summary, item.id, rows)}
                  </span>
                </button>
              ))}
            </div>

            <div className="orders-tabs" role="tablist" aria-label="Order status">
              {statusTabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`orders-tabs__btn orders-tabs__btn--compact${
                    tab === item.id ? ' orders-tabs__btn--active' : ''
                  }`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  <span className="orders-tabs__count">{counts[item.id]}</span>
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
              <div className="orders-table-wrap" aria-busy={loading}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Purchase date</th>
                      <th>Status</th>
                      <th>Fulfillment</th>
                      <th>Channel</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Ship to</th>
                      <th>Prime</th>
                      {fulfillmentTab === 'SELF_SHIP' && <th>Easy Ship</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <OrdersTableSkeletonBody />
                    ) : (
                      visibleRows.map((row) => (
                        <tr key={row.amazon_order_id}>
                          <td className="orders-table__id">{row.amazon_order_id}</td>
                          <td>{formatPurchaseDate(row.purchase_date)}</td>
                          <td>
                            <span
                              className={`orders-badge orders-badge--${(row.order_status ?? '').toLowerCase()}`}
                            >
                              {row.order_status ?? '—'}
                            </span>
                          </td>
                          <td>
                            <span className={fulfillmentBadgeClass(row.fulfillment_type)}>
                              {row.fulfillment_label}
                            </span>
                          </td>
                          <td>{row.fulfillment_channel ?? '—'}</td>
                          <td>
                            {row.number_of_items_shipped} shipped
                            {row.number_of_items_unshipped > 0
                              ? ` · ${row.number_of_items_unshipped} open`
                              : ''}
                          </td>
                          <td>{formatTotal(row)}</td>
                          <td>{row.payment_method ?? '—'}</td>
                          <td>{[row.ship_city, row.ship_state].filter(Boolean).join(', ') || '—'}</td>
                          <td>{row.is_prime ? 'Yes' : 'No'}</td>
                          {fulfillmentTab === 'SELF_SHIP' && (
                            <td>{row.easy_ship_status ?? '—'}</td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {loading && <span className="orders-page__sr-only">Loading orders…</span>}
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