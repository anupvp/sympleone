import { ModuleFrame } from '../dashboard/components/ModuleFrame'
import type { FbaInventoryResponse } from './fbaInventoryApi'
import { FbaInventoryEmptyState } from './FbaInventoryEmptyState'

interface FbaInventoryCardProps {
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  data: FbaInventoryResponse | null
}

function formatUpdated(iso: string | null) {
  if (!iso) {
    return '—'
  }
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function FbaInventoryCard({ status, error, data }: FbaInventoryCardProps) {
  return (
    <section className="fba-inv-outer" aria-labelledby="fba-inventory-heading">
      <header className="fba-inv-outer__header">
        <h1 id="fba-inventory-heading" className="fba-inv-outer__title">
          FBA Inventory
        </h1>
        {data && (
          <p className="fba-inv-outer__meta">
            Marketplace {data.marketplaceId}
            {data.granularityType ? ` · ${data.granularityType}` : ''}
            {data.truncated ? ' · Showing first pages only' : ''}
          </p>
        )}
      </header>

      <div className="fba-inv-subcard">
        <h2 className="fba-inv-subcard__title">Fulfillment centre stock and inbound units</h2>
        <ModuleFrame status={status} error={error} className="fba-inv-module">
          {data &&
            (data.isEmpty ? (
              <FbaInventoryEmptyState metrics={data.metrics} />
            ) : (
              <>
                <div className="fba-inv-metrics-grid fba-inv-metrics-grid--compact">
                  <div className="fba-inv-metric fba-inv-metric--compact">
                    <p className="fba-inv-metric__label">Fulfillable</p>
                    <p className="fba-inv-metric__value">
                      {data.metrics.fulfillable.toLocaleString()} units
                    </p>
                  </div>
                  <div className="fba-inv-metric fba-inv-metric--compact">
                    <p className="fba-inv-metric__label">Reserved</p>
                    <p className="fba-inv-metric__value">
                      {data.metrics.reserved.toLocaleString()} units
                    </p>
                  </div>
                  <div className="fba-inv-metric fba-inv-metric--compact">
                    <p className="fba-inv-metric__label">Inbound</p>
                    <p className="fba-inv-metric__value">
                      {data.metrics.inbound.toLocaleString()} units
                    </p>
                  </div>
                  <div className="fba-inv-metric fba-inv-metric--compact">
                    <p className="fba-inv-metric__label">Unfulfillable</p>
                    <p className="fba-inv-metric__value">
                      {data.metrics.unfulfillable.toLocaleString()} units
                    </p>
                  </div>
                </div>

                <div className="fba-inv-table-wrap">
                  <table className="fba-inv-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>ASIN</th>
                        <th>Product</th>
                        <th>Fulfillable</th>
                        <th>Reserved</th>
                        <th>Inbound</th>
                        <th>Unfulfillable</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((row) => (
                        <tr key={`${row.sellerSku ?? ''}-${row.asin ?? ''}-${row.fnSku ?? ''}`}>
                          <td className="fba-inv-table__mono">{row.sellerSku ?? '—'}</td>
                          <td className="fba-inv-table__mono">{row.asin ?? '—'}</td>
                          <td className="fba-inv-table__product">{row.productName ?? '—'}</td>
                          <td>{row.fulfillable}</td>
                          <td>{row.reserved}</td>
                          <td>{row.inbound}</td>
                          <td>{row.unfulfillable}</td>
                          <td>{formatUpdated(row.lastUpdatedTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="fba-inv-empty__source">
                  Inventory data source: Amazon SP-API · FBA Inventory API
                </p>
              </>
            ))}
        </ModuleFrame>
      </div>
    </section>
  )
}