type ExportUiState = 'idle' | 'loading' | 'success' | 'error'

interface DashboardPageHeaderProps {
  onExportReport?: () => void | Promise<void>
  exportState?: ExportUiState
  exportDisabled?: boolean
  exportMessage?: string | null
}

export function DashboardPageHeader({
  onExportReport,
  exportState = 'idle',
  exportDisabled = false,
  exportMessage,
}: DashboardPageHeaderProps) {
  const loading = exportState === 'loading'
  const canExport = Boolean(onExportReport) && !exportDisabled && !loading

  const handleClick = () => {
    if (!canExport || !onExportReport) {
      return
    }
    void onExportReport()
  }

  let buttonLabel = 'Export Report'
  if (loading) {
    buttonLabel = 'Preparing report…'
  } else if (exportState === 'success') {
    buttonLabel = 'Downloaded'
  }

  return (
    <header className="dash-page-header">
      <div className="dash-page-header__lead">
        <h1 className="dash-page-header__title">Dashboard</h1>
        {exportMessage ? (
          <p
            className={`dash-page-header__export-banner dash-page-header__export-banner--${exportState}`}
            role="status"
            aria-live="polite"
          >
            {exportMessage}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="dash-page-header__export"
        onClick={handleClick}
        disabled={!canExport}
        aria-busy={loading}
      >
        {buttonLabel}
      </button>
    </header>
  )
}