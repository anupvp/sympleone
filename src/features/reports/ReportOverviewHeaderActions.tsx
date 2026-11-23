import { useEffect, useRef, useState } from 'react'

interface ReportOverviewHeaderActionsProps {
  onPrepare: () => void
  prepareDisabled?: boolean
  prepareBusy?: boolean
  onExportOverview: () => void
  onExportListings: () => void
  exportBusy?: boolean
}

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 11h16" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3v10M8 11l4 4 4-4M5 20h14" />
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 4h9l5 5v11H6zM14 4v6h6" />
    </svg>
  )
}

export function ReportOverviewHeaderActions({
  onPrepare,
  prepareDisabled,
  prepareBusy,
  onExportOverview,
  onExportListings,
  exportBusy,
}: ReportOverviewHeaderActionsProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const [scheduleNote, setScheduleNote] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) {
      return
    }
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [exportOpen])

  const handleSchedule = () => {
    setScheduleNote('Report scheduling will be available in a future update.')
    window.setTimeout(() => setScheduleNote(null), 5000)
  }

  return (
    <div className="reports-head-actions">
      {scheduleNote && (
        <p className="reports-head-actions__note" role="status">
          {scheduleNote}
        </p>
      )}
      <button type="button" className="reports-head-btn reports-head-btn--outline" onClick={handleSchedule}>
        <IconCalendar />
        Schedule Report
      </button>
      <div className="reports-export" ref={menuRef}>
        <button
          type="button"
          className="reports-head-btn reports-head-btn--outline reports-head-btn--export"
          onClick={() => setExportOpen((v) => !v)}
          aria-expanded={exportOpen}
          aria-haspopup="menu"
          disabled={exportBusy}
        >
          <IconDownload />
          {exportBusy ? 'Exporting…' : 'Export'}
          <IconChevron />
        </button>
        {exportOpen && (
          <ul className="reports-export__menu" role="menu">
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="reports-export__item"
                onClick={() => {
                  setExportOpen(false)
                  onExportOverview()
                }}
              >
                Overview summary (CSV)
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="reports-export__item"
                onClick={() => {
                  setExportOpen(false)
                  onExportListings()
                }}
              >
                Merchant listings (Excel)
              </button>
            </li>
          </ul>
        )}
      </div>
      <button
        type="button"
        className="reports-head-btn reports-head-btn--primary"
        onClick={onPrepare}
        disabled={prepareDisabled || prepareBusy}
      >
        <IconFile />
        {prepareBusy ? 'Preparing…' : 'Prepare Report'}
      </button>
    </div>
  )
}