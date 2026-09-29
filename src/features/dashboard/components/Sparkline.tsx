interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  positive?: boolean
}

export function Sparkline({
  values,
  width = 72,
  height = 28,
  positive = true,
}: SparklineProps) {
  if (values.length < 2) {
    return null
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = width / (values.length - 1)

  const points = values
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const stroke = positive ? '#22c55e' : '#ef4444'

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
