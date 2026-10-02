import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/httpClient'
import { completeAmazonOAuthCallback } from './amazonApi'
import './AmazonOAuthCallbackPage.css'

type Phase = 'loading' | 'error'

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

    const spapi_oauth_code = searchParams.get('spapi_oauth_code')
    const state = searchParams.get('state')
    const selling_partner_id = searchParams.get('selling_partner_id')

    if (!spapi_oauth_code || !state || !selling_partner_id) {
      setPhase('error')
      setErrorMessage(
        'Missing Amazon authorization parameters. Start again from Connect & Authorize.',
      )
      return
    }

    void (async () => {
      try {
        const result = await completeAmazonOAuthCallback({
          spapi_oauth_code,
          state,
          selling_partner_id,
        })
        window.location.replace(result.redirect_url || '/amazon/connect?amazon=error')
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Could not complete Amazon authorization'
        setPhase('error')
        setErrorMessage(message)
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
