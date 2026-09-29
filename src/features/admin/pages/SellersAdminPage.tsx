import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { AppShell } from '../../../layout/AppShell'
import {
  activateSeller,
  createSeller,
  deleteSeller,
  listSellers,
  suspendSeller,
} from '../api/adminApi'
import { useAdminApi } from '../hooks/useAdminApi'
import { useFormDraft } from '../hooks/useFormDraft'
import type { AdminUserRecord } from '../types'
import '../admin.css'

const SELLER_DRAFT_KEY = 'sympleone_draft_admin_seller'

export function SellersAdminPage() {
  const { withToken } = useAdminApi()
  const [rows, setRows] = useState<AdminUserRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft, clearDraft] = useFormDraft(SELLER_DRAFT_KEY, {
    fullName: '',
    email: '',
    password: '',
  })
  const { fullName, email, password } = draft

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await withToken(listSellers)
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sellers')
    }
  }, [withToken])

  useEffect(() => {
    void load()
  }, [load])

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

  return (
    <AppShell>
      <div className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Manage sellers</h1>
          <p className="admin-page__subtitle">
            Seller accounts see only their own products and services.
          </p>
        </div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

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

      <section className="admin-card">
        <h3>Sellers ({rows.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.full_name}</td>
                  <td>{row.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${row.status}`}>{row.status}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {row.status === 'active' ? (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => void withToken((t) => suspendSeller(t, row.id)).then(load)}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => void withToken((t) => activateSeller(t, row.id)).then(load)}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => {
                          if (confirm(`Delete ${row.email}?`)) {
                            void withToken((t) => deleteSeller(t, row.id)).then(load)
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}
