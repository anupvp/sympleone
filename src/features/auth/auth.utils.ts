import type { AuthUser, UserRole } from './types'

export function isAdminUser(user: AuthUser | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isSellerUser(user: AuthUser | null | undefined): boolean {
  return user?.role === 'seller'
}

export function roleLabel(role: UserRole | undefined): string {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'employee':
      return 'Employee'
    case 'seller':
      return 'Seller'
    default:
      return 'User'
  }
}
