import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '../../../layout/AppShell'
import type { SearchableColumn } from '../../../components/SearchableTable'
import { SellersOverviewTabs } from '../components/SellersOverviewTabs'
import {
  activateSeller,
  assignSellerToEmployee,
  deleteSeller,
  fetchSellersOverview,
  listEmployees,
  suspendSeller,
  updateSeller,
} from '../api/adminApi'
import {
  approveSellerAccessRequest,
  listSellerAccessRequests,
  rejectSellerAccessRequest,
  type SellerAccessRequest,
} from '../../account/accountApi'
import { useAppSelector } from '../../../app/hooks'
import { useAdminApi } from '../hooks/useAdminApi'
import type { AdminSellersOverview, EmployeeRecord, SellerRecord } from '../types'
import '../admin.css'

export function SellersAdminPage() {
  const { withToken } = useAdminApi()
  const token = useAppSelector((s) => s.auth.accessToken)
  const [overview, setOverview] = useState<AdminSellersOverview | null>(null)
  const [accessRequests, setAccessRequests] = useState<SellerAccessRequest[]>([])
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [assignFor, setAssignFor] = useState<string | null>(null)
  const [pickEmployeeId, setPickEmployeeId] = useState('')

  const load = useCallback(async () => {
    try {
      setError(null)
      const [data, employeeRows, requests] = await Promise.all([
        withToken(fetchSellersOverview),
        withToken(listEmployees),
        token ? listSellerAccessRequests(token) : Promise.resolve([]),
      ])
      setOverview(data)
      setEmployees(employeeRows)
      setAccessRequests(requests)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sellers')
    }
  }, [withToken, token])

  const resolveRequest = async (requestId: string, action: 'approve' | 'reject') => {
    if (!token) {
      return
    }
    try {
      if (action === 'approve') {
        await approveSellerAccessRequest(token, requestId)
      } else {
        await rejectSellerAccessRequest(token, requestId)
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update request')
    }
  }

  useEffect(() => {
    void load()
  }, [load])

  const columns = useMemo((): SearchableColumn<SellerRecord>[] => {
    return [
      {
        key: 'name',
        header: 'Name',
        searchText: (r) => r.full_name,
        render: (r) => r.full_name,
      },
      {
        key: 'email',
        header: 'Email',
        searchText: (r) => r.email,
        render: (r) => r.email,
      },
      {
        key: 'status',
        header: 'Status',
        searchText: (r) => r.status,
        render: (r) => (
          <span className={`admin-badge admin-badge--${r.status}`}>{r.status}</span>
        ),
      },
      {
        key: 'paid',
        header: 'Paid',
        searchText: (r) => (r.is_paid ? 'paid' : 'unpaid'),
        render: (r) => (
          <label className="admin-inline-check">
            <input
              type="checkbox"
              checked={r.is_paid}
              onChange={() =>
                void withToken((t) => updateSeller(t, r.id, { is_paid: !r.is_paid })).then(load)
              }
            />
            {r.is_paid ? 'Yes' : 'No'}
          </label>
        ),
      },
      {
        key: 'assigned',
        header: 'Assigned to',
        searchText: (r) => r.assigned_employees.join(' '),
        render: (r) =>
          r.assigned_employees.length > 0 ? r.assigned_employees.join(', ') : '—',
      },
      {
        key: 'actions',
        header: 'Actions',
        searchText: () => '',
        render: (r) => (
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn"
              onClick={() => {
                setAssignFor(r.id)
                setPickEmployeeId('')
              }}
            >
              Assign employee
            </button>
            {r.status === 'active' ? (
              <button
                type="button"
                className="admin-btn"
                onClick={() => void withToken((t) => suspendSeller(t, r.id)).then(load)}
              >
                Suspend
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn"
                onClick={() => void withToken((t) => activateSeller(t, r.id)).then(load)}
              >
                Activate
              </button>
            )}
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={() => {
                if (confirm(`Delete ${r.email}?`)) {
                  void withToken((t) => deleteSeller(t, r.id)).then(load)
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ]
  }, [load, withToken])

  const onAssign = async () => {
    if (!assignFor || !pickEmployeeId) {
      return
    }
    try {
      await withToken((t) => assignSellerToEmployee(t, assignFor, pickEmployeeId))
      setAssignFor(null)
      setPickEmployeeId('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed')
    }
  }

  return (
    <AppShell>
      <div className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Seller dashboard</h1>
          <p className="admin-page__subtitle">
            {overview
              ? `${overview.counts.total} sellers — filter by assignment or payment status.`
              : 'Loading sellers…'}
          </p>
        </div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      {accessRequests.length > 0 && (
        <section className="admin-card admin-card--highlight">
          <h3>Seller access requests</h3>
          <p className="admin-page__subtitle">
            Employees requesting dashboard access to a seller account.
          </p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Seller</th>
                <th>Requested by</th>
                <th>Requested</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {accessRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.seller_name}</td>
                  <td>{req.employee_name}</td>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--primary"
                        onClick={() => void resolveRequest(req.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => void resolveRequest(req.id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {assignFor && (
        <section className="admin-card admin-card--highlight">
          <h3>Assign seller to employee</h3>
          <div className="admin-form admin-form--inline">
            <label className="admin-field">
              Employee
              <select
                value={pickEmployeeId}
                onChange={(e) => setPickEmployeeId(e.target.value)}
              >
                <option value="">Select employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.email})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={!pickEmployeeId}
              onClick={() => void onAssign()}
            >
              Assign
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => setAssignFor(null)}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {overview && (
        <section className="admin-card">
          <h3>Sellers</h3>
          <SellersOverviewTabs overview={overview} columns={columns} />
        </section>
      )}
    </AppShell>
  )
}
