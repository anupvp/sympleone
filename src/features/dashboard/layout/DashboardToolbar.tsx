import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { listSellers } from '../../admin/api/adminApi'
import type { SellerRecord } from '../../admin/types'
import {
  fetchEmployeeAssignedSellers,
  type EmployeeSellerRow,
} from '../../account/accountApi'
import { isAdminUser, isEmployeeUser, needsSellerDashboardContext } from '../../auth/auth.utils'
import { SalesTrendPeriodControl } from '../components/SalesTrendPeriodControl'
import { setFilters } from '../state/dashboardSlice'

export function DashboardToolbar() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.dashboard.filters)
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const needsSeller = needsSellerDashboardContext(user)
  const [sellers, setSellers] = useState<SellerRecord[]>([])
  const [employeeSellers, setEmployeeSellers] = useState<EmployeeSellerRow[]>([])
  const [sellerLoadError, setSellerLoadError] = useState<string | null>(null)
  const admin = isAdminUser(user)
  const employee = isEmployeeUser(user)

  const loadSellers = useCallback(async () => {
    if (!needsSeller || !token) {
      setSellers([])
      setEmployeeSellers([])
      return
    }
    try {
      setSellerLoadError(null)
      if (employee) {
        const rows = await fetchEmployeeAssignedSellers(token)
        setEmployeeSellers(rows)
        setSellers([])
        if (!filters.sellerId && rows.length === 1) {
          dispatch(setFilters({ sellerId: rows[0].id }))
        }
        return
      }
      if (admin) {
        const rows = await listSellers(token)
        setSellers(rows)
        setEmployeeSellers([])
        if (!filters.sellerId && rows.length === 1) {
          dispatch(setFilters({ sellerId: rows[0].id }))
        }
      }
    } catch (e) {
      setSellerLoadError(e instanceof Error ? e.message : 'Could not load sellers')
    }
  }, [needsSeller, token, filters.sellerId, dispatch, admin, employee])

  useEffect(() => {
    void loadSellers()
  }, [loadSellers])

  return (
    <div className="dash-toolbar">
      {needsSeller && (
        <select
          className="dash-select"
          value={filters.sellerId}
          onChange={(e) => dispatch(setFilters({ sellerId: e.target.value }))}
          aria-label="Seller account"
        >
          <option value="">All Sellers</option>
          {employee
            ? employeeSellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))
            : sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
        </select>
      )}
      {sellerLoadError && (
        <span className="dash-toolbar-hint" role="status">{sellerLoadError}</span>
      )}
      <select
        className="dash-select"
        value={filters.marketplaceId}
        onChange={(e) => dispatch(setFilters({ marketplaceId: e.target.value }))}
        aria-label="Marketplaces"
      >
        <option value="all">All Marketplaces</option>
      </select>
      <select className="dash-select" aria-label="Regions" defaultValue="all">
        <option value="all">All Regions</option>
      </select>
      <SalesTrendPeriodControl />
    </div>
  )
}
