import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppSelector } from '../../app/hooks'
import { isAdminUser, isEmployeeUser, roleLabel } from '../auth/auth.utils'
import { openSellerDashboard } from '../dashboard/utils/dashboardNavigation'
import {
  fetchEmployeeAssignedSellers,
  fetchEmployeeProfile,
  fetchEmployeeSellers,
  requestSellerAccess,
  type EmployeeProfile,
  type EmployeeSellerRow,
} from './accountApi'
import './ProfilePage.css'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function ProfilePage() {
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const admin = isAdminUser(user)
  const employee = isEmployeeUser(user)

  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [assigned, setAssigned] = useState<EmployeeSellerRow[]>([])
  const [catalog, setCatalog] = useState<EmployeeSellerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [requestingId, setRequestingId] = useState<string | null>(null)

  const loadEmployee = useCallback(async () => {
    if (!token || !employee) {
      return
    }
    try {
      setError(null)
      const [me, assignedRows, catalogRows] = await Promise.all([
        fetchEmployeeProfile(token),
        fetchEmployeeAssignedSellers(token),
        fetchEmployeeSellers(token),
      ])
      setProfile(me)
      setAssigned(assignedRows)
      setCatalog(catalogRows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile')
    }
  }, [token, employee])

  useEffect(() => {
    void loadEmployee()
  }, [loadEmployee])

  const onRequestAccess = async (sellerId: string) => {
    if (!token) {
      return
    }
    setRequestingId(sellerId)
    try {
      await requestSellerAccess(token, sellerId)
      await loadEmployee()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setRequestingId(null)
    }
  }

  const displayName = user?.name ?? user?.email ?? 'User'

  return (
    <AppShell>
      <div className="profile-page">
        <header className="profile-page__head">
          <h1 className="profile-page__title">Profile</h1>
          <p className="profile-page__subtitle">
            {displayName} · {roleLabel(user?.role)}
          </p>
        </header>

        {error && <p className="profile-page__error" role="alert">{error}</p>}

        {admin && (
          <section className="profile-card">
            <h2 className="profile-card__title">Admin workspace</h2>
            <p className="profile-card__lead">
              Manage sellers and staff, authorize accounts, and review access requests.
            </p>
            <div className="profile-link-grid">
              <Link to="/admin/sellers" className="profile-link-card">
                <span className="profile-link-card__label">Sellers</span>
                <span className="profile-link-card__hint">Add, authorize, on hold, delete, assign</span>
              </Link>
              <Link to="/admin/employees" className="profile-link-card">
                <span className="profile-link-card__label">Employees</span>
                <span className="profile-link-card__hint">Add, manage roles, assign sellers</span>
              </Link>
              <Link to="/admin/groups" className="profile-link-card">
                <span className="profile-link-card__label">Groups</span>
                <span className="profile-link-card__hint">Organize users and sellers</span>
              </Link>
              <Link to="/admin/roles" className="profile-link-card">
                <span className="profile-link-card__label">Roles & policies</span>
                <span className="profile-link-card__hint">Permissions and access rules</span>
              </Link>
              <div className="profile-link-card profile-link-card--muted" aria-disabled="true">
                <span className="profile-link-card__label">Attendance</span>
                <span className="profile-link-card__hint">Coming soon</span>
              </div>
              <div className="profile-link-card profile-link-card--muted" aria-disabled="true">
                <span className="profile-link-card__label">Performance</span>
                <span className="profile-link-card__hint">Coming soon</span>
              </div>
            </div>
          </section>
        )}

        {employee && profile && (
          <>
            <section className="profile-card">
              <h2 className="profile-card__title">Your details</h2>
              <dl className="profile-details">
                <div>
                  <dt>Name</dt>
                  <dd>{profile.full_name}</dd>
                </div>
                <div>
                  <dt>Employee ID</dt>
                  <dd>{profile.employee_code ?? '—'}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{profile.location ?? '—'}</dd>
                </div>
                <div>
                  <dt>Manager</dt>
                  <dd>{profile.manager_name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{formatDate(profile.joined_at)}</dd>
                </div>
              </dl>
            </section>

            <section className="profile-card">
              <h2 className="profile-card__title">Assigned sellers</h2>
              <p className="profile-card__lead">
                Open a seller dashboard in a new tab for accounts assigned to you.
              </p>
              {assigned.length === 0 ? (
                <p className="profile-page__empty">No sellers assigned yet.</p>
              ) : (
                <table className="profile-table">
                  <thead>
                    <tr>
                      <th>Seller</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {assigned.map((row) => (
                      <tr key={row.id}>
                        <td>{row.full_name}</td>
                        <td>{row.status}</td>
                        <td className="profile-table__actions">
                          <button
                            type="button"
                            className="profile-btn"
                            onClick={() => openSellerDashboard(row.id)}
                          >
                            View dashboard
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="profile-card">
              <h2 className="profile-card__title">All active sellers</h2>
              <p className="profile-card__lead">
                Request access from an admin for sellers you are not assigned to yet.
              </p>
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Seller</th>
                    <th>Your access</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((row) => (
                    <tr key={row.id}>
                      <td>{row.full_name}</td>
                      <td>
                        {row.has_dashboard_access
                          ? 'Assigned'
                          : row.access_request_status === 'pending'
                            ? 'Access requested'
                            : 'Not assigned'}
                      </td>
                      <td className="profile-table__actions">
                        {row.has_dashboard_access ? (
                          <button
                            type="button"
                            className="profile-btn"
                            onClick={() => openSellerDashboard(row.id)}
                          >
                            View dashboard
                          </button>
                        ) : row.access_request_status === 'pending' ? (
                          <span className="profile-muted">Pending approval</span>
                        ) : (
                          <button
                            type="button"
                            className="profile-btn profile-btn--secondary"
                            disabled={requestingId === row.id}
                            onClick={() => void onRequestAccess(row.id)}
                          >
                            {requestingId === row.id ? 'Requesting…' : 'Request access'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {!admin && !employee && (
          <section className="profile-card">
            <p className="profile-card__lead">Account settings for your role are available from the menu.</p>
            {user?.role === 'seller' && (
              <Link to="/account/password" className="profile-btn">
                Change password
              </Link>
            )}
          </section>
        )}
      </div>
    </AppShell>
  )
}
