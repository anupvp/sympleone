import { useMemo } from 'react'
import { SearchableTable, type SearchableColumn } from '../../../../components/SearchableTable'
import '../../../../components/searchable-table.css'
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
  const rows = module.data ?? []

  const columns = useMemo((): SearchableColumn<MarketplaceRow>[] => {
    return [
      {
        key: 'marketplace',
        header: 'Marketplace',
        searchText: (row) => `${row.name} ${row.slug}`,
        render: (row) => <MarketplaceBadge name={row.name} slug={row.slug} />,
      },
      {
        key: 'sales',
        header: 'Sales',
        searchText: (row) => row.gmv,
        render: (row) => row.gmv,
      },
      {
        key: 'orders',
        header: 'Orders',
        searchText: (row) => row.netSales,
        render: (row) => row.netSales,
      },
      {
        key: 'orderCount',
        header: 'Order count',
        searchText: (row) => String(row.orders ?? 0),
        render: (row) => (row.orders ?? 0).toLocaleString(),
      },
      {
        key: 'return',
        header: 'Return',
        searchText: (row) => row.profit,
        render: (row) => row.profit,
      },
      {
        key: 'products',
        header: 'Products',
        searchText: (row) => String(row.profitPercent ?? 0),
        render: (row) => (row.profitPercent ?? 0).toLocaleString(),
      },
      {
        key: 'growth',
        header: 'Growth',
        searchText: (row) => String(row.growthPercent),
        render: (row) => {
          const up = row.growthPercent >= 0
          return (
            <span className={up ? 'text-up' : 'text-down'}>
              {up ? '↑' : '↓'} {Math.abs(row.growthPercent).toFixed(1)}%
            </span>
          )
        },
      },
      {
        key: 'trend',
        header: '',
        searchText: () => '',
        render: (row) => {
          const up = row.growthPercent >= 0
          return <Sparkline values={row.sparkline} positive={up} />
        },
      },
    ]
  }, [])

  return (
    <ModuleFrame
      title="Marketplace Performance"
      status={module.status}
      error={module.error}
      className="table-module"
    >
      <div className="table-wrap">
        <SearchableTable
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Search marketplaces by any column…"
          emptyMessage="No marketplace rows to show."
          className="mp-search-table"
          tableClassName="mp-table"
        />
      </div>
    </ModuleFrame>
  )
}
