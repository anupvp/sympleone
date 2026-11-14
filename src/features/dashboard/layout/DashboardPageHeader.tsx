interface DashboardPageHeaderProps {
  onExportReport?: () => void
  exportLoading?: boolean
  exportDisabled?: boolean
  exportError?: string | null
}

export function DashboardPageHeader({
  onExportReport,
  exportLoading = false,
  exportDisabled = false,
  exportError,
}: DashboardPageHeaderProps) {
  return (
    <header className="dash-page-header">
      <h1 className="dash-page-header__title">Dashboard</h1>
      <div className="dash-page-header__export-wrap">
        {exportError ? (
          <p className="dash-page-header__export-error" role="alert">
            {exportError}
          </p>
        ) : null}
        <button
          type="button"
          className="dash-page-header__export"
          onClick={onExportReport}
          disabled={exportDisabled || exportLoading || !onExportReport}
        >
          {exportLoading ? 'Preparing report…' : 'Export Report'}
        </button>
      </div>
    </header>
  )
}