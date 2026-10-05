import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { isAdminUser, isSellerUser } from '../features/auth/auth.utils'
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

  const admin = isAdminUser(user)
  const seller = isSellerUser(user)

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__left">
          <div className="app-shell__brand">
            <span className="app-shell__brand-icon" aria-hidden>◆</span>
            <span>Symple One</span>
          </div>
          <nav className="app-shell__nav" aria-label="Main">
            <NavLink to="/dashboard" className="app-shell__nav-link" end>
              Dashboard
            </NavLink>
            {seller && (
              <NavLink to="/account/password" className="app-shell__nav-link">
                Password
              </NavLink>
            )}
            {admin && (
              <>
                <NavLink to="/admin/employees" className="app-shell__nav-link">
                  Employees
                </NavLink>
                <NavLink to="/admin/sellers" className="app-shell__nav-link">
                  Sellers
                </NavLink>
                <NavLink to="/admin/groups" className="app-shell__nav-link">
                  Groups
                </NavLink>
                <NavLink to="/admin/roles" className="app-shell__nav-link">
                  Roles
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {toolbar && <div className="app-shell__toolbar">{toolbar}</div>}

        <div className="app-shell__right">
          <HeaderAlertsBell />
          <div className="app-shell__account-actions">
            <ProfileMenu />
            <button
              type="button"
              className="app-shell__signout"
              onClick={() => void dispatch(logout())}
            >
              Sign out
            </button>
            {headerDateRange ? (
              <div className="app-shell__date-range">{headerDateRange}</div>
            ) : null}
          </div>
        </div>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  )
}
