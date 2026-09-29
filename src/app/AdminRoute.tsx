import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from './hooks'
import { isAdminUser } from '../features/auth/auth.utils'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, user, status } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!accessToken && status !== 'loading') {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (!user) {
    return null
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
