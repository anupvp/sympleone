/** Format raw currency amounts for tooltips (not lakh chart units). */
export function formatSalesAmount(
  amount: number | null | undefined,
  currencySymbol: string,
): string {
  const safe = Number(amount)
  if (!Number.isFinite(safe)) {
    return `${currencySymbol}0`
  }
  const rounded = Math.round(safe * 100) / 100
  const formatted = rounded.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: rounded % 1 === 0 ? 0 : 2,
  })
  return `${currencySymbol}${formatted}`
}

export function formatOrderCount(count: number | null | undefined): string {
  const safe = Number(count)
  if (!Number.isFinite(safe)) {
    return '0'
  }
  return safe.toLocaleString('en-IN')
}

/** Integer-friendly Y-axis max for order count line. */
export function chartOrderYMax(dataMax: number): number {
  if (!Number.isFinite(dataMax) || dataMax <= 0) {
    return 1
  }
  if (dataMax <= 5) {
    return Math.max(1, Math.ceil(dataMax))
  }
  const exp = Math.floor(Math.log10(dataMax))
  const base = 10 ** exp
  const frac = dataMax / base
  let niceFrac = 10
  if (frac <= 1) {
    niceFrac = 1
  } else if (frac <= 2) {
    niceFrac = 2
  } else if (frac <= 5) {
    niceFrac = 5
  }
  return niceFrac * base
}

export function orderAxisTicks(maxY: number, tickCount = 4): number[] {
  if (maxY <= 1) {
    return [0, 1]
  }
  const raw = Array.from(
    { length: tickCount + 1 },
    (_, i) => Math.round((maxY * i) / tickCount),
  )
  const ticks: number[] = []
  const seen = new Set<number>()
  for (const value of raw) {
    if (!seen.has(value)) {
      seen.add(value)
      ticks.push(value)
    }
  }
  if (ticks.length < 2) {
    return [0, maxY]
  }
  return ticks
}
