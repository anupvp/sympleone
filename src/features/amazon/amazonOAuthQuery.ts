/** Amazon SP-API website authorization query params on redirect from Seller Central. */

export interface AmazonOAuthCallbackParams {
  spapi_oauth_code: string
  state: string
  selling_partner_id: string
}

export function parseAmazonOAuthCallbackParams(
  search: string,
): AmazonOAuthCallbackParams | null {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  const spapi_oauth_code =
    params.get('spapi_oauth_code')?.trim() ||
    params.get('code')?.trim() ||
    ''
  const state = params.get('state')?.trim() || ''
  const selling_partner_id = params.get('selling_partner_id')?.trim() || ''

  if (!spapi_oauth_code || !state || !selling_partner_id) {
    return null
  }
  return { spapi_oauth_code, state, selling_partner_id }
}

export function hasAmazonOAuthCallbackParams(search: string): boolean {
  return parseAmazonOAuthCallbackParams(search) !== null
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
