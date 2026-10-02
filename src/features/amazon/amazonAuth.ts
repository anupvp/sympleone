/** True when the session can call the real Symple API (not a dev relaxed mock token). */
export function hasRealApiAccessToken(accessToken: string | null | undefined): boolean {
  if (!accessToken) {
    return false
  }
  return !accessToken.startsWith('relaxed.')
}
