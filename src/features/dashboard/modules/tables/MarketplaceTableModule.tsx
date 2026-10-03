import { ModuleFrame } from '../../components/ModuleFrame'
import { Sparkline } from '../../components/Sparkline'
import type { DashboardModuleState, MarketplaceRow } from '../../types/dashboard.types'

interface MarketplaceTableModuleProps {
  module: DashboardModuleState<MarketplaceRow[]>
}

function MarketplaceBadge({ name, slug }: { name: string; slug: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <span className="mp-cell">
      <span className={`mp-logo mp-logo--${slug}`}>{initial}</span>
      {name}
    </span>
  )
}

export function MarketplaceTableModule({ module }: MarketplaceTableModuleProps) {
  return (
    <ModuleFrame
      title="Marketplace Performance"
      status={module.status}
      error={module.error}
      className="table-module"
    >
      <div className="table-wrap">
        <table className="mp-table">
          <thead>
            <tr>
              <th>Marketplace</th>
              <th>Sales</th>
              <th>Orders</th>
              <th>Order count</th>
              <th>Return</th>
              <th>Products</th>
              <th>Growth</th>
              <th aria-label="Trend" />
            </tr>
          </thead>
          <tbody>
            {module.data?.map((row) => {
              const up = row.growthPercent >= 0
              return (
                <tr key={row.id}>
                  <td>
                    <MarketplaceBadge name={row.name} slug={row.slug} />
                  </td>
                  <td>{row.gmv}</td>
                  <td>{row.netSales}</td>
                  <td>{(row.orders ?? 0).toLocaleString()}</td>
                  <td>{row.profit}</td>
                  <td>{(row.profitPercent ?? 0).toLocaleString()}</td>
                  <td className={up ? 'text-up' : 'text-down'}>
                    {up ? '↑' : '↓'} {Math.abs(row.growthPercent).toFixed(1)}%
                  </td>
                  <td>
                    <Sparkline values={row.sparkline} positive={up} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ModuleFrame>
  )
}
