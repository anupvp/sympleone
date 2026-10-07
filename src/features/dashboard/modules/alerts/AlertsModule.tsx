import { useMemo, useState } from 'react'
import { ModuleFrame } from '../../components/ModuleFrame'
import type { AlertActionItem, DashboardModuleState } from '../../types/dashboard.types'

interface AlertsModuleProps {
  module: DashboardModuleState<AlertActionItem[]>
}

type AlertTab = 'all' | 'account_health' | 'inventory' | 'policy' | 'payments' | 'ads'

const TABS: { id: AlertTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'account_health', label: 'Account Health' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'policy', label: 'Policy' },
  { id: 'payments', label: 'Payments' },
  { id: 'ads', label: 'Ads' },
]

function matchesTab(item: AlertActionItem, tab: AlertTab): boolean {
  if (tab === 'all') {
    return true
  }
  const cat = item.category ?? ''
  const id = item.id
  if (tab === 'account_health') {
    return cat === 'account_health' || cat === 'risk'
  }
  if (tab === 'inventory') {
    return cat === 'inventory' || id.includes('inventory')
  }
  if (tab === 'policy') {
    return id.includes('policy')
  }
  if (tab === 'payments') {
    return id.includes('payment') || id.includes('hold')
  }
  if (tab === 'ads') {
    return cat === 'advertising' || id.includes('ad')
  }
  return true
}

export function AlertsModule({ module }: AlertsModuleProps) {
  const [tab, setTab] = useState<AlertTab>('all')
  const items = module.data ?? []

  const filtered = useMemo(() => items.filter((item) => matchesTab(item, tab)), [items, tab])

  return (
    <ModuleFrame
      title="Alerts / Action Center"
      status={module.status}
      error={module.error}
      className="alerts-module"
    >
      <div className="alerts-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'alerts-tabs__btn alerts-tabs__btn--active' : 'alerts-tabs__btn'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="alerts-feed">
        {filtered.length === 0 && (
          <li className="alerts-feed__empty">No alerts in this category.</li>
        )}
        {filtered.map((item) => (
          <li key={item.id} className="alerts-feed__item">
            <span className={`alerts-feed__dot alerts-feed__dot--${item.tone}`} />
            <div className="alerts-feed__body">
              <p className="alerts-feed__title">{item.title}</p>
              <p className="alerts-feed__meta">{item.categoryLabel ?? 'Alert'} · now</p>
            </div>
            {item.count > 0 && <span className="alerts-feed__count">{item.count}</span>}
          </li>
        ))}
      </ul>
    </ModuleFrame>
  )
}
