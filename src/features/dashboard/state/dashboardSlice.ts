import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../../app/store'
import {
  fetchAlerts,
  fetchMarketplaces,
  fetchProfitability,
  fetchSalesTrend,
  fetchStatCards,
} from '../api/dashboardApi'
import type {
  AlertActionItem,
  DashboardFilters,
  DashboardModuleState,
  DashboardState,
  MarketplaceRow,
  ProfitabilityData,
  SalesTrendData,
  StatCardData,
} from '../types/dashboard.types'

function currentMonthRange(): Pick<DashboardFilters, 'dateFrom' | 'dateTo'> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const toIso = (d: Date) => d.toISOString().slice(0, 10)
  return { dateFrom: toIso(start), dateTo: toIso(end) }
}

const defaultFilters: DashboardFilters = {
  accountId: 'all',
  marketplaceId: 'A21TJRUUN4KGV',
  ...currentMonthRange(),
}

function emptyModule<T>(): DashboardModuleState<T> {
  return { data: null, status: 'idle', error: null, lastFetchedAt: null }
}

const initialState: DashboardState = {
  filters: defaultFilters,
  stats: emptyModule<StatCardData[]>(),
  salesTrend: emptyModule<SalesTrendData>(),
  profitability: emptyModule<ProfitabilityData>(),
  alerts: emptyModule<AlertActionItem[]>(),
  marketplaces: emptyModule<MarketplaceRow[]>(),
}

export const loadDashboard = createAsyncThunk(
  'dashboard/loadAll',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) {
      return rejectWithValue('Not authenticated')
    }
    const filters = state.dashboard.filters

    const emptySalesTrend: SalesTrendData = {
      frequency: 'Daily',
      currencySymbol: '₹',
      points: [],
    }

    const [statsR, salesR, profitabilityR, alertsR, marketplacesR] =
      await Promise.allSettled([
        fetchStatCards(token, filters),
        fetchSalesTrend(token, filters),
        fetchProfitability(token, filters),
        fetchAlerts(token, filters),
        fetchMarketplaces(token, filters),
      ])

    const salesTrendError =
      salesR.status === 'rejected'
        ? salesR.reason instanceof Error
          ? salesR.reason.message
          : 'Failed to load sales trend'
        : null

    return {
      stats: statsR.status === 'fulfilled' ? statsR.value : [],
      salesTrend:
        salesR.status === 'fulfilled' ? salesR.value : emptySalesTrend,
      salesTrendError,
      profitability:
        profitabilityR.status === 'fulfilled'
          ? profitabilityR.value
          : {
              centerLabel: 'Net Profit',
              centerValue: '—',
              segments: [],
              netProfit: { label: 'Net Profit', amount: '—', percent: 0 },
            },
      alerts: alertsR.status === 'fulfilled' ? alertsR.value : [],
      marketplaces:
        marketplacesR.status === 'fulfilled' ? marketplacesR.value : [],
    }
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<DashboardFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        const loading = { status: 'loading' as const, error: null }
        state.stats = { ...state.stats, ...loading }
        state.salesTrend = { ...state.salesTrend, ...loading }
        state.profitability = { ...state.profitability, ...loading }
        state.alerts = { ...state.alerts, ...loading }
        state.marketplaces = { ...state.marketplaces, ...loading }
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        const now = Date.now()
        const success = { status: 'success' as const, error: null, lastFetchedAt: now }
        state.stats = { data: action.payload.stats, ...success }
        state.salesTrend = {
          data: action.payload.salesTrend,
          status: 'success',
          error: action.payload.salesTrendError,
          lastFetchedAt: now,
        }
        state.profitability = { data: action.payload.profitability, ...success }
        state.alerts = { data: action.payload.alerts, ...success }
        state.marketplaces = { data: action.payload.marketplaces, ...success }
      })
      .addCase(loadDashboard.rejected, (state, action) => {
        const message =
          typeof action.payload === 'string'
            ? action.payload
            : 'Failed to load dashboard'
        const failed = { status: 'error' as const, error: message }
        state.stats = { ...state.stats, ...failed }
        state.salesTrend = { ...state.salesTrend, ...failed }
        state.profitability = { ...state.profitability, ...failed }
        state.alerts = { ...state.alerts, ...failed }
        state.marketplaces = { ...state.marketplaces, ...failed }
      })
  },
})

export const { setFilters } = dashboardSlice.actions
export default dashboardSlice.reducer
