/** Human-readable marketplace names for Amazon marketplace IDs. */
export const AMAZON_MARKETPLACE_LABELS: Record<string, string> = {
  A21TJRUUN4KGV: 'India',
}

export function marketplaceLabel(marketplaceId: string | null | undefined): string {
  if (!marketplaceId) {
    return 'Amazon'
  }
  return AMAZON_MARKETPLACE_LABELS[marketplaceId] ?? marketplaceId
}
