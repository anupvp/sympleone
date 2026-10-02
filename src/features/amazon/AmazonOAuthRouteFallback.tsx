import { Navigate, useLocation } from 'react-router-dom'
import {
  amazonConnectResultRoute,
  amazonOAuthCallbackRoute,
  hasAmazonConnectResultParams,
  hasAmazonOAuthCallbackParams,
} from './amazonOAuthQuery'

/** Keep Amazon OAuth query params when no explicit route matches. */
export function AmazonOAuthRouteFallback() {
  const location = useLocation()
  if (hasAmazonOAuthCallbackParams(location.search)) {
    return (
      <Navigate
        to={amazonOAuthCallbackRoute(location.search)}
        replace
      />
    )
  }
  if (hasAmazonConnectResultParams(location.search)) {
    return (
      <Navigate
        to={amazonConnectResultRoute(location.search)}
        replace
      />
    )
  }
  return <Navigate to="/" replace />
}
