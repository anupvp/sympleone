import { useMemo, useState } from 'react'
import indiaMap from '@svg-maps/india'
import { formatSalesAmount } from '../../utils/salesTrendFormat'

/** Fixed fill per state id from @svg-maps/india. */
const STATE_COLORS: Record<string, string> = {
  an: '#5eead4',
  ap: '#fb923c',
  ar: '#a3e635',
  as: '#38bdf8',
  br: '#f472b6',
  ch: '#facc15',
  ct: '#c084fc',
  dn: '#2dd4bf',
  dd: '#67e8f9',
  dl: '#f87171',
  ga: '#4ade80',
  gj: '#fbbf24',
  hr: '#818cf8',
  hp: '#34d399',
  jk: '#60a5fa',
  jh: '#fb7185',
  ka: '#a78bfa',
  kl: '#22c55e',
  ld: '#22d3ee',
  mp: '#f59e0b',
  mh: '#8b5cf6',
  mn: '#e879f9',
  ml: '#84cc16',
  mz: '#14b8a6',
  nl: '#f97316',
  or: '#3b82f6',
  py: '#ec4899',
  pb: '#eab308',
  rj: '#ef4444',
  sk: '#10b981',
  tn: '#6366f1',
  tg: '#d946ef',
  tr: '#06b6d4',
  up: '#f43f5e',
  ut: '#0ea5e9',
  wb: '#15803d',
}

const EMPTY_STATE_COLOR = '#e2e8f0'

interface IndiaSalesMapProps {
  salesByStateId: Record<string, number>
  currencySymbol: string
}

export function IndiaSalesMap({ salesByStateId, currencySymbol }: IndiaSalesMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeLocation = useMemo(
    () => indiaMap.locations.find((loc) => loc.id === activeId),
    [activeId],
  )

  const activeAmount = activeId ? salesByStateId[activeId] ?? 0 : 0

  return (
    <div className="india-map">
      <svg
        className="india-map__svg"
        viewBox={indiaMap.viewBox}
        role="img"
        aria-label="Sales by Indian state"
      >
        {indiaMap.locations.map((loc) => {
          const amount = salesByStateId[loc.id] ?? 0
          const isActive = activeId === loc.id
          return (
            <path
              key={loc.id}
              d={loc.path}
              className={`india-map__state${isActive ? ' india-map__state--active' : ''}`}
              fill={amount > 0 ? (STATE_COLORS[loc.id] ?? EMPTY_STATE_COLOR) : EMPTY_STATE_COLOR}
              onMouseEnter={() => setActiveId(loc.id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(loc.id)}
              onBlur={() => setActiveId(null)}
              tabIndex={0}
              aria-label={`${loc.name}${amount > 0 ? `, ${formatSalesAmount(amount, currencySymbol)}` : ''}`}
            />
          )
        })}
      </svg>
      <div className="india-map__legend" aria-live="polite">
        {activeLocation ? (
          <>
            <strong>{activeLocation.name}</strong>
            <span>
              {activeAmount > 0
                ? formatSalesAmount(activeAmount, currencySymbol)
                : 'No sales'}
            </span>
          </>
        ) : (
          <span className="india-map__legend-hint">Hover a state for sales</span>
        )}
      </div>
    </div>
  )
}
