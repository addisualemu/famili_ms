const ITERATIONS = 100_000

export function requiresPin(member: { role: string; tier?: string }): boolean {
  return member.role === 'parent' || member.tier === 'senior'
}

export async function hashPin(pin: string): Promise<string> {
  assertPin(pin)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const digest = await derive(pin, salt, ITERATIONS)
  return `pbkdf2:${ITERATIONS}:${encode(salt)}:${encode(digest)}`
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false
  const [scheme, rounds, saltText, digestText] = stored.split(':')
  const iterations = Number(rounds)
  if (scheme !== 'pbkdf2' || !Number.isInteger(iterations) || iterations < 1 || !saltText || !digestText) {
    return false
  }
  const actual = await derive(pin, decode(saltText), iterations)
  return timingSafeEqual(encode(actual), digestText)
}

function assertPin(pin: string) {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be 4 digits.')
  }
}

async function derive(pin: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256,
  )
  return new Uint8Array(bits)
}

function encode(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decode(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}
