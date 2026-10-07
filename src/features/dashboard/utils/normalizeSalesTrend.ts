import type {
  SalesDestination,
  SalesTrendData,
  SalesTrendPoint,
} from '../types/dashboard.types'

function lakhToAmount(lakh: number): number {
  return Math.round(lakh * 100_000 * 100) / 100
}

function normalizePoint(raw: Partial<SalesTrendPoint>): SalesTrendPoint {
  const netSales = Number(raw.netSales) || 0
  const previousPeriod = Number(raw.previousPeriod) || 0
  const netSalesAmount =
    raw.netSalesAmount != null && !Number.isNaN(Number(raw.netSalesAmount))
      ? Number(raw.netSalesAmount)
      : lakhToAmount(netSales)
  const previousPeriodAmount =
    raw.previousPeriodAmount != null &&
    !Number.isNaN(Number(raw.previousPeriodAmount))
      ? Number(raw.previousPeriodAmount)
      : lakhToAmount(previousPeriod)

  return {
    date: raw.date ?? '',
    netSales,
    netSalesAmount,
    previousPeriod,
    previousPeriodAmount,
    orderCount: Number(raw.orderCount) || 0,
    previousPeriodOrderCount: Number(raw.previousPeriodOrderCount) || 0,
  }
}

export function normalizeSalesTrend(
  raw: SalesTrendData | null | undefined,
): SalesTrendData {
  const points = Array.isArray(raw?.points)
    ? raw.points.map((p) => normalizePoint(p))
    : []

  const destinations: SalesDestination[] = Array.isArray(raw?.destinations)
    ? raw.destinations.map((row) => ({
        state: String(row?.state ?? ''),
        amount: Number(row?.amount) || 0,
        orderCount: Number(row?.orderCount) || 0,
      }))
    : []

  return {
    frequency: raw?.frequency ?? 'Daily',
    currencySymbol: raw?.currencySymbol ?? '₹',
    points,
    destinations,
  }
}
