import type {
  AlertActionItem,
  MarketplaceRow,
  ProfitabilityData,
  SalesTrendData,
  StatCardData,
} from '../types/dashboard.types'

export const mockStatCards: StatCardData[] = [
  {
    id: 'gmv',
    label: 'SALES',
    value: '₹48.6L',
    changePercent: 12.4,
    comparisonLabel: 'vs Apr 1 – Apr 30, 2024',
    icon: 'gmv',
    accent: 'purple',
  },
  {
    id: 'net-sales',
    label: 'ORDERS',
    value: '₹42.1L',
    changePercent: 8.2,
    comparisonLabel: 'vs Apr 1 – Apr 30, 2024',
    icon: 'netSales',
    accent: 'blue',
  },
  {
    id: 'profit',
    label: 'RETURN',
    value: '₹9.4L',
    changePercent: 15.1,
    comparisonLabel: 'vs Apr 1 – Apr 30, 2024',
    icon: 'profit',
    accent: 'green',
  },
  {
    id: 'profit-pct',
    label: 'PRODUCTS',
    value: '1,284',
    changePercent: 2.1,
    comparisonLabel: 'vs Apr 1 – Apr 30, 2024',
    icon: 'profitPercent',
    accent: 'amber',
  },
]

export const mockSalesTrend: SalesTrendData = {
  frequency: 'Daily',
  currencySymbol: '₹',
  points: [
    { date: 'May 1', netSales: 12, previousPeriod: 10 },
    { date: 'May 5', netSales: 18, previousPeriod: 14 },
    { date: 'May 9', netSales: 15, previousPeriod: 16 },
    { date: 'May 13', netSales: 22, previousPeriod: 18 },
    { date: 'May 17', netSales: 28, previousPeriod: 20 },
    { date: 'May 21', netSales: 32, previousPeriod: 24 },
    { date: 'May 25', netSales: 30, previousPeriod: 26 },
    { date: 'May 29', netSales: 35, previousPeriod: 28 },
  ],
}

export const mockProfitability: ProfitabilityData = {
  centerLabel: 'Net Profit',
  centerValue: '₹9.4L',
  segments: [
    { id: 'cogs', label: 'COGS', amount: 18.2, percent: 43.2, color: '#f97316' },
    { id: 'fees', label: 'Amazon Fees', amount: 8.4, percent: 20, color: '#eab308' },
    { id: 'ads', label: 'Ads', amount: 6.1, percent: 14.5, color: '#ef4444' },
    { id: 'profit', label: 'Net Profit', amount: 9.4, percent: 22.3, color: '#22c55e' },
  ],
  netProfit: { label: 'Net Profit', amount: '₹9.4L', percent: 22.3 },
}

export const mockAlerts: AlertActionItem[] = [
  { id: 'holds', count: 3, title: 'Payment Holds', tone: 'red' },
  { id: 'stock', count: 12, title: 'Low Stock SKUs', tone: 'orange' },
  { id: 'returns', count: 8, title: 'Return Requests', tone: 'amber' },
  { id: 'listings', count: 5, title: 'Listing Errors', tone: 'blue' },
  { id: 'ads', count: 2, title: 'Ad Budget Alerts', tone: 'green' },
  { id: 'reports', count: 4, title: 'Reports Ready', tone: 'purple' },
]

export const mockMarketplaces: MarketplaceRow[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    gmv: '₹28.4L',
    netSales: '₹24.1L',
    orders: 1842,
    profit: '₹5.8L',
    profitPercent: 24.1,
    growthPercent: 14.2,
    sparkline: [12, 14, 13, 16, 18, 17, 20],
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    slug: 'flipkart',
    gmv: '₹12.8L',
    netSales: '₹10.9L',
    orders: 956,
    profit: '₹2.1L',
    profitPercent: 19.3,
    growthPercent: 6.8,
    sparkline: [10, 11, 9, 12, 11, 13, 14],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    slug: 'shopify',
    gmv: '₹5.2L',
    netSales: '₹4.8L',
    orders: 412,
    profit: '₹1.2L',
    profitPercent: 25,
    growthPercent: -2.4,
    sparkline: [8, 7, 8, 6, 7, 5, 6],
  },
  {
    id: 'meesho',
    name: 'Meesho',
    slug: 'meesho',
    gmv: '₹2.2L',
    netSales: '₹2.3L',
    orders: 318,
    profit: '₹0.3L',
    profitPercent: 13.1,
    growthPercent: 22.5,
    sparkline: [4, 5, 6, 7, 8, 9, 11],
  },
]
