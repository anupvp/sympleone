import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { fetchAlerts } from '../features/dashboard/api/dashboardApi'
import type { AlertActionItem } from '../features/dashboard/types/dashboard.types'
import './HeaderAlertsBell.css'

function groupAlerts(items: AlertActionItem[]) {
  const map = new Map<string, { label: string; items: AlertActionItem[] }>()
  for (const item of items) {
    const key = item.category || 'general'
    const label = item.categoryLabel || 'Alerts'
    const bucket = map.get(key) ?? { label, items: [] }
    bucket.items.push(item)
    map.set(key, bucket)
  }
  return Array.from(map.entries())
}

export function HeaderAlertsBell() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const popoverId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<AlertActionItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    try {
      setError(null)
      const rows = await fetchAlerts(token, filters)
      setAlerts(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load alerts')
    }
  }, [token, filters.marketplaceId, filters.dateFrom, filters.dateTo, filters.sellerId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const badge = useMemo(
    () => alerts.reduce((sum, row) => sum + Math.max(0, row.count), 0),
    [alerts],
  )

  const groups = useMemo(() => groupAlerts(alerts), [alerts])

  return (
    <div className="header-alerts" ref={rootRef}>
      <button
        type="button"
        className="header-alerts__btn"
        aria-label="Alerts and actions"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => {
          setOpen((v) => !v)
          if (!open) {
            void load()
          }
        }}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        {badge > 0 && <span className="header-alerts__badge">{badge > 99 ? '99+' : badge}</span>}
      </button>
      {open && (
        <div id={popoverId} className="header-alerts__panel" role="dialog" aria-label="Alerts">
          <p className="header-alerts__title">Alerts & actions</p>
          {error && <p className="header-alerts__error" role="alert">{error}</p>}
          {!error && groups.length === 0 && (
            <p className="header-alerts__empty">No alerts right now.</p>
          )}
          {groups.map(([key, group]) => (
            <section key={key} className="header-alerts__group">
              <h3 className="header-alerts__group-title">{group.label}</h3>
              <ul className="header-alerts__list">
                {group.items.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        to={item.href}
                        className={`header-alerts__item tone-${item.tone}`}
                        onClick={() => setOpen(false)}
                      >
                        <span className="header-alerts__count">{item.count}</span>
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <span className={`header-alerts__item tone-${item.tone}`}>
                        <span className="header-alerts__count">{item.count}</span>
                        <span>{item.title}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
