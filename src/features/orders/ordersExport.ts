import type { OrderRow } from './ordersApi'
import { orderStatusTabId } from './orderMetrics'

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadOrdersCsv(rows: OrderRow[], filename: string) {
  const header = [
    'Order ID',
    'Purchase date',
    'Status',
    'Fulfillment',
    'Items shipped',
    'Items unshipped',
    'Total',
    'Currency',
    'Ship city',
    'Ship state',
  ]
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        row.amazon_order_id,
        row.purchase_date ?? '',
        orderStatusTabId(row),
        row.fulfillment_label,
        String(row.number_of_items_shipped),
        String(row.number_of_items_unshipped),
        row.order_total?.amount ?? '',
        row.order_total?.currency_code ?? '',
        row.ship_city ?? '',
        row.ship_state ?? '',
      ]
        .map((v) => escapeCsv(v))
        .join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}