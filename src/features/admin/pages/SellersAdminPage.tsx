import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '../../../layout/AppShell'
import type { SearchableColumn } from '../../../components/SearchableTable'
import { SellersOverviewTabs } from '../components/SellersOverviewTabs'
import {
  activateSeller,
  assignSellerToEmployee,
  createSeller,
  deleteSeller,
  fetchSellersOverview,
  listEmployees,
  suspendSeller,
  updateSeller,
} from '../api/adminApi'
import { useAdminApi } from '../hooks/useAdminApi'
import { useFormDraft } from '../hooks/useFormDraft'
import type { AdminSellersOverview, EmployeeRecord, SellerRecord } from '../types'
import '../admin.css'

const SELLER_DRAFT_KEY = 'sympleone_draft_admin_seller'

export function SellersAdminPage() {
  const { withToken } = useAdminApi()
  const [overview, setOverview] = useState<AdminSellersOverview | null>(null)
  const [employees, setEmployees] = useState<EmployeeRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [assignFor, setAssignFor] = useState<string | null>(null)
  const [pickEmployeeId, setPickEmployeeId] = useState('')
  const [draft, setDraft, clearDraft] = useFormDraft(SELLER_DRAFT_KEY, {
    fullName: '',
    email: '',
    password: '',
  })
  const { fullName, email, password } = draft

  const load = useCallback(async () => {
    try {
      setError(null)
      const [data, employeeRows] = await Promise.all([
        withToken(fetchSellersOverview),
        withToken(listEmployees),
      ])
      setOverview(data)
      setEmployees(employeeRows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sellers')
    }
  }, [withToken])

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

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await withToken((t) => createSeller(t, { email, password, full_name: fullName }))
      clearDraft()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

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

      <section className="admin-card">
        <h3>Add seller</h3>
        <form className="admin-form" onSubmit={onCreate}>
          <label className="admin-field">
            Business / seller name
            <input
              value={fullName}
              onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
              required
              minLength={8}
            />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary">Create seller</button>
        </form>
      </section>

      {overview && (
        <section className="admin-card">
          <h3>Sellers</h3>
          <SellersOverviewTabs overview={overview} columns={columns} />
        </section>
      )}
    </AppShell>
  )
}
