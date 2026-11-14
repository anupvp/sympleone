import { loadStoredAuth } from '../../auth/authStorage'
import { ApiError } from '../../../api/httpClient'
import { API_CONFIG } from '../../../config/api.config'
import type { DashboardFilters } from '../types/dashboard.types'

const EXPORT_TIMEOUT_MS = 600_000

function filtersToQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams({
    accountId: filters.accountId,
    marketplaceId: filters.marketplaceId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  return `?${params.toString()}`
}

function filenameFromDisposition(header: string | null): string | null {
  if (!header) {
    return null
  }
  const match = /filename="([^"]+)"/i.exec(header)
  return match?.[1] ?? null
}

export async function downloadDashboardExportReport(filters: DashboardFilters): Promise<void> {
  const token = loadStoredAuth().accessToken
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dashboard.exportReport}${filtersToQuery(filters)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = { Accept: 'text/plain, application/octet-stream' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text()
      let parsed: unknown = text
      try {
        parsed = JSON.parse(text)
      } catch {
        /* plain text error */
      }
      throw new ApiError(
        typeof parsed === 'object' && parsed !== null && 'detail' in parsed
          ? String((parsed as { detail: unknown }).detail)
          : `Export failed (${response.status})`,
        response.status,
        parsed,
      )
    }

    const blob = await response.blob()
    const filename =
      filenameFromDisposition(response.headers.get('Content-Disposition')) ??
      `merchant-listings-${filters.dateFrom}-to-${filters.dateTo}.txt`

    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  } finally {
    clearTimeout(timeout)
  }
}