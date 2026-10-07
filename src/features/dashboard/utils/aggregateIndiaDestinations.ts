import indiaMap from '@svg-maps/india'
import type { SalesDestination } from '../types/dashboard.types'

/** Amazon StateOrRegion labels (lowercased) → @svg-maps/india ids. */
const STATE_IDS: Record<string, string> = {
  'andaman and nicobar islands': 'an',
  'andaman & nicobar islands': 'an',
  'andaman and nicobar': 'an',
  'andhra pradesh': 'ap',
  'arunachal pradesh': 'ar',
  assam: 'as',
  bihar: 'br',
  chandigarh: 'ch',
  chhattisgarh: 'ct',
  chattisgarh: 'ct',
  'dadra and nagar haveli': 'dn',
  'dadra & nagar haveli': 'dn',
  'dadra and nagar haveli and daman and diu': 'dn',
  'daman and diu': 'dd',
  'daman & diu': 'dd',
  delhi: 'dl',
  'new delhi': 'dl',
  'nct of delhi': 'dl',
  'national capital territory of delhi': 'dl',
  goa: 'ga',
  gujarat: 'gj',
  haryana: 'hr',
  'himachal pradesh': 'hp',
  'jammu and kashmir': 'jk',
  'jammu & kashmir': 'jk',
  jharkhand: 'jh',
  karnataka: 'ka',
  kerala: 'kl',
  lakshadweep: 'ld',
  'madhya pradesh': 'mp',
  maharashtra: 'mh',
  manipur: 'mn',
  meghalaya: 'ml',
  mizoram: 'mz',
  nagaland: 'nl',
  odisha: 'or',
  orissa: 'or',
  puducherry: 'py',
  pondicherry: 'py',
  punjab: 'pb',
  rajasthan: 'rj',
  sikkim: 'sk',
  'tamil nadu': 'tn',
  'tamilnadu': 'tn',
  telangana: 'tg',
  tripura: 'tr',
  'uttar pradesh': 'up',
  uttarakhand: 'ut',
  uttaranchal: 'ut',
  'west bengal': 'wb',
}

export interface IndiaStateSales {
  id: string
  name: string
  amount: number
  orderCount: number
}

function stateId(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!key) {
    return null
  }
  if (STATE_IDS[key]) {
    return STATE_IDS[key]
  }
  if (key.length === 2 && indiaMap.locations.some((loc) => loc.id === key)) {
    return key
  }
  return null
}

/** Group sales-trend delivery destinations onto Indian states. */
export function aggregateIndiaDestinations(
  destinations: SalesDestination[] | null | undefined,
): IndiaStateSales[] {
  const names = new Map(indiaMap.locations.map((loc) => [loc.id, loc.name]))
  const buckets = new Map<string, IndiaStateSales>()

  for (const row of destinations ?? []) {
    const id = stateId(row.state)
    if (!id) {
      continue
    }
    const amount = Number(row.amount) || 0
    const orderCount = Number(row.orderCount) || 0
    const existing = buckets.get(id)
    if (existing) {
      existing.amount += amount
      existing.orderCount += orderCount
    } else {
      buckets.set(id, {
        id,
        name: names.get(id) ?? row.state,
        amount,
        orderCount,
      })
    }
  }

  return [...buckets.values()].sort((a, b) => b.amount - a.amount)
}
