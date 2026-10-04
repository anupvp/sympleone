import { useMemo, useState } from 'react'
import { SearchableTable, type SearchableColumn } from '../../../components/SearchableTable'
import '../../../components/searchable-table.css'
import type { AdminSellersOverview, SellerRecord } from '../types'

export type SellerTab = 'all' | 'assigned' | 'unassigned' | 'paid' | 'unpaid'

const TAB_LABELS: { id: SellerTab; label: string; countKey: keyof AdminSellersOverview['counts'] }[] =
  [
    { id: 'all', label: 'All', countKey: 'total' },
    { id: 'assigned', label: 'Assigned', countKey: 'assigned' },
    { id: 'unassigned', label: 'Unassigned', countKey: 'unassigned' },
    { id: 'paid', label: 'Paid', countKey: 'paid' },
    { id: 'unpaid', label: 'Non-paid', countKey: 'unpaid' },
  ]

function filterByTab(sellers: SellerRecord[], tab: SellerTab): SellerRecord[] {
  switch (tab) {
    case 'assigned':
      return sellers.filter((s) => s.is_assigned)
    case 'unassigned':
      return sellers.filter((s) => !s.is_assigned)
    case 'paid':
      return sellers.filter((s) => s.is_paid)
    case 'unpaid':
      return sellers.filter((s) => !s.is_paid)
    default:
      return sellers
  }
}

interface SellersOverviewTabsProps {
  overview: AdminSellersOverview
  columns: SearchableColumn<SellerRecord>[]
  onRowAction?: (seller: SellerRecord) => void
  rowActionLabel?: string
}

export function SellersOverviewTabs({
  overview,
  columns,
  onRowAction,
  rowActionLabel,
}: SellersOverviewTabsProps) {
  const [tab, setTab] = useState<SellerTab>('all')

  const rows = useMemo(
    () => filterByTab(overview.sellers, tab),
    [overview.sellers, tab],
  )

  const tableColumns = useMemo(() => {
    if (!onRowAction || !rowActionLabel) {
      return columns
    }
    return [
      ...columns,
      {
        key: 'actions',
        header: '',
        searchText: () => '',
        render: (row: SellerRecord) => (
          <button type="button" className="admin-btn" onClick={() => onRowAction(row)}>
            {rowActionLabel}
          </button>
        ),
      },
    ]
  }, [columns, onRowAction, rowActionLabel])

  return (
    <div className="sellers-overview">
      <div className="sellers-overview__stats">
        {TAB_LABELS.map(({ id, label, countKey }) => (
          <button
            key={id}
            type="button"
            className={`sellers-overview__stat${tab === id ? ' sellers-overview__stat--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <span className="sellers-overview__stat-value">{overview.counts[countKey]}</span>
            <span className="sellers-overview__stat-label">{label}</span>
          </button>
        ))}
      </div>
      <SearchableTable
        rows={rows}
        columns={tableColumns}
        rowKey={(r) => r.id}
        searchPlaceholder="Search sellers by name, email, status…"
        emptyMessage="No sellers in this tab."
      />
    </div>
  )
}
