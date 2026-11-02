import { CUR_CODES, SOURCE_CUR, type Cur } from './config'
import { store } from './storage'

export type Rates = Partial<Record<Cur, number>>
const KEY = 'rates.v1'
const TTL = 12 * 3600 * 1000

export function cachedRates(): { rates: Rates; at: number } | null {
  try { const j = JSON.parse(store.get(KEY) ?? 'null'); if (j && j.rates && j.at) return j } catch { /* ignore */ }
  return null
}

/**
 * Live exchange rates from open.er-api.com (free, no key, updated daily), base = AED (the currency the sample figures are authored in).
 * Nothing is hard-coded or invented: if the request fails, callers show the original AED figures.
 */
export async function loadRates(): Promise<Rates | null> {
  const c = cachedRates()
  if (c && Date.now() - c.at < TTL) return c.rates
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${SOURCE_CUR}`, { headers: { accept: 'application/json' } })
    if (!r.ok) throw new Error(String(r.status))
    const j = (await r.json()) as { result?: string; rates?: Record<string, number> }
    if (j.result !== 'success' || !j.rates) throw new Error('bad')
    const rates: Rates = {}
    for (const k of CUR_CODES) if (typeof j.rates[k] === 'number') rates[k] = j.rates[k]
    store.set(KEY, JSON.stringify({ rates, at: Date.now() }))
    return rates
  } catch {
    return c?.rates ?? null
  }
}
