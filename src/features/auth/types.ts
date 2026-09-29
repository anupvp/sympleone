export interface LoginCredentials {
  email: string
  password: string
}

export type UserRole = 'admin' | 'employee' | 'seller'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: UserRole
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}
