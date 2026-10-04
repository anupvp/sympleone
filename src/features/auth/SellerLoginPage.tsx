import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { AMAZON_DEFAULT_MARKETPLACE_ID } from '../../config/api.config'
import { ApiError } from '../../api/httpClient'
import { hasRealApiAccessToken } from '../amazon/amazonAuth'
import { hasAmazonOAuthCallbackParams } from '../amazon/amazonOAuthQuery'
import { startAmazonConnect } from '../amazon/amazonApi'
import { clearAuthError, login, logout } from './authSlice'
import { isSellerUser } from './auth.utils'
import {
  DEFAULT_REMEMBER_ME,
  loadAnySavedEmail,
  persistLoginEmail,
} from './loginRememberStorage'
import { LoginHeroSocial } from './components/LoginHeroSocial'
import './LoginPage.css'

type SellerPanelMode = 'signin' | 'connect'

export function SellerLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error, accessToken, user } = useAppSelector((s) => s.auth)

  const [rememberMe, setRememberMe] = useState(DEFAULT_REMEMBER_ME)
  const [email, setEmail] = useState(() => loadAnySavedEmail())
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [panelMode, setPanelMode] = useState<SellerPanelMode>('signin')
  const [amazonLoading, setAmazonLoading] = useState(false)
  const [amazonError, setAmazonError] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/dashboard'

  useEffect(() => {
    if (hasAmazonOAuthCallbackParams(location.search)) {
      return
    }
    if (accessToken && user && isSellerUser(user)) {
      navigate(from, { replace: true })
    }
    if (accessToken && user && !isSellerUser(user)) {
      void dispatch(logout())
      setRoleError('Use the workspace login page for admin and employee accounts.')
    }
  }, [accessToken, user, from, location.search, navigate, dispatch])

  useEffect(() => {
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

  useEffect(() => {
    persistLoginEmail(email, rememberMe)
  }, [email, rememberMe])

  const onRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
    persistLoginEmail(email, checked)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setRoleError(null)
    persistLoginEmail(email, rememberMe)
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) {
      if (!isSellerUser(result.payload.user)) {
        await dispatch(logout())
        setRoleError('This page is for seller accounts only. Try workspace login instead.')
        return
      }
      navigate(from, { replace: true })
    }
  }

  const loading = status === 'loading'

  const onAmazonConnect = async () => {
    setAmazonError(null)
    setAmazonLoading(true)
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
      setAmazonError(message)
      setAmazonLoading(false)
    }
  }

  const displayError = roleError ?? error

  return (
    <div className="login-page">
      <aside className="login-hero" aria-hidden={false}>
        <div className="login-hero__rings" aria-hidden />
        <div className="login-hero__content">
          <img
            className="login-hero__logo"
            src="/symple-logo.png"
            alt="Symple"
            width={112}
            height={112}
          />

          <p className="login-hero__eyebrow">SELLER PORTAL</p>
          <h1 className="login-hero__title">
            Your Amazon business.
            <span className="login-hero__title-accent">Your dashboard.</span>
          </h1>
          <p className="login-hero__desc">
            Sign in to view sales trends, marketplace performance, and connect your
            Amazon seller account with Symple One.
          </p>

          <LoginHeroSocial />
        </div>
      </aside>

      <section className="login-panel">
        <div className="login-panel__inner">
          <nav className="login-panel__nav" aria-label="Seller sign-in options">
            <button
              type="button"
              className={`login-panel__nav-link${panelMode === 'signin' ? ' login-panel__nav-link--active' : ''}`}
              onClick={() => {
                setPanelMode('signin')
                setAmazonError(null)
                dispatch(clearAuthError())
                setRoleError(null)
              }}
            >
              Seller sign in
            </button>
            <button
              type="button"
              className={`login-panel__nav-link${panelMode === 'connect' ? ' login-panel__nav-link--active' : ''}`}
              onClick={() => {
                setPanelMode('connect')
                dispatch(clearAuthError())
                setRoleError(null)
              }}
            >
              Connect Amazon
            </button>
          </nav>

          {panelMode === 'connect' ? (
            <>
              <header className="login-panel__header">
                <p className="login-panel__eyebrow">AMAZON SELLER</p>
                <h2 className="login-panel__title">Authorize Symple One</h2>
                <p className="login-panel__subtitle">
                  Link your Seller Central account to sync orders, inventory, and sales
                  metrics. You can sign in before or after authorizing.
                </p>
              </header>

              <p className="login-connect__hint">
                You will be redirected to Amazon to approve access.
              </p>

              {amazonError && (
                <p className="login-error" role="alert">
                  {amazonError}
                </p>
              )}

              <button
                type="button"
                className="login-submit login-submit--amazon"
                disabled={amazonLoading}
                onClick={() => void onAmazonConnect()}
              >
                {amazonLoading ? 'Redirecting…' : 'Connect & Authorize'}
              </button>

              <button
                type="button"
                className="login-connect-back"
                onClick={() => setPanelMode('signin')}
              >
                ← Back to seller sign in
              </button>
            </>
          ) : (
            <>
              <header className="login-panel__header">
                <p className="login-panel__eyebrow">SELLER ACCOUNT</p>
                <h2 className="login-panel__title">Welcome back</h2>
                <p className="login-panel__subtitle">
                  Sign in with the email and password for your seller workspace.
                </p>
              </header>

              <form className="login-form" onSubmit={(e) => void onSubmit(e)}>
                <label className="login-field">
                  <span className="login-field__label">Seller email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="you@sellers.sympleone.app"
                  />
                </label>

                <label className="login-field">
                  <span className="login-field__label">Password</span>
                  <div className="login-field__password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      className="login-field__toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={loading}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                <div className="login-form__row">
                  <label className="login-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => onRememberMeChange(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                {displayError && (
                  <p className="login-error" role="alert">
                    {displayError}
                  </p>
                )}

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in to dashboard'}
                  {!loading && (
                    <span className="login-submit__chevron" aria-hidden>›</span>
                  )}
                </button>
              </form>

              <p className="login-connect__hint">
                New seller?{' '}
                <button
                  type="button"
                  className="login-forgot"
                  onClick={() => setPanelMode('connect')}
                >
                  Connect your Amazon account
                </button>
              </p>
            </>
          )}

          <p className="login-connect__hint login-panel__workspace-links">
            <Link to="/" className="login-forgot">
              Admin or employee login
            </Link>
          </p>

          <p className="login-security">
            <svg
              className="login-security__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Protected by enterprise-grade security.
          </p>
        </div>
      </section>
    </div>
  )
}
