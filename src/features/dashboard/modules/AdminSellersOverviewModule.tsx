import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SearchableColumn } from '../../../components/SearchableTable'
import '../../../components/searchable-table.css'
import { fetchSellersOverview } from '../../admin/api/adminApi'
import { SellersOverviewTabs } from '../../admin/components/SellersOverviewTabs'
import type { AdminSellersOverview, SellerRecord } from '../../admin/types'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { isAdminUser } from '../../auth/auth.utils'
import { setFilters } from '../state/dashboardSlice'

export function AdminSellersOverviewModule() {
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.accessToken)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminSellersOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token || !isAdminUser(user)) {
      return
    }
    try {
      setError(null)
      setOverview(await fetchSellersOverview(token))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sellers')
    }
  }, [token, user])

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
        render: (r) => r.status,
      },
      {
        key: 'paid',
        header: 'Paid',
        searchText: (r) => (r.is_paid ? 'paid' : 'unpaid'),
        render: (r) => (r.is_paid ? 'Yes' : 'No'),
      },
      {
        key: 'assigned',
        header: 'Assigned',
        searchText: (r) => (r.is_assigned ? 'yes' : 'no'),
        render: (r) => (r.is_assigned ? 'Yes' : 'No'),
      },
    ]
  }, [])

  if (!isAdminUser(user)) {
    return null
  }

  if (error) {
    return (
      <section className="dash-admin-sellers">
        <p className="dash-admin-sellers__error" role="alert">{error}</p>
      </section>
    )
  }

  if (!overview) {
    return null
  }

  return (
    <section className="dash-admin-sellers">
      <div className="dash-admin-sellers__head">
        <h2 className="dash-admin-sellers__title">Sellers overview</h2>
        <button
          type="button"
          className="dash-admin-sellers__link"
          onClick={() => navigate('/admin/sellers')}
        >
          Manage sellers
        </button>
      </div>
      <SellersOverviewTabs
        overview={overview}
        columns={columns}
        rowActionLabel="View dashboard"
        onRowAction={(seller) => {
          dispatch(setFilters({ sellerId: seller.id }))
          document.querySelector('.dash-charts-row')?.scrollIntoView({ behavior: 'smooth' })
        }}
      />
    </section>
  )
}
