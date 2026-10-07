import { Sparkline } from '../../components/Sparkline'
import type { StatCardData } from '../../types/dashboard.types'

const iconPaths: Record<StatCardData['icon'], string> = {
  gmv: 'M3 7h18M3 12h12M3 17h15',
  netSales: 'M4 16l4-4 4 3 5-6 3 4',
  profit: 'M12 3v18M6 9h12M8 15h8',
  profitPercent: 'M12 6v12M8 10h8M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
}

export function StatCard({ metric }: { metric: StatCardData }) {
  const positive = metric.changePercent >= 0
  const spark = metric.sparkline ?? [10, 12, 11, 14, 13, 15, 14, 16, 18]

  return (
    <article className={`stat-card stat-card--${metric.accent}`}>
      <div className="stat-card__top">
        <div>
          <p className="stat-card__label">{metric.label}</p>
          <p className="stat-card__value">{metric.value}</p>
          <p className={`stat-card__change ${positive ? 'is-up' : 'is-down'}`}>
            {positive ? '↑' : '↓'} {Math.abs(metric.changePercent).toFixed(1)}%{' '}
            <span className="stat-card__compare-inline">{metric.comparisonLabel}</span>
          </p>
          {metric.subline && <p className="stat-card__subline">{metric.subline}</p>}
        </div>
        <div className="stat-card__spark">
          <Sparkline values={spark} width={88} height={36} positive={positive} />
        </div>
      </div>
      <div className="stat-card__icon" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d={iconPaths[metric.icon]} />
        </svg>
      </div>
    </article>
  )
}
