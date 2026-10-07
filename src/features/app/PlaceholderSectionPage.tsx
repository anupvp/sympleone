import { AppShell } from '../../layout/AppShell'
import { DashboardToolbar } from '../dashboard/layout/DashboardToolbar'
import './PlaceholderSectionPage.css'

interface PlaceholderSectionPageProps {
  title: string
  description: string
}

export function PlaceholderSectionPage({ title, description }: PlaceholderSectionPageProps) {
  return (
    <AppShell toolbar={<DashboardToolbar />}>
      <div className="placeholder-section">
        <h1>{title}</h1>
        <p>{description}</p>
        <p className="placeholder-section__hint">This section is coming soon.</p>
      </div>
    </AppShell>
  )
}
