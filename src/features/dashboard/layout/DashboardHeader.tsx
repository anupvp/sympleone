import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { logout } from '../../auth/authSlice'
import { setFilters } from '../state/dashboardSlice'

export function DashboardHeader() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)

  const displayName = user?.name ?? user?.email ?? 'User'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="dash-header">
      <div className="dash-header__left">
        <button type="button" className="dash-icon-btn" aria-label="Menu">
          ☰
        </button>
        <div className="dash-brand">
          <span className="dash-brand__icon" aria-hidden>◆</span>
          <span className="dash-brand__text">Symple One</span>
        </div>
      </div>

      <div className="dash-header__filters">
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
        <span className="dash-date">
          May 1 – May 21, 2024
        </span>
      </div>

      <div className="dash-header__right">
        <button type="button" className="dash-icon-btn dash-notify" aria-label="Notifications">
          🔔
          <span className="dash-notify__badge">3</span>
        </button>
        <div className="dash-user">
          <span className="dash-user__avatar">{initials}</span>
          <div>
            <p className="dash-user__name">{displayName}</p>
            <p className="dash-user__role">Super Admin</p>
          </div>
        </div>
        <button
          type="button"
          className="dash-signout"
          onClick={() => void dispatch(logout())}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
