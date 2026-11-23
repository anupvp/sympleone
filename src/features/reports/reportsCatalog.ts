export interface ReportCatalogItem {
  id: string
  /** Sidebar label */
  label: string
  /** Route segment under /app/reports */
  slug: string
  title: string
  description: string
  /** Short line on overview grid cards */
  cardDescription: string
  adminOnly?: boolean
  /** Related in-app workspace (optional) */
  workspacePath?: string
  workspaceLabel?: string
}

export const REPORT_CATALOG: ReportCatalogItem[] = [
  {
    id: 'overview',
    label: 'Overview (Full Report)',
    slug: 'overview',
    title: 'Full Overview Report',
    description: 'Complete business performance across sellers, marketplaces and teams.',
    cardDescription: 'Complete business summary & KPIs.',
  },
  {
    id: 'sales',
    label: 'Sales Report',
    slug: 'sales',
    title: 'Sales Report',
    description: 'Sales, revenue, units and profit for the selected period.',
    cardDescription: 'Sales, revenue, units & profit.',
    workspacePath: '/dashboard',
    workspaceLabel: 'Open dashboard sales',
  },
  {
    id: 'product',
    label: 'Product Report',
    slug: 'product',
    title: 'Product Report',
    description: 'Product-wise sales and performance (Top Products and low performers).',
    cardDescription: 'Product-wise sales & performance.',
    workspacePath: '/dashboard',
    workspaceLabel: 'View product performance on dashboard',
  },
  {
    id: 'inventory',
    label: 'Inventory Report',
    slug: 'inventory',
    title: 'Inventory Report',
    description: 'Stock levels, low stock signals and FBA inventory movement.',
    cardDescription: 'Stock, low stock & inventory movement.',
    workspacePath: '/app/fba-inventory',
    workspaceLabel: 'Open FBA Inventory',
  },
  {
    id: 'shipment',
    label: 'Shipment Report',
    slug: 'shipment',
    title: 'Shipment Report',
    description: 'Dispatch, tracking and delivery status from Amazon orders.',
    cardDescription: 'Dispatch, tracking & delivery status.',
    workspacePath: '/app/orders',
    workspaceLabel: 'View orders & shipments',
  },
  {
    id: 'transaction',
    label: 'Transaction Report',
    slug: 'transaction',
    title: 'Transaction Report',
    description: 'Orders, fees, commission and settlement from Amazon Finances API.',
    cardDescription: 'Orders, fees, commission & settlement.',
  },
  {
    id: 'returned',
    label: 'Returned Report',
    slug: 'returned',
    title: 'Returned Report',
    description: 'Returns, refunds and RTO details when connected to Amazon returns data.',
    cardDescription: 'Returns, refunds & RTO details.',
    workspacePath: '/app/orders',
    workspaceLabel: 'Review orders workspace',
  },
  {
    id: 'fba',
    label: 'FBA Report',
    slug: 'fba',
    title: 'FBA Report',
    description: 'Amazon FBA orders, fulfilment inventory and fees context.',
    cardDescription: 'Amazon FBA orders, stock & fees.',
    workspacePath: '/app/fba-inventory',
    workspaceLabel: 'Open FBA Inventory',
  },
  {
    id: 'cancelled',
    label: 'Cancelled Report',
    slug: 'cancelled',
    title: 'Cancelled Report',
    description: 'Cancelled orders and counts for the selected date range.',
    cardDescription: 'Cancelled orders & reasons.',
    workspacePath: '/app/orders',
    workspaceLabel: 'Filter cancelled orders',
  },
  {
    id: 'pending',
    label: 'Pending Order Report',
    slug: 'pending',
    title: 'Pending Order Report',
    description: 'Orders awaiting processing, shipment or delivery confirmation.',
    cardDescription: 'Orders awaiting processing or dispatch.',
    workspacePath: '/app/orders',
    workspaceLabel: 'Filter pending orders',
  },
  {
    id: 'seller-wise',
    label: 'Seller Wise Report',
    slug: 'seller-wise',
    title: 'Seller Wise Report',
    description: 'Performance, sales and profitability grouped by seller account.',
    cardDescription: 'Performance, sales & profitability by seller.',
    adminOnly: true,
    workspacePath: '/admin/sellers',
    workspaceLabel: 'Open Sellers admin',
  },
  {
    id: 'employees-assigned',
    label: 'Employees Assigned to Seller',
    slug: 'employees-assigned',
    title: 'Employees Assigned to Seller',
    description: 'Employee–seller allocation and mapping across your organization.',
    cardDescription: 'Employee–seller allocation & mapping.',
    adminOnly: true,
    workspacePath: '/admin/sellers',
    workspaceLabel: 'Manage seller assignments',
  },
  {
    id: 'employee-performance',
    label: 'Employee Performance Report',
    slug: 'employee-performance',
    title: 'Employee Performance Report',
    description: 'Productivity and KPIs for employees handling seller accounts.',
    cardDescription: 'Orders handled, productivity & KPIs.',
    adminOnly: true,
    workspacePath: '/admin/employees',
    workspaceLabel: 'Open Employees admin',
  },
  {
    id: 'employee',
    label: 'Employee Report',
    slug: 'employee',
    title: 'Employee Report',
    description: 'Employee details, roles and work allocation.',
    cardDescription: 'Employee details, roles & work allocation.',
    adminOnly: true,
    workspacePath: '/admin/employees',
    workspaceLabel: 'Open Employees admin',
  },
]

export function reportBySlug(slug: string): ReportCatalogItem | undefined {
  return REPORT_CATALOG.find((r) => r.slug === slug)
}