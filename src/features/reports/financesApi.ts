import { ApiError } from '../../api/httpClient'
import { loadStoredAuth } from '../auth/authStorage'
import { API_CONFIG } from '../../config/api.config'
import type { DashboardFilters } from '../dashboard/types/dashboard.types'
import { resolveSalesDateRange } from '../dashboard/utils/salesPeriodUtils'

const FINANCES_TIMEOUT_MS = 180_000

export interface FinanceTransaction {
  transactionId: string
  transactionType: string
  transactionStatus: string | null
  description: string | null
  postedDate: string
  amount: number
  currencyCode: string
  orderId: string | null
  settlementId: string | null
  shipmentId: string | null
  eventGroupId: string | null
}

export interface FinanceDailyPoint {
  date: string
  netAmount: number
  count: number
}

export interface FinanceTypeBreakdown {
  transactionType: string
  totalAmount: number
  count: number
}

export interface FinancesReportResponse {
  currencyCode: string
  dateFrom: string
  dateTo: string
  truncated: boolean
  transactions: FinanceTransaction[]
  dailySeries: FinanceDailyPoint[]
  byType: FinanceTypeBreakdown[]
}

function financesQuery(filters: DashboardFilters): string {
  const { dateFrom, dateTo } = resolveSalesDateRange(filters)
  const params = new URLSearchParams({
    marketplaceId: filters.marketplaceId || 'all',
    dateFrom,
    dateTo,
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return `?${params.toString()}`
}

function errorMessageFromBody(parsed: unknown, status: number): string {
  if (typeof parsed === 'object' && parsed !== null && 'detail' in parsed) {
    const detail = (parsed as { detail: unknown }).detail
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
  }
  return `Request failed (${status})`
}

export async function fetchFinancesReport(
  token: string,
  filters: DashboardFilters,
): Promise<FinancesReportResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.reports.finances}${financesQuery(filters)}`
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), FINANCES_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
    const text = await response.text()
    let parsed: unknown = null
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown
      } catch {
        parsed = text
      }
    }
    if (!response.ok) {
      throw new ApiError(errorMessageFromBody(parsed, response.status), response.status, parsed)
    }
    return parsed as FinancesReportResponse
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Finances request timed out. Try a shorter date range.')
    }
    throw err
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function fetchFinancesReportWithStoredAuth(
  filters: DashboardFilters,
): Promise<FinancesReportResponse> {
  const token = loadStoredAuth().accessToken
  if (!token) {
    throw new Error('Sign in again to view finances')
  }
  return fetchFinancesReport(token, filters)
}