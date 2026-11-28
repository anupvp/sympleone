import { useEffect } from 'react'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { OrderDetail, OrderRow } from './ordersApi'
import './OrderDetailModal.css'

function formatMoney(money: { currency_code: string; amount: string } | null | undefined) {
  if (!money?.amount) {
    return '—'
  }
  const amount = Number.parseFloat(money.amount)
  const sym = money.currency_code === 'INR' ? '₹' : `${money.currency_code} `
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : money.amount
  return `${sym}${formatted}`
}

function formatDate(iso: string | null | undefined) {
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="order-detail-dl__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

export function OrderDetailModal({
  open,
  preview,
  detail,
  loading,
  error,
  onClose,
}: {
  open: boolean
  preview: OrderRow | null
  detail: OrderDetail | null
  loading: boolean
  error: string | null
  onClose: () => void
}) {
  const row = detail ?? preview

  useEffect(() => {
    if (!open) {
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || !row) {
    return null
  }

  const shipLines = [
    detail?.ship_address_line1,
    detail?.ship_address_line2,
    [detail?.ship_city, detail?.ship_state].filter(Boolean).join(', '),
    detail?.ship_postal_code,
    detail?.ship_country,
  ].filter((part) => part && String(part).trim())

  const shipBlock = shipLines.length > 0 ? shipLines.join('\n') : [row.ship_city, row.ship_state].filter(Boolean).join(', ') || '—'

  return (
    <div className="order-detail-modal" role="presentation">
      <button type="button" className="order-detail-modal__backdrop" aria-label="Close order details" onClick={onClose} />
      <section
        className="order-detail-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        <header className="order-detail-modal__head">
          <div>
            <p className="order-detail-modal__eyebrow">Order details</p>
            <h2 id="order-detail-title" className="order-detail-modal__title">
              #{row.amazon_order_id}
            </h2>
          </div>
          <button type="button" className="order-detail-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {error && (
          <p className="order-detail-modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="order-detail-modal__body" aria-busy={loading}>
          <div className="order-detail-modal__summary">
            <OrderStatusBadge row={row} />
            <span className="order-detail-modal__fulfillment">{row.fulfillment_label}</span>
            {row.is_prime && <span className="order-detail-modal__prime">Prime</span>}
          </div>

          <dl className="order-detail-dl">
            <DetailRow label="Purchase date" value={formatDate(detail?.purchase_date ?? row.purchase_date)} />
            <DetailRow label="Last update" value={formatDate(detail?.last_update_date)} />
            <DetailRow label="Order total" value={formatMoney(detail?.order_total ?? row.order_total)} />
            <DetailRow label="Payment" value={detail?.payment_method ?? row.payment_method ?? '—'} />
            <DetailRow label="Sales channel" value={detail?.sales_channel ?? row.sales_channel ?? '—'} />
            <DetailRow label="Fulfillment channel" value={detail?.fulfillment_channel ?? row.fulfillment_channel ?? '—'} />
            <DetailRow label="Service level" value={detail?.shipment_service_level ?? row.shipment_service_level ?? '—'} />
            <DetailRow label="Easy Ship" value={detail?.easy_ship_status ?? row.easy_ship_status ?? '—'} />
            <DetailRow
              label="Items shipped / unshipped"
              value={`${detail?.number_of_items_shipped ?? row.number_of_items_shipped} / ${detail?.number_of_items_unshipped ?? row.number_of_items_unshipped}`}
            />
            <DetailRow label="Buyer" value={detail?.buyer_name ?? '—'} />
            <DetailRow label="Ship to" value={shipBlock} />
          </dl>

          <h3 className="order-detail-modal__subhead">Line items</h3>
          {loading && !detail?.items?.length ? (
            <p className="order-detail-modal__meta">Loading items from Amazon…</p>
          ) : null}

          {!loading && detail && detail.items.length === 0 ? (
            <p className="order-detail-modal__meta">No line items returned for this order.</p>
          ) : null}

          {detail && detail.items.length > 0 ? (
            <div className="order-detail-items-wrap">
              <table className="order-detail-items">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>ASIN</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.order_item_id || `${item.asin}-${item.seller_sku}`}>
                      <td className="order-detail-items__title">{item.title ?? '—'}</td>
                      <td>{item.asin ?? '—'}</td>
                      <td>{item.seller_sku ?? '—'}</td>
                      <td>
                        {item.quantity_shipped}/{item.quantity_ordered}
                      </td>
                      <td>{formatMoney(item.item_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <footer className="order-detail-modal__foot">
          <button type="button" className="order-detail-modal__done" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  )
}