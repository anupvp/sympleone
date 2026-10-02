import type { AuthUser } from '../auth/types'

const STORAGE_KEY = 'symple_amazon_onboarding'

export interface AmazonOnboardingPayload {
  sellingPartnerId: string
  accessToken: string
  user: AuthUser
  newAccount?: {
    email: string
    password: string
  }
}

export function saveAmazonOnboarding(payload: AmazonOnboardingPayload): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadAmazonOnboarding(
  sellingPartnerId: string | null,
): AmazonOnboardingPayload | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as AmazonOnboardingPayload
    if (
      sellingPartnerId &&
      parsed.sellingPartnerId &&
      parsed.sellingPartnerId !== sellingPartnerId
    ) {
      return null
    }
    if (!parsed.accessToken || !parsed.user?.id) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearAmazonOnboarding(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
