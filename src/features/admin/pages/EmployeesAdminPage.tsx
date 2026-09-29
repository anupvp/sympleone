import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '../../../layout/AppShell'
import { AssignedSellerTags } from '../components/AssignedSellerTags'
import {
  activateEmployee,
  assignSellersToEmployee,
  createEmployee,
  deleteEmployee,
  listEmployees,
  listRoles,
  listSellers,
  removeSellerFromEmployee,
  suspendEmployee,
  updateEmployeeRoles,
} from '../api/adminApi'
import { useAdminApi } from '../hooks/useAdminApi'
import { useFormDraft } from '../hooks/useFormDraft'
import type { AccountStatus, AdminUserRecord, AssignedSeller, EmployeeRecord, RoleRecord } from '../types'
import '../admin.css'

const EMPLOYEE_DRAFT_KEY = 'sympleone_draft_admin_employee'

function toggleId(list: string[], id: string, checked: boolean): string[] {
  if (checked) return [...list, id]
  return list.filter((x) => x !== id)
}

function mergeAssignedSellerStatus(
  assigned: AssignedSeller[],
  catalog: AdminUserRecord[],
): AssignedSeller[] {
  const statusById = new Map(catalog.map((s) => [s.id, s.status]))
  return assigned.map((seller) => {
    const fromApi = seller.status as AccountStatus | undefined
    if (fromApi === 'deleted' || fromApi === 'suspended') {
      return { ...seller, status: fromApi }
    }
    const fromCatalog = statusById.get(seller.id)
    return {
      ...seller,
      status: fromCatalog ?? fromApi ?? 'active',
    }
  })
}

export function EmployeesAdminPage() {
  const { withToken } = useAdminApi()
  const [rows, setRows] = useState<EmployeeRecord[]>([])
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [allSellers, setAllSellers] = useState<AdminUserRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft, clearDraft] = useFormDraft(EMPLOYEE_DRAFT_KEY, {
    fullName: '',
    email: '',
    password: '',
    roleIds: [] as string[],
    sellerIds: [] as string[],
  })
  const { fullName, email, password, roleIds, sellerIds } = draft
  const [editingRolesFor, setEditingRolesFor] = useState<string | null>(null)
  const [editRoleIds, setEditRoleIds] = useState<string[]>([])
  const [assignSellerFor, setAssignSellerFor] = useState<string | null>(null)
  const [pickSellerId, setPickSellerId] = useState('')

  const roleNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of roles) {
      map.set(r.id, r.name)
    }
    return map
  }, [roles])

  const draftSellerSummaries = useMemo(
    () =>
      sellerIds
        .map((id) => allSellers.find((s) => s.id === id))
        .filter(Boolean)
        .map((s) => ({
          id: s!.id,
          full_name: s!.full_name,
          email: s!.email,
          status: s!.status,
        })),
    [sellerIds, allSellers],
  )

  const load = useCallback(async () => {
    try {
      setError(null)
      const [employees, roleList, sellers] = await Promise.all([
        withToken(listEmployees),
        withToken(listRoles),
        withToken(listSellers),
      ])
      setAllSellers(sellers)
      setRows(
        employees.map((emp) => ({
          ...emp,
          assigned_sellers: mergeAssignedSellerStatus(emp.assigned_sellers, sellers),
        })),
      )
      setRoles(roleList)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load employees')
    }
  }, [withToken])

  useEffect(() => {
    void load()
  }, [load])

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await withToken((t) =>
        createEmployee(t, {
          email,
          password,
          full_name: fullName,
          role_ids: roleIds,
          seller_ids: sellerIds,
        }),
      )
      clearDraft()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  const formatRoles = (ids: string[]) => {
    if (!ids.length) return '—'
    return ids.map((id) => roleNameById.get(id) ?? id).join(', ')
  }

  const saveEmployeeRoles = async (employeeId: string) => {
    try {
      await withToken((t) => updateEmployeeRoles(t, employeeId, editRoleIds))
      setEditingRolesFor(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles')
    }
  }

  const removeSeller = async (employeeId: string, sellerId: string) => {
    try {
      await withToken((t) => removeSellerFromEmployee(t, employeeId, sellerId))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove seller')
    }
  }

  const addSellerToEmployee = async (employeeId: string) => {
    if (!pickSellerId) return
    try {
      await withToken((t) => assignSellersToEmployee(t, employeeId, [pickSellerId]))
      setPickSellerId('')
      setAssignSellerFor(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign seller')
    }
  }

  const sellersAvailableFor = (employee: EmployeeRecord) => {
    const assigned = new Set(employee.assigned_sellers.map((s) => s.id))
    return allSellers.filter((s) => !assigned.has(s.id))
  }

  const sellersAvailableForDraft = () => {
    const assigned = new Set(sellerIds)
    return allSellers.filter((s) => !assigned.has(s.id))
  }

  return (
    <AppShell>
      <div className="admin-page__head">
        <div>
          <h1 className="admin-page__title">Manage employees</h1>
          <p className="admin-page__subtitle">
            Create staff accounts, assign roles and sellers, suspend access, and remove users.
          </p>
        </div>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <section className="admin-card">
        <h3>Add employee</h3>
        <form onSubmit={onCreate}>
          <div className="admin-form">
            <label className="admin-field">
              Full name
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
          </div>
          <div className="admin-field" style={{ marginTop: '1rem' }}>
            Roles
            {roles.length === 0 ? (
              <p className="admin-page__subtitle" style={{ margin: '0.5rem 0 0' }}>
                No roles yet. Create roles under the <strong>Roles</strong> tab first.
              </p>
            ) : (
              <div className="admin-checklist">
                {roles.map((role) => (
                  <label key={role.id}>
                    <input
                      type="checkbox"
                      checked={roleIds.includes(role.id)}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          roleIds: toggleId(d.roleIds, role.id, e.target.checked),
                        }))
                      }
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="admin-field" style={{ marginTop: '1rem' }}>
            Assigned sellers
            <AssignedSellerTags
              sellers={draftSellerSummaries}
              onRemove={(id) =>
                setDraft((d) => ({
                  ...d,
                  sellerIds: d.sellerIds.filter((sid) => sid !== id),
                }))
              }
            />
            {allSellers.length > 0 && (
              <div className="admin-assign-row">
                <select
                  value=""
                  onChange={(e) => {
                    const id = e.target.value
                    if (id) {
                      setDraft((d) => ({
                        ...d,
                        sellerIds: d.sellerIds.includes(id)
                          ? d.sellerIds
                          : [...d.sellerIds, id],
                      }))
                    }
                  }}
                  aria-label="Add seller to new employee"
                >
                  <option value="">Add seller…</option>
                  {sellersAvailableForDraft().map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            style={{ marginTop: '1rem' }}
          >
            Create employee
          </button>
        </form>
      </section>

      <section className="admin-card">
        <h3>Employees ({rows.length})</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Sellers</th>
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
                    {editingRolesFor === row.id ? (
                      <div className="admin-checklist" style={{ maxHeight: 120 }}>
                        {roles.map((role) => (
                          <label key={role.id}>
                            <input
                              type="checkbox"
                              checked={editRoleIds.includes(role.id)}
                              onChange={(e) =>
                                setEditRoleIds(toggleId(editRoleIds, role.id, e.target.checked))
                              }
                            />
                            {role.name}
                          </label>
                        ))}
                        <div className="admin-actions" style={{ marginTop: '0.35rem' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn--primary"
                            onClick={() => void saveEmployeeRoles(row.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => setEditingRolesFor(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {formatRoles(row.role_ids)}
                        <button
                          type="button"
                          className="admin-btn"
                          style={{ marginLeft: '0.5rem' }}
                          onClick={() => {
                            setEditingRolesFor(row.id)
                            setEditRoleIds(row.role_ids)
                          }}
                        >
                          Edit roles
                        </button>
                      </>
                    )}
                  </td>
                  <td>
                    <AssignedSellerTags
                      sellers={row.assigned_sellers}
                      onRemove={(sellerId) => void removeSeller(row.id, sellerId)}
                    />
                    {assignSellerFor === row.id ? (
                      <div className="admin-assign-row">
                        <select
                          value={pickSellerId}
                          onChange={(e) => setPickSellerId(e.target.value)}
                          aria-label="Select seller to assign"
                        >
                          <option value="">Select seller…</option>
                          {sellersAvailableFor(row).map((s) => (
                            <option key={s.id} value={s.id}>{s.full_name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="admin-btn admin-btn--primary"
                          disabled={!pickSellerId}
                          onClick={() => void addSellerToEmployee(row.id)}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => {
                            setAssignSellerFor(null)
                            setPickSellerId('')
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn"
                        style={{ marginTop: '0.35rem' }}
                        onClick={() => {
                          setAssignSellerFor(row.id)
                          setPickSellerId('')
                        }}
                      >
                        Assign seller
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${row.status}`}>{row.status}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {row.status === 'active' ? (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => void withToken((t) => suspendEmployee(t, row.id)).then(load)}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => void withToken((t) => activateEmployee(t, row.id)).then(load)}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={() => {
                          if (confirm(`Delete ${row.email}?`)) {
                            void withToken((t) => deleteEmployee(t, row.id)).then(load)
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
