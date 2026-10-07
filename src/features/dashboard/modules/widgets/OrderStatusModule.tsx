import { ModuleFrame } from '../../components/ModuleFrame'

const SEGMENTS = [
  { label: 'Delivered', percent: 78, color: '#22c55e' },
  { label: 'In Transit', percent: 12, color: '#3b82f6' },
  { label: 'Processing', percent: 7, color: '#f59e0b' },
  { label: 'Cancelled', percent: 3, color: '#ef4444' },
]

export function OrderStatusModule() {
  const size = 140
  const stroke = 18
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <ModuleFrame title="Order Status" status="success" error={null} className="chart-card order-status-card">
      <div className="order-status-layout">
        <div className="order-status-donut">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            {SEGMENTS.map((seg) => {
              const dash = (seg.percent / 100) * c
              const circle = (
                <circle
                  key={seg.label}
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
              return circle
            })}
          </svg>
          <div className="order-status-donut__center">
            <strong>1,842</strong>
            <span>Orders</span>
          </div>
        </div>
        <ul className="order-status-legend">
          {SEGMENTS.map((seg) => (
            <li key={seg.label}>
              <span className="order-status-legend__dot" style={{ background: seg.color }} />
              {seg.label} <strong>{seg.percent}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </ModuleFrame>
  )
}
