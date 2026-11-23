import type { OrderStatusData } from '../../dashboard/api/orderStatusApi'

export function OverviewOrderStatusWidget({ data }: { data: OrderStatusData | null }) {
  const segments = data?.statuses ?? []
  const total = data?.total_orders ?? 0
  const size = 128
  const stroke = 16
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  const visible = segments.filter((s) => s.count > 0)

  return (
    <section className="reports-widget">
      <header className="reports-widget__head">
        <h2 className="reports-widget__title">Order Status Distribution</h2>
      </header>
      {total === 0 ? (
        <p className="reports-panel__empty">
          Sync orders from the dashboard or Orders page, then click Prepare Report.
        </p>
      ) : (
        <div className="reports-order-status">
          <div className="reports-donut-wrap__chart reports-donut-wrap__chart--lg">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
              {visible.map((seg) => {
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
              <span>Total Orders</span>
            </div>
          </div>
          <ul className="reports-order-legend">
            {segments.map((seg) => (
              <li key={seg.status}>
                <span className="reports-order-legend__dot" style={{ background: seg.color }} />
                <span className="reports-order-legend__name">{seg.label}</span>
                <span className="reports-order-legend__stats">
                  <strong>{seg.percentage}%</strong>
                  <span className="reports-order-legend__count">– {seg.count.toLocaleString('en-IN')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}