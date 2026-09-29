import { type FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { clearAuthError, login } from './authSlice'
import {
  DEFAULT_REMEMBER_ME,
  loadAnySavedEmail,
  persistLoginEmail,
} from './loginRememberStorage'
import './LoginPage.css'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error, accessToken } = useAppSelector((s) => s.auth)

  const [rememberMe, setRememberMe] = useState(DEFAULT_REMEMBER_ME)
  const [email, setEmail] = useState(() => loadAnySavedEmail())
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/dashboard'

  useEffect(() => {
    if (accessToken) {
      navigate(from, { replace: true })
    }
  }, [accessToken, from, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

  useEffect(() => {
    persistLoginEmail(email, rememberMe)
  }, [email, rememberMe])

  useEffect(() => {
    const saveDraft = () => persistLoginEmail(email, rememberMe)
    window.addEventListener('pagehide', saveDraft)
    return () => window.removeEventListener('pagehide', saveDraft)
  }, [email, rememberMe])

  const onRememberMeChange = (checked: boolean) => {
    setRememberMe(checked)
    persistLoginEmail(email, checked)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    persistLoginEmail(email, rememberMe)
    void dispatch(login({ email, password }))
  }

  const loading = status === 'loading'

  return (
    <div className="login-page">
      <aside className="login-hero" aria-hidden={false}>
        <div className="login-hero__rings" aria-hidden />
        <div className="login-hero__content">
          <img
            className="login-hero__logo"
            src="/symple-logo.svg"
            alt="Symple"
            width={120}
            height={28}
          />

          <p className="login-hero__eyebrow">UNIFIED COMMERCE OPERATIONS</p>
          <h1 className="login-hero__title">
            Every seller account.
            <span className="login-hero__title-accent">One clear view.</span>
          </h1>
          <p className="login-hero__desc">
            Monitor orders, returns, inventory and reconciliation across every
            marketplace—from a single operations command center.
          </p>

          <div className="login-hero__social">
            <div className="login-hero__avatars" aria-hidden>
              <span>NR</span>
              <span>UN</span>
              <span>BE</span>
            </div>
            <p>12 seller accounts ready to monitor</p>
          </div>
        </div>
      </aside>

      <section className="login-panel">
        <div className="login-panel__inner">
          <header className="login-panel__header">
            <p className="login-panel__eyebrow">SECURE WORKSPACE</p>
            <h2 className="login-panel__title">Welcome back</h2>
            <p className="login-panel__subtitle">
              Sign in to your SympleOne workspace.
            </p>
          </header>

          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-field">
              <span className="login-field__label">Work email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="ops@sympleone.com"
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
              <button type="button" className="login-forgot">
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
              {!loading && <span className="login-submit__chevron" aria-hidden>›</span>}
            </button>
          </form>

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
