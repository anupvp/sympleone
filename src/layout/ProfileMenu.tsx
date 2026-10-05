import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { isAdminUser, isSellerUser } from '../features/auth/auth.utils'
import './ProfileMenu.css'

export function ProfileMenu() {
  const user = useAppSelector((s) => s.auth.user)
  const popoverId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const displayName = user?.name ?? user?.email ?? 'User'
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    if (!open) {
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const admin = isAdminUser(user)
  const seller = isSellerUser(user)

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className="profile-menu__trigger"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="profile-menu__avatar">{initials}</span>
        <span className="profile-menu__name">{displayName}</span>
      </button>
      {open && (
        <div id={popoverId} className="profile-menu__panel" role="menu">
          <Link to="/account/profile" className="profile-menu__item" onClick={() => setOpen(false)}>
            Profile
          </Link>
          {seller && (
            <Link to="/account/password" className="profile-menu__item" onClick={() => setOpen(false)}>
              Change password
            </Link>
          )}
          {admin && (
            <>
              <Link to="/admin/sellers" className="profile-menu__item" onClick={() => setOpen(false)}>
                Manage sellers
              </Link>
              <Link to="/admin/employees" className="profile-menu__item" onClick={() => setOpen(false)}>
                Manage employees
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
