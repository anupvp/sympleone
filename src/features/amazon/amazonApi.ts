import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'
import type { AuthUser } from '../auth/types'

export interface AmazonConnectResponse {
  authorization_url: string
}

export interface StartAmazonConnectOptions {
  /** Symple JWT when the seller is signed in; omit for public Appstore connect. */
  accessToken?: string | null
  /** Do not send a remembered session token (required for anonymous connect). */
  omitStoredAuth?: boolean
}

export interface AmazonSellerNewAccount {
  email: string
  password: string
}

export interface AmazonCallbackCompleteResponse {
  redirect_url: string
  success: boolean
  accessToken?: string | null
  user?: AuthUser | null
  newAccount?: AmazonSellerNewAccount | null
}

export interface AmazonCallbackCompleteRequest {
  spapi_oauth_code: string
  state: string
  selling_partner_id: string
}

export async function completeAmazonOAuthCallback(
  body: AmazonCallbackCompleteRequest,
): Promise<AmazonCallbackCompleteResponse> {
  return apiRequest({
    method: 'POST',
    endpoint: API_CONFIG.endpoints.amazon.callbackComplete,
    rawPath: true,
    omitStoredAuth: true,
    body,
  })
}

export async function startAmazonConnect(
  marketplaceId: string,
  options: StartAmazonConnectOptions = {},
): Promise<AmazonConnectResponse> {
  const useAuth = Boolean(options.accessToken)
  return apiRequest({
    method: 'POST',
    endpoint: API_CONFIG.endpoints.amazon.connect,
    rawPath: true,
    token: useAuth ? options.accessToken : null,
    omitStoredAuth: options.omitStoredAuth ?? !useAuth,
    body: { marketplace_id: marketplaceId },
  })
}
