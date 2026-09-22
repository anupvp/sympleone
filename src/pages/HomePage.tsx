import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'

export function HomePage() {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((s) => s.auth)

  return (
    <div className="home">
      <header className="home-header">
        <h1>SympleOne</h1>
        <nav className="home-nav">
          {accessToken && user ? (
            <>
              <span className="home-user">{user.email}</span>
              <button
                type="button"
                className="home-logout"
                onClick={() => void dispatch(logout())}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      <main className="home-main">
        <p>
          This app is read-only: it loads data from your API and does not
          mutate business records from the UI.
        </p>
        {!accessToken && (
          <p>
            <Link to="/login">Sign in</Link> to access protected views.
          </p>
        )}
      </main>
    </div>
  )
}
