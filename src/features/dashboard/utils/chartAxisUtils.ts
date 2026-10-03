/** Nice upper bound for chart Y scale (values already in lakhs). */
export function chartYMax(dataMax: number): number {
  if (dataMax <= 0) {
    return 1
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

export function formatLakhAxisLabel(value: number, currencySymbol: string): string {
  if (value === 0) {
    return `${currencySymbol}0`
  }
  if (value < 0.1) {
    return `${currencySymbol}${value.toFixed(2)}L`
  }
  if (value < 10) {
    const rounded = Math.round(value * 10) / 10
    return `${currencySymbol}${rounded}L`
  }
  return `${currencySymbol}${Math.round(value)}L`
}

/** Y-axis tick values with unique formatted labels. */
export function yAxisTicks(maxY: number, tickCount = 4): number[] {
  const raw = Array.from(
    { length: tickCount + 1 },
    (_, i) => (maxY * i) / tickCount,
  )
  const ticks: number[] = []
  const seen = new Set<string>()
  for (const value of raw) {
    const label = formatLakhAxisLabel(value, '')
    if (!seen.has(label)) {
      seen.add(label)
      ticks.push(value)
    }
  }
  if (ticks.length < 2) {
    return [0, maxY]
  }
  return ticks
}

/** Which point indices should show an x-axis label (avoid overlap). */
export function xLabelIndices(pointCount: number, maxLabels = 7): number[] {
  if (pointCount <= 0) {
    return []
  }
  if (pointCount <= maxLabels) {
    return Array.from({ length: pointCount }, (_, i) => i)
  }
  const indices: number[] = []
  const step = (pointCount - 1) / (maxLabels - 1)
  for (let i = 0; i < maxLabels; i += 1) {
    indices.push(Math.round(i * step))
  }
  return [...new Set(indices)]
}

/** Shorter x label when many points (e.g. full month). */
export function shortenXLabel(dateLabel: string, pointCount: number): string {
  if (pointCount <= 10) {
    return dateLabel
  }
  const dayOnly = dateLabel.replace(/^[A-Za-z]+\s+/, '')
  return dayOnly || dateLabel
}
