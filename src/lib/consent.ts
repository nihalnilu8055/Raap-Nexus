/**
 * Cookie / storage consent (CONSENT-FEATURE, removable).
 * Stores the visitor's choice in this browser only (localStorage key "rn.consent.v1"). Strictly necessary storage is always allowed.
 * Other code can ask `hasConsent('analytics')` before loading optional tools. No tracking tool is started from here.
 */
export type ConsentCategory = 'functional' | 'analytics' | 'marketing'
export interface Consent { v: 1; ts: number; choice: 'all' | 'none' | 'custom'; functional: boolean; analytics: boolean; marketing: boolean }
const KEY = 'rn.consent.v1'
const EVT = 'rn-consent-change'
let mem: Consent | null = null

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return mem
    const c = JSON.parse(raw) as Consent
    return c && c.v === 1 ? c : null
  } catch { return mem }
}
export function setConsent(c: Omit<Consent, 'v' | 'ts'>): Consent {
  const full: Consent = { v: 1, ts: Date.now(), ...c }
  mem = full
  try { localStorage.setItem(KEY, JSON.stringify(full)) } catch { /* private mode: kept for this page only */ }
  window.dispatchEvent(new CustomEvent(EVT, { detail: full }))
  return full
}
export const hasConsent = (cat: ConsentCategory) => !!getConsent()?.[cat]
export const onConsentChange = (fn: (c: Consent | null) => void) => {
  const h = () => fn(getConsent())
  window.addEventListener(EVT, h)
  return () => window.removeEventListener(EVT, h)
}
/** Open the preferences panel from anywhere (e.g. the footer "Cookie Settings" link). */
export const openCookieSettings = () => window.dispatchEvent(new CustomEvent('open-cookie-settings'))
