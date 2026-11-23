import { Link } from 'react-router-dom'
import { REPORT_CATALOG, type ReportCatalogItem } from './reportsCatalog'

interface AllReportsGridProps {
  reports?: ReportCatalogItem[]
  title?: string
  subtitle?: string
}

export function AllReportsGrid({
  reports = REPORT_CATALOG,
  title = 'All Reports',
  subtitle = 'Access detailed reports for sales, products, inventory, shipments, transactions and team performance.',
}: AllReportsGridProps) {
  const items = reports.filter((r) => r.id !== 'overview')

  return (
    <section className="reports-all" aria-labelledby="reports-all-heading">
      <header className="reports-all__head">
        <h2 id="reports-all-heading" className="reports-all__title">
          {title}
        </h2>
        <p className="reports-all__subtitle">{subtitle}</p>
      </header>
      <ul className="reports-all__grid">
        {items.map((report) => (
          <li key={report.id}>
            <Link to={`/app/reports/${report.slug}`} className="reports-all__card">
              <span className="reports-all__card-icon" aria-hidden>
                ◈
              </span>
              <span className="reports-all__card-title">{report.title}</span>
              <span className="reports-all__card-desc">{report.cardDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}