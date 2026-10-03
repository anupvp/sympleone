import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../layout/AppShell'
import { useAppSelector } from '../../app/hooks'
import { ApiError } from '../../api/httpClient'
import { changePasswordRequest } from '../auth/authApi'
import './ChangePasswordPage.css'

export function ChangePasswordPage() {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const user = useAppSelector((s) => s.auth.user)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (!accessToken) {
      setError('You are not signed in.')
      return
    }

    setLoading(true)
    try {
      await changePasswordRequest(accessToken, {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Could not update password'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="change-password-page">
        <div className="change-password-card">
          <h1>Change password</h1>
          <p className="change-password-card__lead">
            Update the password for <strong>{user?.email}</strong>. Use at least 6
            characters.
          </p>

          {success && (
            <p className="change-password-card__success" role="status">
              Your password was updated. Use the new password next time you sign in.
            </p>
          )}
          {error && (
            <p className="change-password-card__error" role="alert">
              {error}
            </p>
          )}

          <form className="change-password-form" onSubmit={(e) => void onSubmit(e)}>
            <label className="change-password-form__field">
              <span>Current password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="change-password-form__field">
              <span>New password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <label className="change-password-form__field">
              <span>Confirm new password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            <div className="change-password-form__actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Update password'}
              </button>
              <Link to="/dashboard">Back to dashboard</Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
