import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

/** Placeholder for authenticated, read-only views. */
export function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user)

  return (
    <div className="home">
      <header className="home-header">
        <h1>Dashboard</h1>
        <Link to="/">Home</Link>
      </header>
      <main className="home-main">
        <p>Welcome{user?.name ? `, ${user.name}` : ''}.</p>
        <p>Add read-only data modules here; all API paths live in <code>src/config/api.config.ts</code>.</p>
      </main>
    </div>
  )
}
