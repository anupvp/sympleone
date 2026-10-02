import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  amazonConnectResultRoute,
  amazonOAuthCallbackRoute,
  hasAmazonConnectResultParams,
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
    if (
      location.pathname !== '/amazon/connect' &&
      hasAmazonConnectResultParams(location.search)
    ) {
      navigate(amazonConnectResultRoute(location.search), { replace: true })
      return
    }
    if (!hasAmazonOAuthCallbackParams(location.search)) {
      return
    }
    navigate(amazonOAuthCallbackRoute(location.search), { replace: true })
  }, [location.pathname, location.search, navigate])

  return null
}
