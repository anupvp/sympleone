import { apiRequest } from '../../api/httpClient'
import type { AuthUser, LoginCredentials, LoginResponse } from './types'

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>({
    method: 'POST',
    endpoint: 'auth.login',
    body: credentials,
  })
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>({
    method: 'GET',
    endpoint: 'auth.me',
    token,
  })
}

export async function logoutRequest(token: string): Promise<void> {
  await apiRequest<unknown>({
    method: 'POST',
    endpoint: 'auth.logout',
    token,
  })
}
