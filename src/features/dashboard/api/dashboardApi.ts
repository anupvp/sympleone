import { apiRequest } from '../../../api/httpClient'
import { API_CONFIG } from '../../../config/api.config'
import {
  mockAlerts,
  mockMarketplaces,
  mockProfitability,
  mockSalesTrend,
  mockStatCards,
} from '../data/dashboard.mock'
import type {
  AlertActionItem,
  DashboardFilters,
  MarketplaceRow,
  ProfitabilityData,
  SalesTrendData,
  StatCardData,
} from '../types/dashboard.types'
import { normalizeSalesTrend } from '../utils/normalizeSalesTrend'

const forceMock = import.meta.env.VITE_USE_DASHBOARD_MOCK === 'true'
const fallbackMockInDev = import.meta.env.DEV

function filtersToQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams({
    accountId: filters.accountId,
    marketplaceId: filters.marketplaceId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  return `?${params.toString()}`
}

function dashboardPath(
  module: keyof typeof API_CONFIG.endpoints.dashboard,
  filters: DashboardFilters,
): string {
  const path = API_CONFIG.endpoints.dashboard[module]
  return `${path}${filtersToQuery(filters)}`
}

async function fetchWithMock<T>(
  module: keyof typeof API_CONFIG.endpoints.dashboard,
  token: string,
  filters: DashboardFilters,
  mock: T,
): Promise<T> {
  if (forceMock) {
    return mock
  }

  try {
    return await apiRequest<T>({
      method: 'GET',
      endpoint: dashboardPath(module, filters),
      token,
      rawPath: true,
    })
  } catch (err) {
    if (fallbackMockInDev && module !== 'salesTrend') {
      return mock
    }
    if (err instanceof Error) {
      throw err
    }
    throw new Error(`Failed to load dashboard.${module}`)
  }
}

export function fetchStatCards(token: string, filters: DashboardFilters) {
  return fetchWithMock<StatCardData[]>('stats', token, filters, mockStatCards)
}

export async function fetchSalesTrend(token: string, filters: DashboardFilters) {
  const data = await fetchWithMock<SalesTrendData>(
    'salesTrend',
    token,
    filters,
    mockSalesTrend,
  )
  return normalizeSalesTrend(data)
}

export function fetchProfitability(token: string, filters: DashboardFilters) {
  return fetchWithMock<ProfitabilityData>(
    'profitability',
    token,
    filters,
    mockProfitability,
  )
}

export function fetchAlerts(token: string, filters: DashboardFilters) {
  return fetchWithMock<AlertActionItem[]>(
    'alerts',
    token,
    filters,
    mockAlerts,
  )
}

export function fetchMarketplaces(token: string, filters: DashboardFilters) {
  return fetchWithMock<MarketplaceRow[]>(
    'marketplaces',
    token,
    filters,
    mockMarketplaces,
  )
}
