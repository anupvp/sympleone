import { Link, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { isSellerUser } from '../features/auth/auth.utils'
import { HeaderAlertsBell } from './HeaderAlertsBell'
import { ProfileMenu } from './ProfileMenu'
import './AppShell.css'

interface AppShellProps {
  children: React.ReactNode
  /** Dashboard-specific toolbar (filters, etc.) */
  toolbar?: React.ReactNode
  /** Date range controls shown under Sign out (dashboard). */
  headerDateRange?: React.ReactNode
}

export function AppShell({ children, toolbar, headerDateRange }: AppShellProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const seller = isSellerUser(user)

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__left">
          <Link to="/dashboard" className="app-shell__brand">
            <span className="app-shell__brand-icon" aria-hidden>◆</span>
            <span>Symple One</span>
          </Link>
          {seller && (
            <nav className="app-shell__nav" aria-label="Main">
              <NavLink to="/account/password" className="app-shell__nav-link">
                Password
              </NavLink>
            </nav>
          )}
        </div>

        {toolbar && <div className="app-shell__toolbar">{toolbar}</div>}

        <div className="app-shell__right">
          <div className="app-shell__header-tools">
            <HeaderAlertsBell />
            <ProfileMenu />
            <button
              type="button"
              className="app-shell__signout"
              onClick={() => void dispatch(logout())}
            >
              Sign out
            </button>
          </div>
          {headerDateRange ? (
            <div className="app-shell__date-range">{headerDateRange}</div>
          ) : null}
        </div>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  )
}
