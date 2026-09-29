import type { AlertActionItem } from '../../types/dashboard.types'

export function AlertActionCard({ item }: { item: AlertActionItem }) {
  return (
    <article className={`alert-card alert-card--${item.tone}`}>
      <p className="alert-card__count">{item.count}</p>
      <p className="alert-card__title">{item.title}</p>
      <button type="button" className="alert-card__link">
        View Details →
      </button>
    </article>
  )
}
