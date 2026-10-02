/** Amazon SP-API website authorization query params on redirect from Seller Central. */

export function hasAmazonOAuthCallbackParams(search: string): boolean {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  return Boolean(
    params.get('spapi_oauth_code')?.trim() &&
      params.get('state')?.trim() &&
      params.get('selling_partner_id')?.trim(),
  )
}

export function amazonOAuthCallbackRoute(search: string): string {
  const normalized = search.startsWith('?') || search === '' ? search : `?${search}`
  return `/amazon/callback${normalized}`
}

/** Backend redirects here with ?amazon=connected or ?amazon=error (often on site root). */
export function hasAmazonConnectResultParams(search: string): boolean {
  const status = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  ).get('amazon')
  return status === 'connected' || status === 'error'
}

export function amazonConnectResultRoute(search: string): string {
  const normalized = search.startsWith('?') || search === '' ? search : `?${search}`
  return `/amazon/connect${normalized}`
}
