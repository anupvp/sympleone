export type SalesPeriodMode = 'daily' | 'monthly' | 'dateRange'

/** Filter context sent to dashboard read APIs (query params). */
export interface DashboardFilters {
  accountId: string
  marketplaceId: string
  /** When set, admin/employee view this seller's dashboard data */
  sellerId: string
  dateFrom: string
  dateTo: string
  salesPeriodMode: SalesPeriodMode
  /** ISO date (YYYY-MM-DD) when salesPeriodMode is daily */
  salesDailyDate: string
  /** 1–12 when salesPeriodMode is monthly */
  salesMonth: number
  salesYear: number
}

export type StatAccent = 'purple' | 'blue' | 'green' | 'amber'
export type StatIconKey = 'gmv' | 'netSales' | 'profit' | 'profitPercent'

export interface StatCardData {
  id: string
  label: string
  value: string
  changePercent: number
  comparisonLabel: string
  icon: StatIconKey
  accent: StatAccent
}

export interface SalesTrendPoint {
  date: string
  /** Net sales in chart units (lakhs for INR). */
  netSales: number
  /** Raw net sales in store currency for tooltips. */
  netSalesAmount: number
  previousPeriod: number
  previousPeriodAmount: number
  orderCount: number
  previousPeriodOrderCount: number
}

export interface SalesTrendData {
  frequency: string
  points: SalesTrendPoint[]
  currencySymbol: string
}

export interface ProfitabilitySegment {
  id: string
  label: string
  amount: number
  percent: number
  color: string
}

export interface ProfitabilityData {
  centerLabel: string
  centerValue: string
  segments: ProfitabilitySegment[]
  netProfit: { label: string; amount: string; percent: number }
}

export type AlertTone = 'red' | 'orange' | 'amber' | 'blue' | 'green' | 'purple'

export interface AlertActionItem {
  id: string
  count: number
  title: string
  tone: AlertTone
  href?: string
}

export interface MarketplaceRow {
  id: string
  name: string
  slug: string
  gmv: string
  netSales: string
  orders: number
  profit: string
  profitPercent: number
  growthPercent: number
  sparkline: number[]
}

export interface DashboardModuleState<T> {
  data: T | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  lastFetchedAt: number | null
}

export interface DashboardState {
  filters: DashboardFilters
  stats: DashboardModuleState<StatCardData[]>
  salesTrend: DashboardModuleState<SalesTrendData>
  profitability: DashboardModuleState<ProfitabilityData>
  alerts: DashboardModuleState<AlertActionItem[]>
  marketplaces: DashboardModuleState<MarketplaceRow[]>
}
