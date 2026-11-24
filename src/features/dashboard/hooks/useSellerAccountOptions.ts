import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { listSellers } from '../../admin/api/adminApi'
import type { SellerRecord } from '../../admin/types'
import { fetchEmployeeAssignedSellers, type EmployeeSellerRow } from '../../account/accountApi'
import { isAdminUser, isEmployeeUser, needsSellerDashboardContext } from '../../auth/auth.utils'
import { setFilters } from '../state/dashboardSlice'

export function useSellerAccountOptions(onLoaded?: () => void) {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.dashboard.filters)
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const needsSeller = needsSellerDashboardContext(user)
  const admin = isAdminUser(user)
  const employee = isEmployeeUser(user)

  const [sellers, setSellers] = useState<SellerRecord[]>([])
  const [employeeSellers, setEmployeeSellers] = useState<EmployeeSellerRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!needsSeller || !token) {
      setSellers([])
      setEmployeeSellers([])
      onLoaded?.()
      return
    }
    try {
      setError(null)
      if (employee) {
        const rows = await fetchEmployeeAssignedSellers(token)
        setEmployeeSellers(rows)
        setSellers([])
        if (!filters.sellerId && rows.length > 0) {
          dispatch(setFilters({ sellerId: rows[0].id }))
        }
        onLoaded?.()
        return
      }
      if (admin) {
        const rows = await listSellers(token)
        setSellers(rows)
        setEmployeeSellers([])
        if (!filters.sellerId && rows.length === 1) {
          dispatch(setFilters({ sellerId: rows[0].id }))
        }
        onLoaded?.()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load sellers')
      onLoaded?.()
    }
  }, [needsSeller, token, filters.sellerId, dispatch, admin, employee, onLoaded])

  useEffect(() => {
    void load()
  }, [load])

  const options = employee
    ? employeeSellers.map((s) => ({ id: s.id, label: s.full_name }))
    : sellers.map((s) => ({ id: s.id, label: s.full_name }))

  const selectedLabel =
    options.find((o) => o.id === filters.sellerId)?.label ?? 'Select seller account'

  return {
    needsSeller,
    options,
    selectedId: filters.sellerId,
    selectedLabel,
    error,
    setSellerId: (sellerId: string) => dispatch(setFilters({ sellerId })),
  }
}