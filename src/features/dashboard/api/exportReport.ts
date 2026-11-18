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

function errorMessageFromBody(parsed: unknown, status: number): string {
  if (typeof parsed === 'object' && parsed !== null && 'detail' in parsed) {
    const detail = (parsed as { detail: unknown }).detail
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
    if (Array.isArray(detail)) {
      return detail
        .map((row) => {
          if (typeof row === 'object' && row !== null && 'msg' in row) {
            return String((row as { msg: unknown }).msg)
          }
          return JSON.stringify(row)
        })
        .join('; ')
    }
  }
  if (typeof parsed === 'object' && parsed !== null && 'reportId' in parsed) {
    return 'Report was created on Amazon but download did not complete. Redeploy the latest backend and try again.'
  }
  if (typeof parsed === 'string' && parsed.trim()) {
    const trimmed = parsed.trim()
    if (trimmed.includes('reportId')) {
      return 'Report was created on Amazon but download did not complete. Redeploy the latest backend and try again.'
    }
    return trimmed.slice(0, 280)
  }
  return `Export failed (${status})`
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  window.setTimeout(() => {
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  }, 0)
}

export async function downloadDashboardExportReport(filters: DashboardFilters): Promise<void> {
  const token = loadStoredAuth().accessToken
  if (!token) {
    throw new Error('Sign in again to export reports')
  }

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.dashboard.exportReport}${filtersToQuery(filters)}`

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), EXPORT_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream',
    }
    headers.Authorization = `Bearer ${token}`

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text()
      let parsed: unknown = text
      try {
        parsed = JSON.parse(text) as unknown
      } catch {
        /* plain text error */
      }
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'reportId' in parsed &&
        !('detail' in parsed)
      ) {
        throw new Error(
          'Report was created but was not finished on the server. Deploy the latest API, then try again.',
        )
      }
      throw new ApiError(errorMessageFromBody(parsed, response.status), response.status, parsed)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { reportId?: string }
      if (payload.reportId) {
        throw new Error(
          'Export stopped after creating the report. Update the backend so it polls Amazon and returns the file.',
        )
      }
      throw new Error('Unexpected JSON response from export; expected a report file download.')
    }

    const blob = await response.blob()
    if (blob.size === 0) {
      throw new Error('Amazon returned an empty report file')
    }

    const filename =
      filenameFromDisposition(response.headers.get('Content-Disposition')) ??
      `merchant-listings-${filters.dateFrom}-to-${filters.dateTo}.xlsx`

    triggerBrowserDownload(blob, filename)
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Report export timed out. Try a shorter date range or try again.')
    }
    throw err
  } finally {
    window.clearTimeout(timeout)
  }
}