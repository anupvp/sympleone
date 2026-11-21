import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '../../../../app/hooks'
import { ModuleFrame } from '../../components/ModuleFrame'
import {
  fetchLowProducts,
  fetchTopProducts,
  formatInrCompact,
  syncProductPerformance,
  type ProductPerformanceRow,
} from '../../api/productPerformanceApi'
import type { DashboardFilters } from '../../types/dashboard.types'

type TabKey = 'top' | 'low'

interface ProductPerformanceModuleProps {
  filters: DashboardFilters
  disabled?: boolean
}

function growthClass(display: string): string {
  if (display === 'NEW' || display.startsWith('+')) {
    return 'product-table__growth product-table__growth--up'
  }
  if (display.startsWith('-')) {
    return 'product-table__growth product-table__growth--down'
  }
  return 'product-table__growth'
}

export function ProductPerformanceModule({ filters, disabled }: ProductPerformanceModuleProps) {
  const token = useAppSelector((s) => s.auth.accessToken)
  const [tab, setTab] = useState<TabKey>('top')
  const [rows, setRows] = useState<ProductPerformanceRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const loadTab = useCallback(
    async (activeTab: TabKey) => {
      if (disabled || !token) {
        setStatus('idle')
        setRows([])
        return
      }
      setStatus('loading')
      setError(null)
      try {
        const response =
          activeTab === 'top'
            ? await fetchTopProducts(token, filters)
            : await fetchLowProducts(token, filters)
        setRows(response.data)
        setLastSyncedAt(response.metadata.last_synced_at)
        setStatus('success')
        if (response.data.length === 0 && !response.metadata.last_synced_at) {
          setError(null)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not load product performance'
        setError(message)
        setStatus('error')
      }
    },
    [disabled, token, filters],
  )

  useEffect(() => {
    void loadTab(tab)
  }, [loadTab, tab])

  const handleRetry = () => {
    void loadTab(tab)
  }

  const handleSync = async () => {
    if (!token || disabled) {
      return
    }
    setSyncing(true)
    setError(null)
    try {
      await syncProductPerformance(token, filters)
      await loadTab(tab)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed'
      setError(message)
      setStatus('error')
    } finally {
      setSyncing(false)
    }
  }

  const showEmpty = status === 'success' && rows.length === 0 && !error
  const frameStatus =
    disabled ? 'idle' : syncing || status === 'loading' ? 'loading' : 'success'

  return (
    <ModuleFrame
      title="Product Performance"
      status={frameStatus}
      error={null}
      className="chart-card product-card"
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
        <p className="product-card__hint">Select a seller account to view product performance.</p>
      )}

      {!disabled && error && (
        <div className="dash-module__error" role="alert">
          <p>{error}</p>
          <button type="button" className="product-card__retry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      {!disabled && frameStatus !== 'loading' && (
        <>
          <div className="product-tabs">
            <button
              type="button"
              className={tab === 'top' ? 'product-tabs__btn product-tabs__btn--active' : 'product-tabs__btn'}
              onClick={() => setTab('top')}
            >
              Top Products
            </button>
            <button
              type="button"
              className={tab === 'low' ? 'product-tabs__btn product-tabs__btn--active' : 'product-tabs__btn'}
              onClick={() => setTab('low')}
            >
              Low Performing
            </button>
          </div>

          {showEmpty ? (
            <div className="product-card__empty">
              <p>No product metrics yet for this period.</p>
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
            <div className="product-table-wrap">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {status === 'loading' &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skel-${index}`} className="product-table__skeleton-row">
                        <td colSpan={5}>
                          <span className="product-table__skeleton" />
                        </td>
                      </tr>
                    ))}
                  {status === 'success' &&
                    rows.map((row) => (
                      <tr key={row.sku}>
                        <td className="product-table__product-cell">
                          <span
                            className="product-table__name product-table__name--truncate"
                            title={row.product_name}
                          >
                            {row.product_name}
                          </span>
                          <span className="product-table__sku" title={row.sku}>
                            {row.sku}
                          </span>
                        </td>
                        <td>{formatInrCompact(row.sales)}</td>
                        <td>{row.orders.toLocaleString('en-IN')}</td>
                        <td>{formatInrCompact(row.revenue)}</td>
                        <td className={growthClass(row.growth_display)}>{row.growth_display}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {lastSyncedAt && (
            <p className="product-card__synced">
              Last synced{' '}
              {new Date(lastSyncedAt).toLocaleString(undefined, {
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