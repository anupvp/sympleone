import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { setGlobalSearchQuery } from './layoutSlice'

export function HeaderGlobalSearch() {
  const dispatch = useAppDispatch()
  const query = useAppSelector((s) => s.layout.globalSearchQuery)

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        const input = document.getElementById('app-global-search') as HTMLInputElement | null
        input?.focus()
      }
    },
    [],
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  return (
    <div className="app-shell__search">
      <svg className="app-shell__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <input
        id="app-global-search"
        type="search"
        className="app-shell__search-input"
        placeholder="Search by Order ID, ASIN, SKU, Buyer…"
        value={query}
        onChange={(e) => dispatch(setGlobalSearchQuery(e.target.value))}
        aria-label="Global search"
      />
      <kbd className="app-shell__search-kbd" aria-hidden>
        ⌘ K
      </kbd>
    </div>
  )
}