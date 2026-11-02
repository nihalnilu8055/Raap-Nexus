import { LANGS, SITE_URL, type Lang } from './config'
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'
import hi from './locales/hi.json'

const D = { en, ar, fr, de, es, hi } as Record<Lang, typeof en>
export const langUrl = (l: Lang) => `${SITE_URL}/${l}/`

function set(sel: string, make: () => HTMLElement, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElement>(sel)
  if (!el) { el = make(); document.head.appendChild(el) }
  for (const k of Object.keys(attrs)) el.setAttribute(k, attrs[k])
}
const meta = (name: string, content: string, prop = false) =>
  set(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', name); return m }, { content })

export function jsonLd(lang: Lang) {
  const m = D[lang].meta
  return [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'RaapNexus', url: SITE_URL + '/', logo: SITE_URL + '/favicon.svg' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'RaapNexus', url: langUrl(lang), inLanguage: lang, description: m.description },
    { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'RaapNexus', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: m.description, url: langUrl(lang) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'RaapNexus', item: langUrl(lang) }] },
  ]
}

/** Runtime head sync (the prerendered HTML already contains the same tags for crawlers). */
export function applyHead(lang: Lang) {
  const m = D[lang].meta
  document.title = m.title
  meta('description', m.description)
  meta('keywords', m.keywords)
  meta('og:title', m.title, true); meta('og:description', m.description, true); meta('og:url', langUrl(lang), true)
  meta('og:locale', LANGS.find((l) => l.code === lang)!.og, true); meta('og:site_name', m.siteName, true); meta('og:type', 'website', true)
  meta('twitter:title', m.title); meta('twitter:description', m.description)
  set('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l }, { href: langUrl(lang) })
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove())
  for (const l of LANGS) { const a = document.createElement('link'); a.rel = 'alternate'; a.hreflang = l.code; a.href = langUrl(l.code); document.head.appendChild(a) }
  const x = document.createElement('link'); x.rel = 'alternate'; x.hreflang = 'x-default'; x.href = langUrl('en'); document.head.appendChild(x)
  const fam = lang === 'ar' ? 'Noto+Sans+Arabic' : lang === 'hi' ? 'Noto+Sans+Devanagari' : ''
  if (fam && !document.querySelector(`link[data-font="${fam}"]`)) { const f = document.createElement('link'); f.rel = 'stylesheet'; f.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@400;600;700;800&display=swap`; f.dataset.font = fam; document.head.appendChild(f) }
  let ld = document.getElementById('ld-json') as HTMLScriptElement | null
  if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
  ld.textContent = JSON.stringify(jsonLd(lang))
}
