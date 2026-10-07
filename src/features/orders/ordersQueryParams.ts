/** Build SP-API-style CreatedAfter / CreatedBefore from dashboard YYYY-MM-DD dates. */
export function ordersCreatedRange(dateFrom: string, dateTo: string): {
  CreatedAfter: string
  CreatedBefore: string
} {
  const CreatedAfter = `${dateFrom}T23:59:59Z`
  const [y, m, d] = dateTo.split('-').map((part) => Number.parseInt(part, 10))
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  const yyyy = next.getUTCFullYear()
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(next.getUTCDate()).padStart(2, '0')
  const CreatedBefore = `${yyyy}-${mm}-${dd}T00:00:00Z`
  return { CreatedAfter, CreatedBefore }
}
