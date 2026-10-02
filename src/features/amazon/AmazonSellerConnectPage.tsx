import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { hydrateSession } from '../auth/authSlice'
import { AMAZON_DEFAULT_MARKETPLACE_ID } from '../../config/api.config'
import { ApiError } from '../../api/httpClient'
import { hasRealApiAccessToken } from './amazonAuth'
import { startAmazonConnect } from './amazonApi'
import { marketplaceLabel } from './marketplaceLabels'
import './AmazonSellerConnectPage.css'

function sellerDisplayName(
  sellingPartnerId: string | null,
  userFullName: string | null | undefined,
): string {
  if (userFullName?.trim()) {
    return userFullName.trim()
  }
  if (sellingPartnerId) {
    return `Seller ${sellingPartnerId.slice(-6)}`
  }
  return 'Your store'
}

export function AmazonSellerConnectPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)

  useEffect(() => {
    if (accessToken) {
      void dispatch(hydrateSession())
    }
  }, [accessToken, dispatch])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amazonStatus = searchParams.get('amazon')
  const sellingPartnerId = searchParams.get('selling_partner_id')
  const marketplaceId =
    searchParams.get('marketplace_id') ?? AMAZON_DEFAULT_MARKETPLACE_ID

  const isSuccess = amazonStatus === 'connected'
  const isError = amazonStatus === 'error'

  const sellerName = useMemo(
    () => sellerDisplayName(sellingPartnerId, user?.name),
    [sellingPartnerId, user?.name],
  )

  const clearOAuthQuery = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    next.delete('amazon')
    next.delete('selling_partner_id')
    next.delete('marketplace_id')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const onConnect = async () => {
    setError(null)
    setLoading(true)
    try {
      const signedIn = hasRealApiAccessToken(accessToken)
      const { authorization_url } = await startAmazonConnect(
        AMAZON_DEFAULT_MARKETPLACE_ID,
        signedIn
          ? { accessToken, omitStoredAuth: false }
          : { omitStoredAuth: true },
      )
      window.location.assign(authorization_url)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not start Amazon authorization'
      setError(message)
      setLoading(false)
    }
  }

  const onContinue = () => {
    clearOAuthQuery()
    navigate('/dashboard')
  }

  return (
    <div className="amazon-connect-page">
      <header className="amazon-connect-page__header">
        <img
          src="/symple-logo.png"
          alt="Symple"
          className="amazon-connect-page__logo"
          width={112}
          height={112}
        />
      </header>

      <main className="amazon-connect-page__main">
        {isSuccess ? (
          <section
            className="amazon-connect-card amazon-connect-card--success"
            aria-labelledby="amazon-success-title"
          >
            <h1 id="amazon-success-title" className="amazon-connect-card__title">
              Amazon Connected ✓
            </h1>
            <dl className="amazon-connect-card__meta">
              <div>
                <dt>Seller</dt>
                <dd>{sellerName}</dd>
              </div>
              <div>
                <dt>Marketplace</dt>
                <dd>{marketplaceLabel(marketplaceId)}</dd>
              </div>
            </dl>
            <p className="amazon-connect-card__body">
              Your Amazon account is now connected to Symple One.
            </p>
            <button
              type="button"
              className="amazon-connect-card__btn amazon-connect-card__btn--primary"
              onClick={onContinue}
            >
              Continue
            </button>
          </section>
        ) : (
          <section
            className="amazon-connect-card"
            aria-labelledby="amazon-connect-title"
          >
            <h1 id="amazon-connect-title" className="amazon-connect-card__title">
              Connect Your Amazon Seller Account
            </h1>
            <p className="amazon-connect-card__lead">
              Connect Amazon to synchronize your orders, inventory and products with
              Symple One.
            </p>
            <ul className="amazon-connect-card__bullets">
              <li>Manage orders, inventory and products in Symple One</li>
            </ul>

            {isError && (
              <p className="amazon-connect-card__error" role="alert">
                Amazon authorization could not be completed. This often means the
                authorization link expired or was started on a different server than
                the callback. Click Connect &amp; Authorize again from this page and
                complete Amazon in one session.
              </p>
            )}
            {error && (
              <p className="amazon-connect-card__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className="amazon-connect-card__btn amazon-connect-card__btn--primary"
              disabled={loading}
              onClick={() => void onConnect()}
            >
              {loading ? 'Redirecting…' : 'Connect & Authorize'}
            </button>

            <p className="amazon-connect-card__hint">
              You will be redirected to Amazon Seller Central to approve access.
            </p>

            <p className="amazon-connect-card__footer">
              <Link to="/">Sign in to Symple One</Link>
              {' · '}
              optional — link this connection to your workspace after authorizing
            </p>
          </section>
        )}
      </main>
    </div>
  )
}
