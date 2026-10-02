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
