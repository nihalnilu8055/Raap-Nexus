/**
 * Optional Google Analytics 4. Does nothing unless VITE_GA_MEASUREMENT_ID (format G-XXXXXXXXXX) is set at build time.
 * No tracking id is hard-coded. Only an anonymous "generate_lead" event is sent for contact submissions (no form contents).
 */
const ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim()
const valid = !!ID && /^G-[A-Z0-9]{4,}$/.test(ID)
type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void }

export function initAnalytics() {
  if (!valid || typeof document === 'undefined') return
  const w = window as W
  if (w.gtag) return
  w.dataLayer = w.dataLayer || []
  w.gtag = function () { w.dataLayer!.push(arguments) }
  w.gtag('js', new Date())
  w.gtag('config', ID, { anonymize_ip: true, allow_ad_personalization_signals: false })
  const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID!)}`
  document.head.appendChild(s)
}

export function trackLead() {
  if (!valid) return
  try { (window as W).gtag?.('event', 'generate_lead', { method: 'contact_form' }) } catch { /* ignore */ }
}
