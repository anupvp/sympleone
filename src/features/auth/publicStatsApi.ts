import { apiRequest } from '../../api/httpClient'
import { API_CONFIG } from '../../config/api.config'

export interface PublicSellerCount {
  total: number
}

export async function fetchPublicSellerCount(): Promise<PublicSellerCount> {
  return apiRequest({
    method: 'GET',
    endpoint: API_CONFIG.endpoints.public.sellerCount,
    rawPath: true,
    omitStoredAuth: true,
  })
}
