import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import {
  ACCOUNT_HEALTH_METRIC_LABELS,
  type AccountHealthMetricId,
} from './utils/accountHealthReport'
import './AccountHealthReportPage.css'

const VALID_METRICS = new Set<string>(Object.keys(ACCOUNT_HEALTH_METRIC_LABELS))

export function AccountHealthReportPage() {
  const [params] = useSearchParams()
  const metricParam = params.get('metric') ?? ''
  const sellerId = params.get('sellerId')
  const dateFrom = params.get('dateFrom')
  const dateTo = params.get('dateTo')
  const marketplaceId = params.get('marketplaceId')

  const title = useMemo(() => {
    if (VALID_METRICS.has(metricParam)) {
      return ACCOUNT_HEALTH_METRIC_LABELS[metricParam as AccountHealthMetricId]
    }
    return 'Account health report'
  }, [metricParam])

  const unknownMetric = metricParam && !VALID_METRICS.has(metricParam)

  return (
    <AppShell>
      <div className="account-health-report">
        <p className="account-health-report__back">
          <Link to="/dashboard">← Back to dashboard</Link>
        </p>
        <header className="account-health-report__head">
          <h1>{title}</h1>
          <p className="account-health-report__meta">
            Detailed report
            {dateFrom && dateTo ? ` · ${dateFrom} – ${dateTo}` : ''}
            {marketplaceId ? ` · Marketplace ${marketplaceId}` : ''}
            {sellerId ? ` · Seller context` : ''}
          </p>
        </header>

        {unknownMetric && (
          <p className="account-health-report__error" role="alert">
            Unknown metric “{metricParam}”.
          </p>
        )}

        <section className="account-health-report__card">
          <h2>Summary</h2>
          <p>
            This report will list affected SKUs, orders, and recommended actions once Amazon
            SP-API data is connected for <strong>{title}</strong>.
          </p>
        </section>

        <section className="account-health-report__card">
          <h2>Recent events</h2>
          <table className="account-health-report__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Detail</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>—</td>
                <td>No live feed yet</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  )
}
