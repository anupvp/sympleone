import { useMemo, useState } from 'react'
import indiaMap from '@svg-maps/india'
import { formatSalesAmount } from '../../utils/salesTrendFormat'

const FILL_EMPTY = '#e8ecf3'
const FILL_MIN = '#ddd6fe'
const FILL_MAX = '#6d28d9'

function salesFill(amount: number, max: number): string {
  if (amount <= 0 || max <= 0) {
    return FILL_EMPTY
  }
  const t = Math.min(1, amount / max)
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t)
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
  const [r0, g0, b0] = parse(FILL_MIN)
  const [r1, g1, b1] = parse(FILL_MAX)
  const r = mix(r0, r1)
  const g = mix(g0, g1)
  const b = mix(b0, b1)
  return `rgb(${r}, ${g}, ${b})`
}

interface IndiaSalesMapProps {
  salesByStateId: Record<string, number>
  currencySymbol: string
}

export function IndiaSalesMap({ salesByStateId, currencySymbol }: IndiaSalesMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const maxSales = useMemo(() => {
    const values = Object.values(salesByStateId)
    return values.length > 0 ? Math.max(...values, 0) : 0
  }, [salesByStateId])

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
              fill={salesFill(amount, maxSales)}
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
