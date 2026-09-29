import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { hydrateSession } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from './hooks'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { accessToken, status } = useAppSelector((s) => s.auth)
  const location = useLocation()

  useEffect(() => {
    if (accessToken) {
      void dispatch(hydrateSession())
    }
  }, [accessToken, dispatch])

  const isAuthed = Boolean(accessToken) && status !== 'error'

  if (!isAuthed && status !== 'loading') {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return children
}
