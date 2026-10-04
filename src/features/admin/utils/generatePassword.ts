/** Random password for new employee accounts (meets typical 8+ char policy). */
export function generateEmployeePassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = upper + lower + digits + symbols

  const pick = (chars: string) => {
    const n = crypto.getRandomValues(new Uint32Array(1))[0]
    return chars[n % chars.length]
  }

  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  while (chars.length < length) {
    chars.push(pick(all))
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
