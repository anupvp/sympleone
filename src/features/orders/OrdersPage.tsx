import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '../../layout/AppShell'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { DashboardToolbar } from '../dashboard/layout/DashboardToolbar'
import { fetchOrders, type OrderRow } from './ordersApi'
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

const ORDER_TABS: { id: OrderTabId; label: string }[] = [
  { id: 'all', label: 'All' },
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

const ORDERS_SKELETON_ROWS = 8

/** Relative bar widths per column for skeleton placeholders */
const SKELETON_WIDTHS = ['72%', '85%', '55%', '48%', '62%', '70%', '40%', '58%', '50%']

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

export function OrdersPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [rows, setRows] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<OrderTabId>('all')

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setRows([])
      setError('Select a seller account to load orders.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrders(token, filters)
      setRows(data.orders)
    } catch (e) {
      setRows([])
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [token, filters.marketplaceId, filters.dateFrom, filters.dateTo, filters.sellerId, needsSeller])

  useEffect(() => {
    void load()
  }, [load])

  const counts = useMemo(() => {
    const tally: Record<OrderTabId, number> = {
      all: rows.length,
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
    for (const row of rows) {
      tally[orderTabId(row)] += 1
    }
    return tally
  }, [rows])

  const visibleRows = useMemo(
    () => (tab === 'all' ? rows : rows.filter((row) => orderTabId(row) === tab)),
    [rows, tab],
  )

  const tabs = ORDER_TABS.filter((item) => item.id !== 'other' || counts.other > 0)

  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <div className="orders-page">
        <header className="orders-page__head">
          <h1>Orders</h1>
          <p className="orders-page__meta">
            Amazon SP-API orders for the selected period
            {filters.dateFrom && filters.dateTo ? ` · ${filters.dateFrom} – ${filters.dateTo}` : ''}
          </p>
        </header>

        {error && <p className="orders-page__error" role="alert">{error}</p>}

        <div className="orders-tabs" role="tablist" aria-label="Order status">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`orders-tabs__btn${tab === item.id ? ' orders-tabs__btn--active' : ''}`}
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
          <p className="orders-page__empty">No orders in this status for the selected period.</p>
        )}

        {(loading || visibleRows.length > 0) && (
          <div className="orders-table-wrap" aria-busy={loading}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Amazon order ID</th>
                  <th>Purchase date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Ship to</th>
                  <th>Prime</th>
                  <th>Fulfillment</th>
                  <th>Easy Ship</th>
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
                        <span className={`orders-badge orders-badge--${(row.order_status ?? '').toLowerCase()}`}>
                          {row.order_status ?? '—'}
                        </span>
                      </td>
                      <td>{formatTotal(row)}</td>
                      <td>{row.payment_method ?? '—'}</td>
                      <td>
                        {[row.ship_city, row.ship_state].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td>{row.is_prime ? 'Yes' : 'No'}</td>
                      <td>{row.fulfillment_channel ?? '—'}</td>
                      <td>{row.easy_ship_status ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {loading && <span className="orders-page__sr-only">Loading orders…</span>}
          </div>
        )}
      </div>
    </AppShell>
  )
}
