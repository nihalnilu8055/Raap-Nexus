// Post-build: emits crawlable, language-specific HTML (dist/<lang>/index.html), sitemap.xml and robots.txt.
// Each page carries unique title/description, canonical, hreflang (+x-default), Open Graph/Twitter tags, JSON-LD and
// real text content, so search engines and social crawlers see translated content without running any JavaScript.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = (process.env.VITE_SITE_URL || 'https://raap-nexus-new.vercel.app').replace(/\/$/, '')
const cfg = readFileSync(join(root, 'src/i18n/config.ts'), 'utf8')
const langs = [...cfg.matchAll(/\{ code: '(\w+)', native: '([^']+)', english: '[^']+', dir: '(ltr|rtl)', locale: '[^']+', og: '(\w+)' \}/g)]
  .map((m) => ({ code: m[1], native: m[2], dir: m[3], og: m[4] }))
if (!langs.length) throw new Error('No languages parsed from src/i18n/config.ts')
const tpl = readFileSync(join(dist, 'index.html'), 'utf8')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const OG_IMG = `${SITE}/assets/og/raapnexus-og.png`


function page(lang, kind = 'home') {
  const isV = kind === 'videos'
  const d = JSON.parse(readFileSync(join(root, `src/i18n/locales/${lang.code}.json`), 'utf8'))
  const pathFor = (code) => (isV ? `${SITE}/${code}/videos` : `${SITE}/${code}/`)
  const url = pathFor(lang.code) // the bare root serves the English copy but declares /en/ canonical (no duplicate-content conflict)
  const alt = langs.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${pathFor(l.code)}" />`).join('\n    ') + `\n    <link rel="alternate" hreflang="x-default" href="${pathFor('en')}" />`
  const M = isV ? d.videos.meta : d.meta
  const name = d.meta.siteName || 'RaapNexus'
  const org = { '@type': 'Organization', '@id': SITE + '/#organization', name: 'RaapNexus', url: SITE + '/', logo: SITE + '/icon-512.png', email: 'project@techlogica.com' }
  const ld = isV ? [
    { '@context': 'https://schema.org', ...org },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#website', name, url: SITE + '/', publisher: { '@id': SITE + '/#organization' }, inLanguage: lang.code },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url + '#webpage', url, name: M.title, description: M.description, inLanguage: lang.code, isPartOf: { '@id': SITE + '/#website' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name, item: `${SITE}/${lang.code}/` }, { '@type': 'ListItem', position: 2, name: d.videos.crumb, item: url }] },
  ] : [
    { '@context': 'https://schema.org', ...org },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#website', name, url: SITE + '/', publisher: { '@id': SITE + '/#organization' }, inLanguage: lang.code },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url + '#webpage', url, name: d.meta.title, description: d.meta.description, inLanguage: lang.code, isPartOf: { '@id': SITE + '/#website' }, about: { '@id': SITE + '/#organization' } },
    ...d.services.items.slice(0, 4).map((s) => ({ '@context': 'https://schema.org', '@type': 'Service', name: s.name, serviceType: s.name, provider: { '@id': SITE + '/#organization' }, url, inLanguage: lang.code })),
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name, item: url }] },
  ]
  const fonts = lang.code === 'ar' ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet" />' : ''
  const head = `
    <meta name="description" content="${esc(M.description)}" />
    <meta name="keywords" content="${esc(d.meta.keywords)}" />
    <link rel="canonical" href="${url}" />
    ${alt}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(d.meta.siteName)}" />
    <meta property="og:title" content="${esc(M.title)}" />
    <meta property="og:description" content="${esc(M.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${lang.og}" />
    ${langs.filter((l) => l.code !== lang.code).map((l) => `<meta property="og:locale:alternate" content="${l.og}" />`).join('\n    ')}
    <meta property="og:image" content="${OG_IMG}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(d.meta.siteName)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(M.title)}" />
    <meta name="twitter:description" content="${esc(M.description)}" />
    <meta name="twitter:image" content="${OG_IMG}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    ${isV ? '' : `<link rel="preload" as="image" href="/assets/r-icon.webp" fetchpriority="low" />`}
    ${fonts}
    <style>/* #seo-text is the crawler / no-JS copy of the page. It stays in the DOM (indexable) but is not painted while the React bundle loads; visitors see the dark #seo-fallback backdrop with a minimal wordmark (#seo-brand) until React replaces it on mount. */
      #seo-text{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;border:0!important}</style>
    <noscript><style>#seo-brand{display:none!important}#seo-text{position:static!important;width:auto!important;height:auto!important;max-width:860px!important;margin:0 auto!important;padding:96px 24px!important;overflow:visible!important;clip:auto!important}</style></noscript>
    <script type="application/ld+json" id="ld-json">${JSON.stringify(ld)}</script>`
  const bodyV = `<main id="seo-fallback" style="min-height:100vh;background:#040a1c;color:#e2e8f0;font-family:system-ui,sans-serif"><div id="seo-brand" aria-hidden="true" style="min-height:100vh;display:grid;place-items:center;font:800 28px/1 system-ui,sans-serif;letter-spacing:-.02em;color:#fff"><span>Raap<span style="color:#38bdf8">Nexus</span></span></div><div id="seo-text">
      <p><a href="/${lang.code}/" style="color:#7dd3fc">${esc(d.videos.back)}</a></p>
      <h1>${esc(d.videos.libTitle)}</h1>
      <p>${esc(d.videos.libText)}</p>
      <nav aria-label="${esc(d.nav.language)}">${langs.map((l) => `<a href="/${l.code}/videos" hreflang="${l.code}" lang="${l.code}" style="color:#7dd3fc;margin-inline-end:12px">${esc(l.native)}</a>`).join('')}</nav>
    </div></main>`
  const body = isV ? bodyV : `<main id="seo-fallback" style="min-height:100vh;background:#040a1c;color:#e2e8f0;font-family:system-ui,sans-serif"><div id="seo-brand" aria-hidden="true" style="min-height:100vh;display:grid;place-items:center;font:800 28px/1 system-ui,sans-serif;letter-spacing:-.02em;color:#fff"><span>Raap<span style="color:#38bdf8">Nexus</span></span></div><div id="seo-text">
      <h1>${esc(d.seo.h1)}</h1>
      <p>${esc(d.seo.p)}</p>
      <h2>${esc(d.services.h1)} ${esc(d.services.h2)}</h2>
      ${d.services.items.map((x) => `<h3>${esc(x.name)}</h3><p>${esc(x.line)}</p>`).join('')}
      <p>${esc(d.hero.sub)}</p>
      <nav aria-label="${esc(d.nav.language)}">${langs.map((l) => `<a href="/${l.code}/" hreflang="${l.code}" lang="${l.code}" style="color:#7dd3fc;margin-inline-end:12px">${esc(l.native)}</a>`).join('')}</nav>
    </div></main>`
  let html = tpl
    .replace(/<html lang="[^"]*"[^>]*>/, `<html lang="${lang.code}" dir="${lang.dir}">`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(M.title)}</title>`)
    .replace('<!--SEO_HEAD-->', head)
    .replace('<!--SEO_BODY-->', body)
  return html
}

const en = langs.find((l) => l.code === 'en')
writeFileSync(join(dist, 'index.html'), page(en))
for (const l of langs) {
  mkdirSync(join(dist, l.code), { recursive: true }); writeFileSync(join(dist, l.code, 'index.html'), page(l))
  mkdirSync(join(dist, l.code, 'videos'), { recursive: true }); writeFileSync(join(dist, l.code, 'videos', 'index.html'), page(l, 'videos'))
}

const today = new Date().toISOString().slice(0, 10)
const altsFor = (path) => langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${SITE}/${l.code}/${path}"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/${path}"/>`
const entries = [['', 1.0], ['videos', 0.7]]
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.flatMap(([p]) => langs.map((l) => `  <url>\n    <loc>${SITE}/${l.code}/${p}</loc>\n    <lastmod>${today}</lastmod>\n${altsFor(p)}\n  </url>`)).join('\n')}\n</urlset>\n`)
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`prerendered ${langs.length} languages (${langs.map((l) => l.code).join(', ')}), sitemap.xml, robots.txt -> ${SITE}`)
