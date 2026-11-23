import type { ReactNode } from 'react'
import type { ReportCatalogItem } from './reportsCatalog'

interface ReportPageHeaderProps {
  report: ReportCatalogItem
  actions?: ReactNode
}

export function ReportPageHeader({ report, actions }: ReportPageHeaderProps) {
  return (
    <header className="reports-page__head">
      <div>
        <h1 className="reports-page__title">{report.title}</h1>
        <p className="reports-page__meta">{report.description}</p>
      </div>
      {actions}
    </header>
  )
}