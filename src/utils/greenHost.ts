/** Allowed GREEN-API hosts from instance console (apiUrl). */
export function isAllowedGreenApiHost(host: string): boolean {
  const normalized = host.trim().toLowerCase()
  return (
    normalized === 'api.green-api.com' ||
    /^\d+\.api\.green-api\.com$/.test(normalized)
  )
}

export function getGreenApiHostname(apiUrl: string): string | null {
  try {
    const host = new URL(apiUrl).hostname.toLowerCase()
    return isAllowedGreenApiHost(host) ? host : null
  } catch {
    return null
  }
}
