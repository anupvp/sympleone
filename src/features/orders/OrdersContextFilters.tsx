import { useEffect, useId, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useSellerAccountOptions } from '../dashboard/hooks/useSellerAccountOptions'
import { setFilters } from '../dashboard/state/dashboardSlice'
import { formatShortDate, resolveSalesDateRange, todayIsoDate } from '../dashboard/utils/salesPeriodUtils'
import './OrdersContextFilters.css'

const AMAZON_MARKETPLACE_ID = 'A21TJRUUN4KGV'
const AMAZON_MARKETPLACE_LABEL = 'Amazon'

export function OrdersContextFilters() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.dashboard.filters)
  const { needsSeller, options, selectedId, error, setSellerId } = useSellerAccountOptions()

  const popoverId = useId()
  const rangeRef = useRef<HTMLDivElement>(null)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(filters.dateFrom)
  const [draftTo, setDraftTo] = useState(filters.dateTo)

  useEffect(() => {
    if (filters.marketplaceId !== AMAZON_MARKETPLACE_ID) {
      dispatch(setFilters({ marketplaceId: AMAZON_MARKETPLACE_ID }))
    }
  }, [dispatch, filters.marketplaceId])

  useEffect(() => {
    setDraftFrom(filters.dateFrom)
    setDraftTo(filters.dateTo)
  }, [filters.dateFrom, filters.dateTo])

  useEffect(() => {
    if (!rangeOpen) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rangeRef.current?.contains(event.target as Node)) {
        setRangeOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [rangeOpen])

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

  const { dateFrom, dateTo } = resolveSalesDateRange(filters)
  const rangeLabel =
    dateFrom && dateTo ? `${formatShortDate(dateFrom)} – ${formatShortDate(dateTo)}` : 'Select dates'

  return (
    <div className="orders-context-filters">
      <div className="orders-context-field orders-context-field--market">
        <span className="orders-context-field__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 9h16v10H4zM8 9V6h8v3" />
          </svg>
        </span>
        <span className="orders-context-field__text">
          <span className="orders-context-field__title">Marketplace</span>
          <span className="orders-context-field__value">{AMAZON_MARKETPLACE_LABEL}</span>
        </span>
      </div>

      {needsSeller && (
        <label className="orders-context-field orders-context-field--seller">
          <span className="orders-context-field__icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 10h16v9H4zM9 10V6h6v4" />
            </svg>
          </span>
          <span className="orders-context-field__text">
            <span className="orders-context-field__title">Seller Account</span>
            <select
              className="orders-context-field__select"
              value={selectedId}
              onChange={(e) => setSellerId(e.target.value)}
              aria-label="Seller account"
            >
              <option value="">Select seller account</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </span>
          <span className="orders-context-field__chev" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </label>
      )}

      <div className="orders-context-field orders-context-field--range" ref={rangeRef}>
        <span className="orders-context-field__icon" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" />
          </svg>
        </span>
        <button
          type="button"
          className="orders-context-field__range-btn"
          aria-expanded={rangeOpen}
          aria-controls={popoverId}
          onClick={() => setRangeOpen((open) => !open)}
        >
          <span className="orders-context-field__text">
            <span className="orders-context-field__title">Date range</span>
            <span className="orders-context-field__value">{rangeLabel || 'Select dates'}</span>
          </span>
        </button>
        <span className="orders-context-field__chev" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        {rangeOpen && (
          <div id={popoverId} className="orders-context-range-popover" role="dialog" aria-label="Select date range">
            <p className="orders-context-range-popover__title">Select date range</p>
            <label className="orders-context-range-popover__field">
              <span>From</span>
              <input type="date" value={draftFrom} max={draftTo || todayIsoDate()} onChange={(e) => setDraftFrom(e.target.value)} />
            </label>
            <label className="orders-context-range-popover__field">
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
              <p className="orders-context-range-popover__preview">
                {formatShortDate(draftFrom)} – {formatShortDate(draftTo)}
              </p>
            )}
            <div className="orders-context-range-popover__actions">
              <button type="button" className="orders-context-range-popover__ghost" onClick={() => setRangeOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="orders-context-range-popover__primary"
                disabled={!draftFrom || !draftTo}
                onClick={applyRange}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="orders-context-filters__error" role="status">
          {error}
        </p>
      )}
    </div>
  )
}