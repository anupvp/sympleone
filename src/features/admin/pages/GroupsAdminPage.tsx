import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { AppShell } from '../../../layout/AppShell'
import { createGroup, deleteGroup, listEmployees, listGroups, listSellers } from '../api/adminApi'
import { useAdminApi } from '../hooks/useAdminApi'
import { useFormDraft } from '../hooks/useFormDraft'
import type { AdminUserRecord, GroupRecord } from '../types'
import '../admin.css'

const GROUP_DRAFT_KEY = 'sympleone_draft_admin_group'

export function GroupsAdminPage() {
  const { withToken } = useAdminApi()
  const [groups, setGroups] = useState<GroupRecord[]>([])
  const [employees, setEmployees] = useState<AdminUserRecord[]>([])
  const [sellers, setSellers] = useState<AdminUserRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft, clearDraft] = useFormDraft(GROUP_DRAFT_KEY, {
    name: '',
    description: '',
    employeeIds: [] as string[],
    sellerIds: [] as string[],
  })
  const { name, description, employeeIds, sellerIds } = draft

  const load = useCallback(async () => {
    try {
      setError(null)
      const [g, e, s] = await Promise.all([
        withToken(listGroups),
        withToken(listEmployees),
        withToken(listSellers),
      ])
      setGroups(g)
      setEmployees(e)
      setSellers(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    }
  }, [withToken])

  useEffect(() => {
    void load()
  }, [load])

  const toggleId = (list: string[], id: string, checked: boolean) => {
    if (checked) return [...list, id]
    return list.filter((x) => x !== id)
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await withToken((t) =>
        createGroup(t, {
          name,
          description: description || undefined,
          employee_ids: employeeIds,
          seller_ids: sellerIds,
        }),
      )
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
          <h1 className="admin-page__title">Groups</h1>
          <p className="admin-page__subtitle">
            Bundle employees and sellers so staff inherit access to group sellers.
          </p>
        </div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <section className="admin-card">
        <h3>Create group</h3>
        <form onSubmit={onCreate}>
          <div className="admin-form">
            <label className="admin-field">
              Group name
              <input
                value={name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                required
              />
            </label>
            <label className="admin-field">
              Description
              <input
                value={description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </label>
          </div>
          <div className="admin-multi" style={{ marginTop: '1rem' }}>
            <div className="admin-field">
              Employees
              <div className="admin-checklist">
                {employees.map((emp) => (
                  <label key={emp.id}>
                    <input
                      type="checkbox"
                      checked={employeeIds.includes(emp.id)}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          employeeIds: toggleId(d.employeeIds, emp.id, e.target.checked),
                        }))
                      }
                    />
                    {emp.full_name} ({emp.email})
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-field">
              Sellers
              <div className="admin-checklist">
                {sellers.map((sel) => (
                  <label key={sel.id}>
                    <input
                      type="checkbox"
                      checked={sellerIds.includes(sel.id)}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          sellerIds: toggleId(d.sellerIds, sel.id, e.target.checked),
                        }))
                      }
                    />
                    {sel.full_name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            style={{ marginTop: '1rem' }}
          >
            Create group
          </button>
        </form>
      </section>

      <section className="admin-card">
        <h3>Groups ({groups.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Members</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <td>
                    <strong>{g.name}</strong>
                    {g.description && (
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{g.description}</div>
                    )}
                  </td>
                  <td>
                    {g.members.length === 0
                      ? '—'
                      : g.members.map((m) => `${m.full_name} (${m.member_kind})`).join(', ')}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      onClick={() => {
                        if (confirm(`Delete group "${g.name}"?`)) {
                          void withToken((t) => deleteGroup(t, g.id)).then(load)
                        }
                      }}
                    >
                      Delete
                    </button>
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
