import { useCallback } from 'react'
import { useAppSelector } from '../../../app/hooks'
import { ApiError } from '../../../api/httpClient'
import { loadStoredAuth } from '../../auth/authStorage'

export function useAuthToken(): string | null {
  const fromStore = useAppSelector((s) => s.auth.accessToken)
  return fromStore ?? loadStoredAuth().accessToken
}

export function useAdminApi() {
  const token = useAuthToken()

  const withToken = useCallback(
    <T>(fn: (t: string) => Promise<T>): Promise<T> => {
      if (!token) {
        return Promise.reject(new ApiError('Not signed in', 401, null))
      }
      return fn(token)
    },
    [token],
  )

  return { token, withToken }
}
