import { COUNTRY_LANG, isLang, type Lang } from './config'

const TZ_COUNTRY: Record<string, string> = {
  'Asia/Dubai': 'AE', 'Asia/Muscat': 'OM', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Bahrain': 'BH',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Europe/London': 'GB', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES',
  'Europe/Vienna': 'AT', 'Europe/Brussels': 'BE', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Dublin': 'IE', 'Europe/Lisbon': 'PT',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US',
}

/** Coarse, privacy-friendly country guess: no geolocation permission, no precise location. */
export function guessCountryLocal(): string | undefined {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TZ_COUNTRY[tz]) return TZ_COUNTRY[tz]
  } catch { /* ignore */ }
  try {
    for (const l of navigator.languages ?? [navigator.language]) {
      const r = l.split('-')[1]
      if (r && r.length === 2) return r.toUpperCase()
    }
  } catch { /* ignore */ }
  return undefined
}

/** Country from the edge function (`/api/geo`, uses the CDN's coarse IP→country header only), else local guess. */
export async function detectCountry(): Promise<string | undefined> {
  try {
    const ctl = new AbortController()
    const to = setTimeout(() => ctl.abort(), 2500)
    const r = await fetch('/api/geo', { signal: ctl.signal, headers: { accept: 'application/json' } })
    clearTimeout(to)
    if (r.ok && (r.headers.get('content-type') ?? '').includes('json')) {
      const j = (await r.json()) as { country?: string }
      if (j.country && /^[A-Z]{2}$/.test(j.country)) return j.country
    }
  } catch { /* fall through */ }
  return guessCountryLocal()
}

export function browserLang(): Lang | undefined {
  try {
    for (const l of navigator.languages ?? [navigator.language]) {
      const c = l.toLowerCase().split('-')[0]
      if (isLang(c)) return c
    }
  } catch { /* ignore */ }
  return undefined
}

export const langForCountry = (c?: string): Lang | undefined => (c ? COUNTRY_LANG[c] : undefined)
