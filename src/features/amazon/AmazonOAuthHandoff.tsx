import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  amazonOAuthCallbackRoute,
  hasAmazonOAuthCallbackParams,
} from './amazonOAuthQuery'

/**
 * Amazon sometimes redirects to the site root (or /amazon/connect) with OAuth query params.
 * Forward them to /amazon/callback so the SPA can complete authorization.
 */
export function AmazonOAuthHandoff() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/amazon/callback') {
      return
    }
    if (!hasAmazonOAuthCallbackParams(location.search)) {
      return
    }
    navigate(amazonOAuthCallbackRoute(location.search), { replace: true })
  }, [location.pathname, location.search, navigate])

  return null
}
