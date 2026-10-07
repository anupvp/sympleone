import { useAppDispatch } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { HeaderAlertsBell } from './HeaderAlertsBell'
import { AppSidebar } from './AppSidebar'
import { ProfileMenu } from './ProfileMenu'
import './AppShell.css'

interface AppShellProps {
  children: React.ReactNode
  /** Global filters shown in the top bar (dashboard). */
  toolbar?: React.ReactNode
}

export function AppShell({ children, toolbar }: AppShellProps) {
  const dispatch = useAppDispatch()

  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="app-shell__body">
        <header className="app-shell__topbar">
          <div className="app-shell__filters">{toolbar}</div>
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
        </header>
        <main className="app-shell__main">{children}</main>
      </div>
    </div>
  )
}
