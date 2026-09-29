import type { AccountStatus, AssignedSeller } from '../types'

interface AssignedSellerTagsProps {
  sellers: AssignedSeller[]
  onRemove: (sellerId: string) => void
  disabled?: boolean
}

function tagClassName(status: AccountStatus | undefined): string {
  if (status === 'suspended') return 'admin-tag admin-tag--suspended'
  if (status === 'deleted') return 'admin-tag admin-tag--deleted'
  return 'admin-tag admin-tag--active'
}

export function AssignedSellerTags({ sellers, onRemove, disabled }: AssignedSellerTagsProps) {
  if (sellers.length === 0) {
    return <span className="admin-muted">—</span>
  }

  return (
    <div className="admin-tags" role="list">
      {sellers.map((seller) => (
        <span
          key={seller.id}
          className={tagClassName(seller.status)}
          role="listitem"
          title={
            seller.status === 'suspended'
              ? `${seller.full_name} (suspended)`
              : seller.status === 'deleted'
                ? `${seller.full_name} (deleted)`
                : seller.full_name
          }
        >
          <span className="admin-tag__label">{seller.full_name}</span>
          <button
            type="button"
            className="admin-tag__remove"
            aria-label={`Remove ${seller.full_name}`}
            disabled={disabled}
            onClick={() => onRemove(seller.id)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
