import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../../../app/hooks'
import { ModuleFrame } from '../../components/ModuleFrame'
import {
  fetchOrderStatus,
  syncOrderStatus,
  type OrderStatusData,
  type OrderStatusSegment,
} from '../../api/orderStatusApi'
import type { DashboardFilters } from '../../types/dashboard.types'

interface OrderStatusModuleProps {
  filters: DashboardFilters
  disabled?: boolean
}

function DonutChart({
  segments,
  total,
  size = 140,
}: {
  segments: OrderStatusSegment[]
  total: number
  size?: number
}) {
  const stroke = 18
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  const arcs = segments.filter((seg) => seg.percentage > 0)

  return (
    <div className="order-status-donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Order status breakdown">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {total > 0 ? (
          arcs.map((seg) => {
            const dash = (seg.percentage / 100) * c
            const circle = (
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
              >
                <title>
                  {seg.label}: {seg.count.toLocaleString('en-IN')} ({seg.percentage}%)
                </title>
              </circle>
            )
            offset += dash
            return circle
          })
        ) : (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        )}
      </svg>
      <div className="order-status-donut__center">
        <strong>{total.toLocaleString('en-IN')}</strong>
        <span>Orders</span>
      </div>
    </div>
  )
}

export function OrderStatusModule({ filters, disabled }: OrderStatusModuleProps) {
  const token = useAppSelector((s) => s.auth.accessToken)
  const [data, setData] = useState<OrderStatusData | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    if (disabled || !token) {
      setData(null)
      setStatus('idle')
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const response = await fetchOrderStatus(token, filters)
      setData(response.data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load order status')
      setStatus('error')
    }
  }, [disabled, token, filters])

  useEffect(() => {
    void load()
  }, [load])

  const handleSync = async () => {
    if (!token || disabled) {
      return
    }
    setSyncing(true)
    setError(null)
    try {
      await syncOrderStatus(token, filters)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
      setStatus('error')
    } finally {
      setSyncing(false)
    }
  }

  const segments = useMemo(() => data?.statuses ?? [], [data])
  const total = data?.total_orders ?? 0
  const showEmpty = status === 'success' && total === 0 && !data?.last_synced_at && !error
  const frameStatus =
    disabled ? 'idle' : syncing || status === 'loading' ? 'loading' : 'success'

  return (
    <ModuleFrame
      title="Order Status"
      status={frameStatus}
      error={null}
      className="chart-card order-status-card"
      action={
        !disabled ? (
          <button
            type="button"
            className="product-card__sync"
            onClick={() => void handleSync()}
            disabled={syncing || !token}
          >
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
        ) : null
      }
    >
      {disabled && (
        <p className="product-card__hint">Select a seller account to view order status.</p>
      )}

      {!disabled && error && (
        <div className="dash-module__error" role="alert">
          <p>{error}</p>
          <button type="button" className="product-card__retry" onClick={() => void load()}>
            Retry
          </button>
        </div>
      )}

      {!disabled && frameStatus !== 'loading' && !error && (
        <>
          {showEmpty ? (
            <div className="product-card__empty">
              <p>No orders synced for this period.</p>
              <button
                type="button"
                className="product-card__sync product-card__sync--inline"
                onClick={() => void handleSync()}
                disabled={syncing}
              >
                Sync from Amazon
              </button>
            </div>
          ) : (
            <div className="order-status-layout">
              <DonutChart segments={segments} total={total} />
              <ul className="order-status-legend">
                {segments.map((seg) => (
                  <li key={seg.status} title={`${seg.count.toLocaleString('en-IN')} orders`}>
                    <span className="order-status-legend__dot" style={{ background: seg.color }} />
                    {seg.label} <strong>{seg.percentage}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data?.last_synced_at && (
            <p className="product-card__synced">
              Last synced{' '}
              {new Date(data.last_synced_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </>
      )}
    </ModuleFrame>
  )
}