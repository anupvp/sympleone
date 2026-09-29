import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'

export interface AmazonConnectResponse {
  authorization_url: string
}

export async function startAmazonConnect(
  token: string,
  marketplaceId: string,
): Promise<AmazonConnectResponse> {
  return apiRequest({
    method: 'POST',
    endpoint: API_CONFIG.endpoints.amazon.connect,
    rawPath: true,
    token,
    body: { marketplace_id: marketplaceId },
  })
}
