import { Link, Navigate, useParams } from 'react-router-dom'
import { reportBySlug } from './reportsCatalog'
import { ReportPageHeader } from './ReportPageHeader'
import './ReportsPage.css'

export function ReportHubPage() {
  const { reportSlug } = useParams()
  const report = reportSlug ? reportBySlug(reportSlug) : undefined

  if (!report || report.id === 'overview' || report.id === 'transaction') {
    return <Navigate to="/app/reports/overview" replace />
  }

  return (
    <div className="reports-page">
      <ReportPageHeader report={report} />
      <div className="reports-hub">
        <p className="reports-hub__lead">
          This report workspace is ready in SympleOne navigation. Use the linked workspace below while
          dedicated charts for <strong>{report.title}</strong> are expanded.
        </p>
        {report.workspacePath && (
          <Link to={report.workspacePath} className="reports-hub__cta">
            {report.workspaceLabel ?? 'Open workspace'} →
          </Link>
        )}
        <ul className="reports-hub__checks">
          <li>Date range and marketplace filters apply from the toolbar above.</li>
          <li>Data is loaded from your connected Amazon seller account (SP-API).</li>
          <li>Admin-only reports respect your organization permissions.</li>
        </ul>
      </div>
    </div>
  )
}