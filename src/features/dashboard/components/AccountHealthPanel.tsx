import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/hooks'
import { fetchAlerts } from '../api/dashboardApi'
import type { AlertActionItem } from '../types/dashboard.types'
import './AccountHealthPanel.css'

const HEALTH_ROWS: { id: string; label: string }[] = [
  { id: 'account-health-issues', label: 'Account Health Issues' },
  { id: 'policy-violation', label: 'Policy Violations' },
  { id: 'payment-hold', label: 'Payment Hold' },
  { id: 'low-inventory', label: 'Low Inventory' },
  { id: 'ad-budget', label: 'Ad Budget Exhausted' },
]

function countForAlert(alerts: AlertActionItem[], alertId: string): number {
  const row = alerts.find((a) => a.id === alertId)
  return row ? Math.max(0, row.count) : 0
}

export function AccountHealthPanel() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertActionItem[]>([])

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    try {
      const rows = await fetchAlerts(token, filters)
      setAlerts(rows)
    } catch {
      setAlerts([])
    }
  }, [token, filters.marketplaceId, filters.dateFrom, filters.dateTo, filters.sellerId])

  useEffect(() => {
    void load()
  }, [load])

  const rows = useMemo(
    () =>
      HEALTH_ROWS.map((row) => ({
        ...row,
        count: countForAlert(alerts, row.id),
      })),
    [alerts],
  )

  const totalIssues = useMemo(() => rows.reduce((sum, r) => sum + r.count, 0), [rows])

  return (
    <aside
      className={`account-health${open ? ' account-health--open' : ''}`}
      aria-label="Account health"
    >
      <button
        type="button"
        className="account-health__tab"
        aria-expanded={open}
        aria-controls="account-health-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="account-health__tab-label">Account Health</span>
        {totalIssues > 0 && !open && (
          <span className="account-health__tab-badge" aria-hidden>
            {totalIssues > 99 ? '99+' : totalIssues}
          </span>
        )}
      </button>
      <div
        id="account-health-drawer"
        className="account-health__drawer"
        aria-hidden={!open}
      >
        <div className="account-health__header">
          <h2 className="account-health__title">Account Health</h2>
          <button
            type="button"
            className="account-health__close"
            aria-label="Close account health panel"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <ul className="account-health__list">
          {rows.map((row) => (
            <li key={row.id} className="account-health__item">
              <span className="account-health__item-label">{row.label}</span>
              <span
                className={`account-health__item-count${row.count > 0 ? ' account-health__item-count--active' : ''}`}
              >
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {open && (
        <button
          type="button"
          className="account-health__backdrop"
          aria-label="Close account health panel"
          onClick={() => setOpen(false)}
        />
      )}
    </aside>
  )
}
