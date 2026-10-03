import type { DashboardFilters, SalesPeriodMode } from '../types/dashboard.types'

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function isoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  return `${y}-${m}-${day}`
}

export function todayIsoDate(): string {
  return isoDateLocal(new Date())
}

export function currentMonthYear(): { salesMonth: number; salesYear: number } {
  const now = new Date()
  return { salesMonth: now.getMonth() + 1, salesYear: now.getFullYear() }
}

export function resolveSalesDateRange(
  filters: DashboardFilters,
): Pick<DashboardFilters, 'dateFrom' | 'dateTo'> {
  switch (filters.salesPeriodMode) {
    case 'daily': {
      const d = filters.salesDailyDate || todayIsoDate()
      return { dateFrom: d, dateTo: d }
    }
    case 'monthly': {
      const year = filters.salesYear
      const month = filters.salesMonth
      const lastDay = new Date(year, month, 0).getDate()
      return {
        dateFrom: `${year}-${pad2(month)}-01`,
        dateTo: `${year}-${pad2(month)}-${pad2(lastDay)}`,
      }
    }
    case 'dateRange':
    default:
      return {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }
  }
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) {
    return iso
  }
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatSalesPeriodLabel(filters: DashboardFilters): string {
  switch (filters.salesPeriodMode) {
    case 'daily':
      return formatShortDate(filters.salesDailyDate || todayIsoDate())
    case 'monthly':
      return `${MONTH_LABELS[filters.salesMonth - 1] ?? 'Month'} ${filters.salesYear}`
    case 'dateRange': {
      const { dateFrom, dateTo } = resolveSalesDateRange(filters)
      return `${formatShortDate(dateFrom)} – ${formatShortDate(dateTo)}`
    }
    default:
      return ''
  }
}

export function salesPeriodModeLabel(mode: SalesPeriodMode): string {
  switch (mode) {
    case 'daily':
      return 'Daily'
    case 'monthly':
      return 'Monthly'
    case 'dateRange':
      return 'Date range'
  }
}

export function yearOptions(centerYear: number, span = 3): number[] {
  const years: number[] = []
  for (let y = centerYear - span; y <= centerYear + span; y += 1) {
    years.push(y)
  }
  return years
}
