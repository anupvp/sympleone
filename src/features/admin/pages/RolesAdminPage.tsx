import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { AppShell } from '../../../layout/AppShell'
import {
  createRole,
  deleteRole,
  listPolicies,
  listRoles,
  updateRole,
} from '../api/adminApi'
import { useAdminApi } from '../hooks/useAdminApi'
import { clearFormDraft, useFormDraft } from '../hooks/useFormDraft'
import type { PolicyRecord, RoleRecord } from '../types'
import '../admin.css'

const ROLE_DRAFT_KEY = 'sympleone_draft_admin_role'

function toggleId(list: string[], id: string, checked: boolean): string[] {
  if (checked) return [...list, id]
  return list.filter((x) => x !== id)
}

export function RolesAdminPage() {
  const { withToken } = useAdminApi()
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [policies, setPolicies] = useState<PolicyRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft, clearDraft] = useFormDraft(ROLE_DRAFT_KEY, {
    name: '',
    description: '',
    policyIds: [] as string[],
  })
  const { name, description, policyIds } = draft
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [r, p] = await Promise.all([
        withToken(listRoles),
        withToken(listPolicies),
      ])
      setRoles(r)
      setPolicies(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load roles')
    }
  }, [withToken])

  useEffect(() => {
    void load()
  }, [load])

  const resetForm = () => {
    clearDraft()
    setEditingId(null)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await withToken((t) =>
          updateRole(t, editingId, {
            name,
            description: description || undefined,
            policy_ids: policyIds,
          }),
        )
      } else {
        await withToken((t) =>
          createRole(t, {
            name,
            description: description || undefined,
            policy_ids: policyIds,
          }),
        )
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  const startEdit = (role: RoleRecord) => {
    clearFormDraft(ROLE_DRAFT_KEY)
    setEditingId(role.id)
    setDraft({
      name: role.name,
      description: role.description ?? '',
      policyIds: role.policy_ids,
    })
  }

  const policyLabel = (id: string) => {
    const p = policies.find((x) => x.id === id)
    return p ? p.code : id
  }

  return (
    <AppShell>
      <div className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Roles & policies</h1>
          <p className="admin-page__subtitle">
            Define roles and attach policies. Assign roles to employees when you create or edit them.
          </p>
        </div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <section className="admin-card">
        <h3>{editingId ? 'Edit role' : 'Create role'}</h3>
        <form onSubmit={onSubmit}>
          <div className="admin-form">
            <label className="admin-field">
              Role name
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
          <div className="admin-field" style={{ marginTop: '1rem' }}>
            Policies
            <div className="admin-checklist">
              {policies.map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={policyIds.includes(p.id)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        policyIds: toggleId(d.policyIds, p.id, e.target.checked),
                      }))
                    }
                  />
                  <span>
                    <strong>{p.code}</strong>
                    {p.description ? ` — ${p.description}` : ''}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="admin-actions" style={{ marginTop: '1rem' }}>
            <button type="submit" className="admin-btn admin-btn--primary">
              {editingId ? 'Save changes' : 'Create role'}
            </button>
            {editingId && (
              <button type="button" className="admin-btn" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-card">
        <h3>Roles ({roles.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Policies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.description ?? '—'}</td>
                  <td>
                    {role.policy_ids.length === 0
                      ? '—'
                      : role.policy_ids.map(policyLabel).join(', ')}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn" onClick={() => startEdit(role)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => {
                          if (confirm(`Delete role "${role.name}"?`)) {
                            void withToken((t) => deleteRole(t, role.id)).then(load)
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
