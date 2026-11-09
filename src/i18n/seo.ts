import { LANGS, SITE_URL, type Lang } from './config'
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'

const D = { en, ar, fr, de, es } as Record<Lang, typeof en>
export const langUrl = (l: Lang) => `${SITE_URL}/${l}/`
export const VIDEOS_SLUG = 'videos'
export const videosUrl = (l: Lang) => `${SITE_URL}/${l}/${VIDEOS_SLUG}`
export type PageKind = 'home' | 'videos'
export const pageUrl = (l: Lang, k: PageKind) => (k === 'videos' ? videosUrl(l) : langUrl(l))

function set(sel: string, make: () => HTMLElement, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElement>(sel)
  if (!el) { el = make(); document.head.appendChild(el) }
  for (const k of Object.keys(attrs)) el.setAttribute(k, attrs[k])
}
const meta = (name: string, content: string, prop = false) =>
  set(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', name); return m }, { content })

export function jsonLd(lang: Lang, kind: PageKind = 'home') {
  const d = D[lang], url = pageUrl(lang, kind), name = d.meta.siteName || 'RaapNexus'
  const org = { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: 'RaapNexus', url: SITE_URL + '/', logo: SITE_URL + '/icon-512.png', email: 'project@techlogica.com' }
  if (kind === 'videos') {
    // No VideoObject markup: the videos are third-party YouTube pages and are not hosted on this site.
    const v = d.videos
    return [
      { '@context': 'https://schema.org', ...org },
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE_URL + '/#website', name, url: SITE_URL + '/', publisher: { '@id': SITE_URL + '/#organization' }, inLanguage: lang },
      { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url + '#webpage', url, name: v.meta.title, description: v.meta.description, inLanguage: lang, isPartOf: { '@id': SITE_URL + '/#website' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name, item: langUrl(lang) }, { '@type': 'ListItem', position: 2, name: v.crumb, item: url }] },
    ]
  }
  return [
    { '@context': 'https://schema.org', ...org },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE_URL + '/#website', name, url: SITE_URL + '/', publisher: { '@id': SITE_URL + '/#organization' }, inLanguage: lang },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url + '#webpage', url, name: d.meta.title, description: d.meta.description, inLanguage: lang, isPartOf: { '@id': SITE_URL + '/#website' }, about: { '@id': SITE_URL + '/#organization' } },
    ...d.services.items.slice(0, 4).map((s: { name: string }) => ({ '@context': 'https://schema.org', '@type': 'Service', name: s.name, serviceType: s.name, provider: { '@id': SITE_URL + '/#organization' }, url, inLanguage: lang })),
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name, item: url }] },
  ]
}

/** Runtime head sync (the prerendered HTML already contains the same tags for crawlers). */
export function applyHead(lang: Lang, kind: PageKind = 'home') {
  const m = kind === 'videos' ? { ...D[lang].meta, ...D[lang].videos.meta } : D[lang].meta
  const here = pageUrl(lang, kind)
  document.title = m.title
  meta('description', m.description)
  meta('keywords', m.keywords)
  meta('og:title', m.title, true); meta('og:description', m.description, true); meta('og:url', here, true)
  meta('og:locale', LANGS.find((l) => l.code === lang)!.og, true); meta('og:site_name', m.siteName, true); meta('og:type', 'website', true)
  meta('twitter:title', m.title); meta('twitter:description', m.description)
  set('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l }, { href: here })
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove())
  for (const l of LANGS) { const a = document.createElement('link'); a.rel = 'alternate'; a.hreflang = l.code; a.href = pageUrl(l.code, kind); document.head.appendChild(a) }
  const x = document.createElement('link'); x.rel = 'alternate'; x.hreflang = 'x-default'; x.href = pageUrl('en', kind); document.head.appendChild(x)
  const fam = lang === 'ar' ? 'Noto+Sans+Arabic' : ''
  if (fam && !document.querySelector(`link[data-font="${fam}"]`)) { const f = document.createElement('link'); f.rel = 'stylesheet'; f.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@400;600;700;800&display=swap`; f.dataset.font = fam; document.head.appendChild(f) }
  let ld = document.getElementById('ld-json') as HTMLScriptElement | null
  if (!ld) { ld = document.createElement('script'); ld.id = 'ld-json'; ld.type = 'application/ld+json'; document.head.appendChild(ld) }
  ld.textContent = JSON.stringify(jsonLd(lang, kind))
}
