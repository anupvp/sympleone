import { useCallback, useEffect, useState } from 'react'
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

export function OrdersPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [rows, setRows] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        {loading && <p className="orders-page__loading" aria-busy="true">Loading orders…</p>}

        {!loading && !error && rows.length === 0 && (
          <p className="orders-page__empty">No orders found for this period.</p>
        )}

        {rows.length > 0 && (
          <div className="orders-table-wrap">
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
                {rows.map((row) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
