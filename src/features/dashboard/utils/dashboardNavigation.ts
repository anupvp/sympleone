export function dashboardUrl(sellerId?: string): string {
  if (!sellerId?.trim()) {
    return '/dashboard'
  }
  const params = new URLSearchParams({ sellerId: sellerId.trim() })
  return `/dashboard?${params.toString()}`
}

export function openSellerDashboard(sellerId: string): void {
  window.open(dashboardUrl(sellerId), '_blank', 'noopener,noreferrer')
}
