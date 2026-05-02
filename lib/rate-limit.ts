const requests = new Map<string, { count: number; timestamp: number }>()

export function rateLimit(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = requests.get(ip)

  if (!entry || now - entry.timestamp > windowMs) {
    requests.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
