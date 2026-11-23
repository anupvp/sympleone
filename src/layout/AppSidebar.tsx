import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { isAdminUser } from '../features/auth/auth.utils'
import { REPORT_CATALOG } from '../features/reports/reportsCatalog'
import { SIDEBAR_NAV } from './sidebarNav'
import './AppSidebar.css'

function NavIcon({ id }: { id: string }) {
  const paths: Record<string, string> = {
    dashboard: 'M4 6h16v12H4z M8 10h8',
    orders: 'M6 4h12v16H6z M9 8h6',
    products: 'M5 8h14l-1 10H6L5 8z M9 8V6h6v2',
    'fba-inventory': 'M4 8h16v10H4z M6 12h4v4H6z M14 12h4v4h-4z',
    marketplaces: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
    advertising: 'M4 12h16M12 4v16',
    sellers: 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1',
    reports: 'M6 4h9l5 5v11H6z',
    alerts: 'M15 17H9l-1-4a5 5 0 0 1 10 0l-1 4z',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 12h2M18 12h2M12 4v2M12 18v2',
  }
  const d = paths[id] ?? paths.dashboard
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d={d} />
    </svg>
  )
}

export function AppSidebar() {
  const user = useAppSelector((s) => s.auth.user)
  const admin = isAdminUser(user)
  const location = useLocation()

  const items = SIDEBAR_NAV.filter((item) => !item.adminOnly || admin)
  const reportsActive = location.pathname.startsWith('/app/reports')
  const reportLinks = REPORT_CATALOG.filter((r) => !r.adminOnly || admin)

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <Link to="/dashboard" className="app-sidebar__brand">
        <span className="app-sidebar__brand-icon" aria-hidden>◆</span>
        <span>Symple One</span>
      </Link>

      <nav className="app-sidebar__nav">
        {items.map((item) => {
          const isHash = item.to.includes('#')
          const active = isHash
            ? location.pathname === '/dashboard' &&
              location.hash === item.to.slice(item.to.indexOf('#'))
            : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

          if (isHash) {
            return (
              <a
                key={item.id}
                href={item.to}
                className={`app-sidebar__link${active ? ' app-sidebar__link--active' : ''}`}
              >
                <NavIcon id={item.id} />
                {item.label}
              </a>
            )
          }

          const isReports = item.id === 'reports'

          return (
            <div key={item.id} className="app-sidebar__group">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `app-sidebar__link${isActive || (isReports && reportsActive) ? ' app-sidebar__link--active' : ''}`
                }
                end={item.to === '/dashboard'}
              >
                <NavIcon id={item.id} />
                {item.label}
              </NavLink>
              {isReports && (
                <div className="app-sidebar__subnav" aria-label="Reports & Analytics">
                  {reportLinks.map((report) => (
                    <NavLink
                      key={report.id}
                      to={`/app/reports/${report.slug}`}
                      className={({ isActive }) =>
                        `app-sidebar__sublink${isActive ? ' app-sidebar__sublink--active' : ''}`
                      }
                      end
                    >
                      {report.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="app-sidebar__help">
        <p className="app-sidebar__help-title">Need help?</p>
        <p className="app-sidebar__help-text">Browse guides and contact support.</p>
        <a className="app-sidebar__help-btn" href="https://sympleone.com" target="_blank" rel="noreferrer">
          View Help Center
        </a>
      </div>
    </aside>
  )
}
