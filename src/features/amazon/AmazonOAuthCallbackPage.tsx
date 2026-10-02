import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { API_CONFIG } from '../../config/api.config'
import { ApiError } from '../../api/httpClient'
import { completeAmazonOAuthCallback } from './amazonApi'
import { parseAmazonOAuthCallbackParams } from './amazonOAuthQuery'
import './AmazonOAuthCallbackPage.css'

type Phase = 'loading' | 'error'

function redirectToConnectError(reason: string) {
  const url = `/amazon/connect?amazon=error&reason=${encodeURIComponent(reason)}`
  window.location.replace(url)
}

export function AmazonOAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const started = useRef(false)
  const [phase, setPhase] = useState<Phase>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true

    const parsed = parseAmazonOAuthCallbackParams(searchParams.toString())
    if (!parsed) {
      const keys = [...searchParams.keys()].join(', ') || '(none)'
      setPhase('error')
      setErrorMessage(
        `Amazon did not return the expected parameters (spapi_oauth_code, state, selling_partner_id). Received keys: ${keys}.`,
      )
      return
    }

    void (async () => {
      try {
        const result = await completeAmazonOAuthCallback(parsed)
        if (!result.redirect_url) {
          redirectToConnectError('missing_redirect')
          return
        }
        window.location.replace(result.redirect_url)
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not complete Amazon authorization'
        setPhase('error')
        setErrorMessage(
          `${message} (API: ${API_CONFIG.baseUrl}). Check that the frontend was built with the correct VITE_API_BASE_URL and that the API is running.`,
        )
      }
    })()
  }, [searchParams])

  return (
    <div className="amazon-oauth-callback-page">
      <div className="amazon-oauth-callback-card">
        {phase === 'loading' ? (
          <>
            <h1>Completing Amazon authorization</h1>
            <p>Please wait while Symple One connects your seller account…</p>
            <div className="amazon-oauth-callback-spinner" aria-hidden />
          </>
        ) : (
          <>
            <h1>Authorization could not be completed</h1>
            <p className="amazon-oauth-callback-error" role="alert">
              {errorMessage}
            </p>
            <Link className="amazon-oauth-callback-link" to="/amazon/connect">
              Back to Connect & Authorize
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
