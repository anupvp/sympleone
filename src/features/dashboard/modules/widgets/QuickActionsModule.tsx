import { Link } from 'react-router-dom'
import { ModuleFrame } from '../../components/ModuleFrame'

const ACTIONS = [
  { label: 'Connect Seller', hint: 'Link Amazon account', to: '/amazon/connect', color: '#7c3aed' },
  { label: 'Add Product', hint: 'Create listing', to: '/app/products', color: '#2563eb' },
  { label: 'Manage Inventory', hint: 'Stock levels', to: '/app/inventory', color: '#0d9488' },
  { label: 'View Reports', hint: 'Analytics', to: '/app/reports', color: '#d97706' },
]

export function QuickActionsModule() {
  return (
    <ModuleFrame title="Quick Actions" status="success" error={null} className="chart-card quick-actions-card">
      <div className="quick-actions-grid">
        {ACTIONS.map((action) => (
          <Link key={action.label} to={action.to} className="quick-action">
            <span className="quick-action__icon" style={{ background: `${action.color}18`, color: action.color }}>
              ◆
            </span>
            <span className="quick-action__label">{action.label}</span>
            <span className="quick-action__hint">{action.hint} →</span>
          </Link>
        ))}
      </div>
    </ModuleFrame>
  )
}
