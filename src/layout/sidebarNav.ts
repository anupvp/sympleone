export interface SidebarNavItem {
  id: string
  label: string
  to: string
  adminOnly?: boolean
}

export const SIDEBAR_NAV: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { id: 'orders', label: 'Orders', to: '/app/orders' },
  { id: 'products', label: 'Products', to: '/app/products' },
  { id: 'inventory', label: 'Inventory', to: '/app/inventory' },
  { id: 'marketplaces', label: 'Marketplaces', to: '/app/marketplaces' },
  { id: 'advertising', label: 'Advertising', to: '/app/advertising' },
  { id: 'finance', label: 'Finance', to: '/app/finance' },
  { id: 'sellers', label: 'Sellers', to: '/admin/sellers', adminOnly: true },
  { id: 'reports', label: 'Reports', to: '/app/reports' },
  { id: 'alerts', label: 'Alerts', to: '/dashboard#alerts' },
  { id: 'settings', label: 'Settings', to: '/account/profile' },
]
