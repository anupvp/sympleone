import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { FinancesReportCard } from './FinancesReportCard'
import { fetchFinancesReport, type FinancesReportResponse } from './financesApi'
import { reportBySlug } from './reportsCatalog'
import { ReportPageHeader } from './ReportPageHeader'
import './ReportsPage.css'

const REPORT = reportBySlug('transaction')!

export function TransactionReportPage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const needsSeller = needsSellerDashboardContext(user)

  const [data, setData] = useState<FinancesReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setData(null)
      setError('Select a seller account to load finances.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const report = await fetchFinancesReport(token, filters)
      setData(report)
    } catch (e) {
      setData(null)
      setError(e instanceof Error ? e.message : 'Failed to load finances')
    } finally {
      setLoading(false)
    }
  }, [token, filters, needsSeller])

  useEffect(() => {
    void load()
  }, [load])

  const status = loading ? 'loading' : error ? 'error' : data ? 'success' : 'idle'

  return (
    <div className="reports-page">
      <ReportPageHeader
        report={REPORT}
        actions={
          <button type="button" className="reports-page__refresh" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />
      <FinancesReportCard status={status} error={error} data={data} />
    </div>
  )
}