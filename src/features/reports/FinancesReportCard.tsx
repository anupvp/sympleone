import { ModuleFrame } from '../dashboard/components/ModuleFrame'
import type { FinancesReportResponse } from './financesApi'
import { FinancesTransactionsChart } from './FinancesTransactionsChart'

function formatPosted(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function formatAmount(amount: number, currency: string) {
  const sym = currency === 'INR' ? '₹' : `${currency} `
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface FinancesReportCardProps {
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  data: FinancesReportResponse | null
}

export function FinancesReportCard({ status, error, data }: FinancesReportCardProps) {
  return (
    <section className="reports-finances-outer" aria-labelledby="finances-heading">
      <header className="reports-finances-outer__header">
        <h1 id="finances-heading" className="reports-finances-outer__title">
          Finances
        </h1>
        {data && (
          <p className="reports-finances-outer__range">
            {data.dateFrom} → {data.dateTo}
            {data.truncated ? ' · Showing first pages only (more data on Amazon)' : ''}
          </p>
        )}
      </header>

      <div className="reports-finances-subcard">
        <h2 className="reports-finances-subcard__title">
          Financial transactions, amounts, types, dates and related references
        </h2>

        <ModuleFrame status={status} error={error} className="reports-finances-module">
          {data && (
            <>
              <FinancesTransactionsChart
                dailySeries={data.dailySeries}
                byType={data.byType}
                currencyCode={data.currencyCode}
              />

              <div className="finances-table-wrap">
                <table className="finances-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Settlement</th>
                      <th>Shipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="finances-table__empty">
                          No transactions for this date range.
                        </td>
                      </tr>
                    ) : (
                      data.transactions.map((row) => (
                        <tr key={row.transactionId}>
                          <td>{formatPosted(row.postedDate)}</td>
                          <td>{row.transactionType}</td>
                          <td className="finances-table__desc">{row.description ?? '—'}</td>
                          <td
                            className={
                              row.amount >= 0
                                ? 'finances-table__amount finances-table__amount--pos'
                                : 'finances-table__amount finances-table__amount--neg'
                            }
                          >
                            {formatAmount(row.amount, row.currencyCode)}
                          </td>
                          <td>{row.transactionStatus ?? '—'}</td>
                          <td className="finances-table__mono">{row.orderId ?? '—'}</td>
                          <td className="finances-table__mono">{row.settlementId ?? '—'}</td>
                          <td className="finances-table__mono">{row.shipmentId ?? '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </ModuleFrame>
      </div>
    </section>
  )
}