import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from './hooks'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, status } = useAppSelector((s) => s.auth)
  const location = useLocation()

  const isAuthed = Boolean(accessToken) && status !== 'error'

  if (!isAuthed && status !== 'loading') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
