import { useCallback, useEffect, useState } from 'react'
import { AppShell } from '../../layout/AppShell'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { DashboardToolbar } from '../dashboard/layout/DashboardToolbar'
import '../dashboard/dashboard.css'
import { FbaInventoryCard } from './FbaInventoryCard'
import { fetchFbaInventory, type FbaInventoryResponse } from './fbaInventoryApi'
import './FbaInventoryPage.css'

export function FbaInventoryPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [data, setData] = useState<FbaInventoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setData(null)
      setError('Select a seller account to load FBA inventory.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = await fetchFbaInventory(token, filters)
      setData(payload)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : 'Failed to load FBA inventory')
    } finally {
      setLoading(false)
    }
  }, [token, filters, needsSeller])

  useEffect(() => {
    void load()
  }, [load])

  const status = loading ? 'loading' : error ? 'error' : data ? 'success' : 'idle'

  return (
    <AppShell>
      <div className="fba-inv-page">
        <div className="fba-inv-page__head">
          <div>
            <h1 className="fba-inv-page__title">FBA Inventory</h1>
            <p className="fba-inv-page__meta">
              Stock in Amazon fulfillment centres for the selected marketplace.
            </p>
          </div>
          <button
            type="button"
            className="fba-inv-page__refresh"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <DashboardToolbar />
        <FbaInventoryCard status={status} error={error} data={data} />
      </div>
    </AppShell>
  )
}