import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { setFilters } from '../state/dashboardSlice'
import { formatSalesPeriodLabel } from '../utils/salesPeriodUtils'

export function DashboardToolbar() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.dashboard.filters)

  return (
    <div className="dash-toolbar">
      <select
        className="dash-select"
        value={filters.accountId}
        onChange={(e) => dispatch(setFilters({ accountId: e.target.value }))}
        aria-label="Accounts"
      >
        <option value="all">All Accounts</option>
      </select>
      <select
        className="dash-select"
        value={filters.marketplaceId}
        onChange={(e) => dispatch(setFilters({ marketplaceId: e.target.value }))}
        aria-label="Marketplaces"
      >
        <option value="all">All Marketplaces</option>
      </select>
      <span className="dash-date">{formatSalesPeriodLabel(filters)}</span>
    </div>
  )
}
