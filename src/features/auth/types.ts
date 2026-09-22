export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name?: string
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
