import type { FbaInventoryMetrics } from './fbaInventoryApi'

const WHY_EMPTY = [
  'No products are currently stored in Amazon fulfillment centres.',
  'Your products may be fulfilled directly by you (FBM).',
  'Your FBA inventory may not have been received by Amazon yet.',
  'Your products may not have active FBA listings.',
]

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="fba-inv-metric">
      <span className="fba-inv-metric__icon" aria-hidden>
        {icon}
      </span>
      <p className="fba-inv-metric__label">{label}</p>
      <p className="fba-inv-metric__value">{value.toLocaleString()} units</p>
    </div>
  )
}

function BoxOpenIcon() {
  return (
    <svg viewBox="0 0 48 48" width="40" height="40" fill="none" aria-hidden>
      <path
        d="M8 16l16-8 16 8v20H8V16z"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M24 8v28M8 16l16 10 16-10" stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  )
}

function MetricIcons({ kind }: { kind: 'fulfillable' | 'reserved' | 'inbound' | 'unfulfillable' }) {
  const stroke = '#64748b'
  switch (kind) {
    case 'fulfillable':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
          <path d="M4 8h16v12H4z" stroke={stroke} strokeWidth="1.5" />
          <path d="M9 13l2 2 4-4" stroke="#10b981" strokeWidth="1.5" />
        </svg>
      )
    case 'reserved':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
          <rect x="6" y="10" width="12" height="10" rx="2" stroke={stroke} strokeWidth="1.5" />
          <path d="M9 10V8a3 3 0 0 1 6 0v2" stroke={stroke} strokeWidth="1.5" />
        </svg>
      )
    case 'inbound':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
          <path d="M3 13h11v5H3z" stroke={stroke} strokeWidth="1.5" />
          <path d="M14 15h4l3 2v3h-7v-5z" stroke={stroke} strokeWidth="1.5" />
          <circle cx="7" cy="18" r="1.5" fill={stroke} />
          <circle cx="17" cy="18" r="1.5" fill={stroke} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
          <path d="M5 8h14v12H5z" stroke={stroke} strokeWidth="1.5" />
          <path d="M9 11l6 6M15 11l-6 6" stroke="#ef4444" strokeWidth="1.5" />
        </svg>
      )
  }
}

export function FbaInventoryEmptyState({ metrics }: { metrics: FbaInventoryMetrics }) {
  return (
    <div className="fba-inv-empty">
      <div className="fba-inv-empty__hero-icon" aria-hidden>
        <BoxOpenIcon />
      </div>
      <h3 className="fba-inv-empty__title">No FBA inventory found</h3>
      <p className="fba-inv-empty__subtitle">
        Amazon has not returned any FBA inventory records for this seller in the selected
        marketplace.
      </p>

      <div className="fba-inv-metrics-grid">
        <MetricCard
          label="Fulfillable"
          value={metrics.fulfillable}
          icon={<MetricIcons kind="fulfillable" />}
        />
        <MetricCard
          label="Reserved"
          value={metrics.reserved}
          icon={<MetricIcons kind="reserved" />}
        />
        <MetricCard
          label="Inbound"
          value={metrics.inbound}
          icon={<MetricIcons kind="inbound" />}
        />
        <MetricCard
          label="Unfulfillable"
          value={metrics.unfulfillable}
          icon={<MetricIcons kind="unfulfillable" />}
        />
      </div>

      <div className="fba-inv-empty__help">
        <h4 className="fba-inv-empty__help-title">Why is my inventory empty?</h4>
        <ul className="fba-inv-empty__list">
          {WHY_EMPTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <p className="fba-inv-empty__source">
        Inventory data source: Amazon SP-API · FBA Inventory API
      </p>
    </div>
  )
}