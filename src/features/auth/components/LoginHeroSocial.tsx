import { useEffect, useState } from 'react'
import { fetchPublicSellerCount } from '../publicStatsApi'

function sellerCountLabel(total: number | null): string {
  if (total === null) {
    return 'Seller accounts ready to monitor'
  }
  if (total === 0) {
    return 'No seller accounts yet'
  }
  if (total === 1) {
    return '1 seller account ready to monitor'
  }
  return `${total.toLocaleString()} seller accounts ready to monitor`
}

export function LoginHeroSocial() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchPublicSellerCount()
      .then((data) => {
        if (!cancelled) {
          setTotal(data.total)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTotal(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="login-hero__social">
      <div className="login-hero__avatars" aria-hidden>
        <span>NR</span>
        <span>UN</span>
        <span>BE</span>
      </div>
      <p>{sellerCountLabel(total)}</p>
    </div>
  )
}
