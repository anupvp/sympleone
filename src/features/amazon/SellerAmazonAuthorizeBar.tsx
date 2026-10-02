import { useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { AMAZON_DEFAULT_MARKETPLACE_ID } from '../../config/api.config'
import { ApiError } from '../../api/httpClient'
import { isSellerUser } from '../auth/auth.utils'
import { startAmazonConnect } from './amazonApi'
import './SellerAmazonAuthorizeBar.css'

export function SellerAmazonAuthorizeBar() {
  const user = useAppSelector((s) => s.auth.user)
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isSellerUser(user) || !accessToken) {
    return null
  }

  const onAuthorize = async () => {
    setError(null)
    setLoading(true)
    try {
      const { authorization_url } = await startAmazonConnect(
        AMAZON_DEFAULT_MARKETPLACE_ID,
        { accessToken },
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

  return (
    <div className="seller-amazon-bar" role="region" aria-label="Amazon authorization">
      <div className="seller-amazon-bar__text">
        <strong>Connect Amazon</strong>
        <span>
          Authorize Symple One to access your Amazon seller account so your agency can
          manage orders and inventory on your behalf.
        </span>
      </div>
      <div className="seller-amazon-bar__actions">
        {error && (
          <p className="seller-amazon-bar__error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="seller-amazon-bar__btn"
          disabled={loading}
          onClick={() => void onAuthorize()}
        >
          {loading ? 'Opening…' : 'Authorize'}
        </button>
      </div>
    </div>
  )
}
