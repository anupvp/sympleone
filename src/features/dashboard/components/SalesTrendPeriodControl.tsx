import { useEffect, useId, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { setFilters } from '../state/dashboardSlice'
import type { SalesPeriodMode } from '../types/dashboard.types'
import {
  MONTH_LABELS,
  formatSalesPeriodLabel,
  formatShortDate,
  todayIsoDate,
  yearOptions,
} from '../utils/salesPeriodUtils'
import './SalesTrendPeriodControl.css'

export function SalesTrendPeriodControl() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.dashboard.filters)
  const popoverId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  const [rangeOpen, setRangeOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(filters.dateFrom)
  const [draftTo, setDraftTo] = useState(filters.dateTo)

  useEffect(() => {
    if (filters.salesPeriodMode === 'dateRange') {
      setDraftFrom(filters.dateFrom)
      setDraftTo(filters.dateTo)
    }
  }, [filters.dateFrom, filters.dateTo, filters.salesPeriodMode])

  useEffect(() => {
    if (!rangeOpen) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setRangeOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [rangeOpen])

  const onModeChange = (mode: SalesPeriodMode) => {
    dispatch(setFilters({ salesPeriodMode: mode }))
    if (mode === 'dateRange') {
      setRangeOpen(true)
    }
  }

  const applyRange = () => {
    let from = draftFrom
    let to = draftTo
    if (from && to && from > to) {
      ;[from, to] = [to, from]
    }
    dispatch(
      setFilters({
        salesPeriodMode: 'dateRange',
        dateFrom: from,
        dateTo: to,
      }),
    )
    setRangeOpen(false)
  }

  const { salesPeriodMode } = filters
  const years = yearOptions(filters.salesYear)

  return (
    <div className="sales-period" ref={rootRef} aria-label="Date range">
      <select
        className="dash-select dash-select--sm sales-period__mode"
        value={salesPeriodMode}
        onChange={(e) => onModeChange(e.target.value as SalesPeriodMode)}
        aria-label="Sales period type"
      >
        <option value="daily">Daily</option>
        <option value="monthly">Monthly</option>
        <option value="dateRange">Date range</option>
      </select>

      {salesPeriodMode === 'daily' && (
        <input
          type="date"
          className="sales-period__date-input"
          value={filters.salesDailyDate}
          max={todayIsoDate()}
          onChange={(e) =>
            dispatch(
              setFilters({
                salesPeriodMode: 'daily',
                salesDailyDate: e.target.value,
              }),
            )
          }
          aria-label="Select day"
        />
      )}

      {salesPeriodMode === 'monthly' && (
        <div className="sales-period__monthly">
          <select
            className="dash-select dash-select--sm"
            value={filters.salesMonth}
            onChange={(e) =>
              dispatch(
                setFilters({
                  salesPeriodMode: 'monthly',
                  salesMonth: Number(e.target.value),
                }),
              )
            }
            aria-label="Select month"
          >
            {MONTH_LABELS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="dash-select dash-select--sm"
            value={filters.salesYear}
            onChange={(e) =>
              dispatch(
                setFilters({
                  salesPeriodMode: 'monthly',
                  salesYear: Number(e.target.value),
                }),
              )
            }
            aria-label="Select year"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}

      {salesPeriodMode === 'dateRange' && (
        <div className="sales-period__range">
          <button
            type="button"
            className="sales-period__range-trigger"
            aria-expanded={rangeOpen}
            aria-controls={popoverId}
            onClick={() => setRangeOpen((open) => !open)}
          >
            {formatSalesPeriodLabel(filters)}
          </button>
          {rangeOpen && (
            <div
              id={popoverId}
              className="sales-period__popover"
              role="dialog"
              aria-label="Select date range"
            >
              <p className="sales-period__popover-title">Select date range</p>
              <label className="sales-period__field">
                <span>From</span>
                <input
                  type="date"
                  value={draftFrom}
                  max={draftTo || todayIsoDate()}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
              </label>
              <label className="sales-period__field">
                <span>To</span>
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom}
                  max={todayIsoDate()}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </label>
              {draftFrom && draftTo && (
                <p className="sales-period__preview">
                  {formatShortDate(draftFrom)} – {formatShortDate(draftTo)}
                </p>
              )}
              <div className="sales-period__popover-actions">
                <button
                  type="button"
                  className="sales-period__btn sales-period__btn--ghost"
                  onClick={() => setRangeOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="sales-period__btn sales-period__btn--primary"
                  disabled={!draftFrom || !draftTo}
                  onClick={applyRange}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
