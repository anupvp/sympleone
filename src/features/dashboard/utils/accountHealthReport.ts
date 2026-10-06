import type { DashboardFilters } from '../types/dashboard.types'

export type AccountHealthMetricId =
  | 'policyViolation'
  | 'orderCancellationRate'
  | 'paymentHold'
  | 'lowInventory'
  | 'adsBudgetExhausted'
  | 'orderDefectRate'

export const ACCOUNT_HEALTH_METRIC_LABELS: Record<AccountHealthMetricId, string> = {
  policyViolation: 'Policy Violation',
  orderCancellationRate: 'Order Cancellation Rate',
  paymentHold: 'Payment Hold',
  lowInventory: 'Low Inventory',
  adsBudgetExhausted: 'Ads Budget Exhausted',
  orderDefectRate: 'Order Defect Rate',
}

export function accountHealthReportUrl(
  metricId: AccountHealthMetricId,
  filters: Pick<DashboardFilters, 'sellerId' | 'dateFrom' | 'dateTo' | 'marketplaceId'>,
): string {
  const params = new URLSearchParams({ metric: metricId })
  if (filters.sellerId?.trim()) {
    params.set('sellerId', filters.sellerId.trim())
  }
  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom)
  }
  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo)
  }
  if (filters.marketplaceId) {
    params.set('marketplaceId', filters.marketplaceId)
  }
  return `/dashboard/account-health/report?${params.toString()}`
}

export function openAccountHealthReport(
  metricId: AccountHealthMetricId,
  filters: Pick<DashboardFilters, 'sellerId' | 'dateFrom' | 'dateTo' | 'marketplaceId'>,
): void {
  window.open(accountHealthReportUrl(metricId, filters), '_blank', 'noopener,noreferrer')
}
