import { apiRequest } from '../../api/httpClient'
import { isRelaxedAuth } from './auth.config'
import type { AuthUser, LoginCredentials, LoginResponse, UserRole } from './types'

function inferRelaxedRole(email: string): UserRole {
  const lower = email.toLowerCase()
  if (lower.includes('admin') || lower.endsWith('@sympleone.com') && lower.startsWith('admin')) {
    return 'admin'
  }
  if (lower.includes('seller')) {
    return 'seller'
  }
  return 'employee'
}

function mockLoginResponse(credentials: LoginCredentials): LoginResponse {
  const email = credentials.email.trim()
  const localPart = email.includes('@') ? email.split('@')[0] : email

  return {
    accessToken: `relaxed.${encodeURIComponent(email)}`,
    user: {
      id: 'local-user',
      email,
      name: localPart || 'User',
      role: inferRelaxedRole(email),
    },
  }
}

interface LoginUserApi {
  id: string
  email: string
  name: string
  role: string
}

interface MeApiResponse {
  id: string
  email: string
  name: string
  role: string
  status: string
  policies: string[]
}

function mapUser(u: LoginUserApi | MeApiResponse): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as UserRole,
  }
}

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  if (isRelaxedAuth()) {
    return mockLoginResponse(credentials)
  }

  const data = await apiRequest<{
    accessToken: string
    user: LoginUserApi
  }>({
    method: 'POST',
    endpoint: 'auth.login',
    body: credentials,
  })

  return {
    accessToken: data.accessToken,
    user: mapUser(data.user),
  }
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  if (isRelaxedAuth()) {
    const stored = localStorage.getItem('sympleone_user')
    if (stored) {
      return JSON.parse(stored) as AuthUser
    }
    return {
      id: 'local-user',
      email: 'user@example.com',
      name: 'User',
      role: 'employee',
    }
  }

  const me = await apiRequest<MeApiResponse>({
    method: 'GET',
    endpoint: 'auth.me',
    token,
  })
  return mapUser(me)
}

export async function changePasswordRequest(
  token: string,
  body: { current_password: string; new_password: string },
): Promise<void> {
  if (isRelaxedAuth()) {
    return
  }

  await apiRequest<{ message: string }>({
    method: 'POST',
    endpoint: 'auth.changePassword',
    token,
    body,
  })
}

export async function logoutRequest(token: string): Promise<void> {
  if (isRelaxedAuth()) {
    return
  }

  await apiRequest<unknown>({
    method: 'POST',
    endpoint: 'auth.logout',
    token,
  })
}
