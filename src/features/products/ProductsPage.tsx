import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppShell } from '../../layout/AppShell'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { needsSellerDashboardContext } from '../auth/auth.utils'
import { resolveSalesDateRange } from '../dashboard/utils/salesPeriodUtils'
import { OrdersContextFilters } from '../orders/OrdersContextFilters'
import '../orders/OrdersContextFilters.css'
import { fetchSellerMarketplaceContext } from '../amazon/sellerMarketplaceApi'
import { setFilters } from '../dashboard/state/dashboardSlice'
import {
  fetchProducts,
  type ListingStatusTab,
  type ProductListingRow,
  type ProductSummary,
} from './productsApi'
import '../orders/OrdersPage.css'
import './ProductsPage.css'

const STATUS_TABS: { id: ListingStatusTab; label: string; summaryKey?: keyof ProductSummary }[] = [
  { id: 'all', label: 'All products' },
  { id: 'active', label: 'Active', summaryKey: 'active' },
  { id: 'inactive', label: 'Inactive', summaryKey: 'inactive' },
  { id: 'out_of_stock', label: 'Out of stock', summaryKey: 'out_of_stock' },
  { id: 'draft', label: 'Draft', summaryKey: 'draft' },
]

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of stock',
  draft: 'Draft',
  suppressed: 'Suppressed',
}

const EMPTY_SUMMARY: ProductSummary = {
  total: 0,
  active: 0,
  inactive: 0,
  out_of_stock: 0,
  draft: 0,
  suppressed: 0,
}

function formatMoney(amount: string | null, currency: string) {
  if (!amount) {
    return '—'
  }
  const value = Number.parseFloat(amount)
  const sym = currency === 'INR' ? '₹' : `${currency} `
  const formatted = Number.isFinite(value)
    ? value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount
  return `${sym}${formatted}`
}

function formatUpdated(iso: string | null) {
  if (!iso) {
    return '—'
  }
  try {
    const date = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) {
      return 'Updated today'
    }
    if (diffDays === 1) {
      return 'Updated yesterday'
    }
    return `Updated ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
  } catch {
    return '—'
  }
}

function matchesSearch(row: ProductListingRow, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) {
    return true
  }
  return (
    row.title.toLowerCase().includes(needle) ||
    (row.asin ?? '').toLowerCase().includes(needle) ||
    row.sku.toLowerCase().includes(needle) ||
    row.category.toLowerCase().includes(needle)
  )
}

export function ProductsPage() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)
  const filters = useAppSelector((s) => s.dashboard.filters)
  const globalSearch = useAppSelector((s) => s.layout.globalSearchQuery)
  const needsSeller = needsSellerDashboardContext(user)

  const [products, setProducts] = useState<ProductListingRow[]>([])
  const [summary, setSummary] = useState<ProductSummary>(EMPTY_SUMMARY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusTab, setStatusTab] = useState<ListingStatusTab>('all')
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'all' | 'FBA' | 'FBM'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [localSearch, setLocalSearch] = useState('')

  const load = useCallback(async () => {
    if (!token) {
      return
    }
    if (needsSeller && !filters.sellerId?.trim()) {
      setProducts([])
      setSummary(EMPTY_SUMMARY)
      setError('Select a seller account to load products.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const marketplaceCtx = await fetchSellerMarketplaceContext(token, filters)
      const activeFilters =
        marketplaceCtx.marketplace_id !== filters.marketplaceId
          ? { ...filters, marketplaceId: marketplaceCtx.marketplace_id }
          : filters
      if (marketplaceCtx.marketplace_id !== filters.marketplaceId) {
        dispatch(setFilters({ marketplaceId: marketplaceCtx.marketplace_id }))
      }
      const data = await fetchProducts(token, activeFilters)
      setProducts(data.products)
      setSummary(data.summary)
    } catch (e) {
      setProducts([])
      setSummary(EMPTY_SUMMARY)
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [token, filters, dispatch, needsSeller])

  useEffect(() => {
    void load()
  }, [load])

  const searchQuery = localSearch.trim() ? localSearch : globalSearch

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const row of products) {
      if (row.category) {
        set.add(row.category)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const visibleRows = useMemo(() => {
    return products.filter((row) => {
      if (statusTab !== 'all' && row.listing_status !== statusTab) {
        return false
      }
      if (fulfillmentFilter !== 'all' && row.fulfillment_type !== fulfillmentFilter) {
        return false
      }
      if (categoryFilter !== 'all' && row.category !== categoryFilter) {
        return false
      }
      return matchesSearch(row, searchQuery)
    })
  }, [products, statusTab, fulfillmentFilter, categoryFilter, searchQuery])

  const tabCounts = useMemo(() => {
    const base = { all: products.length } as Record<ListingStatusTab, number>
    for (const tab of STATUS_TABS) {
      if (tab.id === 'all') {
        continue
      }
      base[tab.id] = products.filter((row) => row.listing_status === tab.id).length
    }
    return base
  }, [products])

  const { dateFrom, dateTo } = resolveSalesDateRange(filters)
  const periodLabel =
    dateFrom && dateTo
      ? `${new Date(dateFrom).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} – ${new Date(dateTo).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}`
      : ''

  const resetFilters = () => {
    setStatusTab('all')
    setFulfillmentFilter('all')
    setCategoryFilter('all')
    setLocalSearch('')
  }

  return (
    <AppShell>
      <div className="products-page">
        <header className="products-page__head">
          <div className="orders-page__head-main">
            <h1>Products</h1>
            <p className="products-page__meta">
              Manage products & listings from Amazon
              {periodLabel ? ` · ${periodLabel}` : ''}
            </p>
          </div>
          <OrdersContextFilters />
        </header>

        {error && (
          <p className="products-page__error" role="alert">
            {error}
          </p>
        )}

        <div className="products-kpi-row" aria-busy={loading}>
          <article className="products-kpi">
            <p className="products-kpi__label">Total products</p>
            <p className="products-kpi__value">{loading ? '…' : summary.total.toLocaleString('en-IN')}</p>
            <p className="products-kpi__hint">Across connected seller accounts</p>
          </article>
          <article className="products-kpi">
            <p className="products-kpi__label">Active listings</p>
            <p className="products-kpi__value">{loading ? '…' : summary.active.toLocaleString('en-IN')}</p>
            <p className="products-kpi__hint">Buyable with available stock</p>
          </article>
          <article className="products-kpi">
            <p className="products-kpi__label">Out of stock</p>
            <p className="products-kpi__value">{loading ? '…' : summary.out_of_stock.toLocaleString('en-IN')}</p>
            <p className="products-kpi__hint">Requires replenishment</p>
          </article>
          <article className="products-kpi">
            <p className="products-kpi__label">Draft listings</p>
            <p className="products-kpi__value">{loading ? '…' : summary.draft.toLocaleString('en-IN')}</p>
            <p className="products-kpi__hint">Pending completion</p>
          </article>
          <article className="products-kpi">
            <p className="products-kpi__label">Suppressed</p>
            <p className="products-kpi__value">{loading ? '…' : summary.suppressed.toLocaleString('en-IN')}</p>
            <p className="products-kpi__hint">Review listing issues</p>
          </article>
        </div>

        <div className="products-panel">
          <div className="products-panel__head">
            <div>
              <h2 className="products-panel__title">Manage products & listings</h2>
              <p className="products-panel__sub">Search, filter and update your catalog listings.</p>
            </div>
            <button type="button" className="products-panel__create" disabled title="Coming soon">
              + Create listing
            </button>
          </div>

          <div className="products-status-tabs" role="tablist" aria-label="Listing status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={statusTab === tab.id}
                className={`products-pill${statusTab === tab.id ? ' products-pill--active' : ''}`}
                onClick={() => setStatusTab(tab.id)}
              >
                {tab.label}
                <span className="products-pill__count">{tabCounts[tab.id].toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>

          <div className="products-search-row">
            <input
              type="search"
              className="products-search"
              placeholder="Search title, ASIN, SKU or product ID…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              aria-label="Search products"
            />
            <select
              className="products-select"
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value as 'all' | 'FBA' | 'FBM')}
              aria-label="Fulfillment filter"
            >
              <option value="all">All fulfillment</option>
              <option value="FBA">Amazon FBA</option>
              <option value="FBM">Merchant FBM</option>
            </select>
            <select
              className="products-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Category filter"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button type="button" className="products-reset" onClick={resetFilters}>
              Reset
            </button>
            <button type="button" className="products-reset" onClick={() => void load()} disabled={loading}>
              Refresh
            </button>
          </div>

          <div className="products-table-wrap" aria-busy={loading}>
            <table className="products-table">
              <thead>
                <tr>
                  <th className="orders-table__check-col" aria-label="Select" />
                  <th>Product</th>
                  <th>Product IDs</th>
                  <th>Listing Status</th>
                  <th>Fulfilled By</th>
                  <th>Inventory</th>
                  <th>Price</th>
                  <th>Shipping</th>
                  <th>Est. Fees</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10}>
                      <span className="products-page__meta">Loading catalog from Amazon…</span>
                    </td>
                  </tr>
                ) : visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <span className="products-page__meta">No products match these filters.</span>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => {
                    const perf = row.performance_percent
                    const perfPositive = perf !== null && perf !== undefined && perf >= 0
                    const statusClass = `products-status-pill products-status-pill--${row.listing_status}`
                    return (
                      <tr key={`${row.sku}-${row.asin ?? ''}`}>
                        <td>
                          <input type="checkbox" className="orders-table__check" aria-label={`Select ${row.sku}`} />
                        </td>
                        <td>
                          <div className="products-product-cell">
                            {row.image_url ? (
                              <img className="products-product-thumb" src={row.image_url} alt="" />
                            ) : (
                              <span className="products-product-thumb products-product-thumb--placeholder">IMG</span>
                            )}
                            <div>
                              <p className="products-product-name">{row.title}</p>
                              <p className="products-product-meta">
                                {row.category} · {formatUpdated(row.updated_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="products-ids">
                            <span>ASIN: {row.asin ?? '—'}</span>
                            <span>SKU: {row.sku}</span>
                          </div>
                        </td>
                        <td>
                          <span className={statusClass}>{STATUS_LABEL[row.listing_status] ?? row.listing_status}</span>
                        </td>
                        <td>
                          <span
                            className={
                              row.fulfillment_type === 'FBA'
                                ? 'orders-type-badge orders-type-badge--fba'
                                : 'orders-type-badge orders-type-badge--fbm'
                            }
                          >
                            {row.fulfillment_label}
                          </span>
                        </td>
                        <td>
                          <div className="products-inventory">
                            <strong>{row.inventory_available.toLocaleString('en-IN')}</strong>
                            <span>{row.inventory_label}</span>
                          </div>
                        </td>
                        <td>{formatMoney(row.price_amount, row.price_currency)}</td>
                        <td>{row.shipping_amount ? formatMoney(row.shipping_amount, row.price_currency) : '—'}</td>
                        <td>
                          {row.estimated_fees_amount
                            ? formatMoney(row.estimated_fees_amount, row.price_currency)
                            : '—'}
                        </td>
                        <td>
                          {perf === null || perf === undefined ? (
                            '—'
                          ) : (
                            <span className={`products-perf${perfPositive ? ' is-up' : ' is-down'}`}>
                              {perfPositive ? '↑' : '↓'} {Math.abs(perf).toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}