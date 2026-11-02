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
const OG_IMG = `${SITE}/assets/shots/dashboard.webp`

function page(lang) {
  const d = JSON.parse(readFileSync(join(root, `src/i18n/locales/${lang.code}.json`), 'utf8'))
  const url = `${SITE}/${lang.code}/` // the bare root serves the English copy but declares /en/ canonical (no duplicate-content conflict)
  const alt = langs.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${SITE}/${l.code}/" />`).join('\n    ') + `\n    <link rel="alternate" hreflang="x-default" href="${SITE}/en/" />`
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'RaapNexus', url: SITE + '/', logo: SITE + '/favicon.svg' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'RaapNexus', url, inLanguage: lang.code, description: d.meta.description },
    { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'RaapNexus', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: d.meta.description, url },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'RaapNexus', item: url }] },
  ]
  const fonts = lang.code === 'ar' ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet" />' : lang.code === 'hi' ? '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap" rel="stylesheet" />' : ''
  const head = `
    <meta name="description" content="${esc(d.meta.description)}" />
    <meta name="keywords" content="${esc(d.meta.keywords)}" />
    <link rel="canonical" href="${url}" />
    ${alt}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(d.meta.siteName)}" />
    <meta property="og:title" content="${esc(d.meta.title)}" />
    <meta property="og:description" content="${esc(d.meta.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${lang.og}" />
    ${langs.filter((l) => l.code !== lang.code).map((l) => `<meta property="og:locale:alternate" content="${l.og}" />`).join('\n    ')}
    <meta property="og:image" content="${OG_IMG}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(d.meta.title)}" />
    <meta name="twitter:description" content="${esc(d.meta.description)}" />
    <meta name="twitter:image" content="${OG_IMG}" />
    ${fonts}
    <script type="application/ld+json" id="ld-json">${JSON.stringify(ld)}</script>`
  const body = `<main style="min-height:100vh;background:#040a1c;color:#e2e8f0;font-family:system-ui,sans-serif;padding:96px 24px;max-width:860px;margin:0 auto">
      <h1>${esc(d.seo.h1)}</h1>
      <p>${esc(d.seo.p)}</p>
      <ul>${d.seo.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <p>${esc(d.hero.sub)}</p>
      <nav aria-label="${esc(d.nav.language)}">${langs.map((l) => `<a href="/${l.code}/" hreflang="${l.code}" lang="${l.code}" style="color:#7dd3fc;margin-inline-end:12px">${esc(l.native)}</a>`).join('')}</nav>
    </main>`
  let html = tpl
    .replace(/<html lang="[^"]*"[^>]*>/, `<html lang="${lang.code}" dir="${lang.dir}">`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(d.meta.title)}</title>`)
    .replace('<!--SEO_HEAD-->', head)
    .replace('<!--SEO_BODY-->', body)
  return html
}

const en = langs.find((l) => l.code === 'en')
writeFileSync(join(dist, 'index.html'), page(en))
for (const l of langs) { mkdirSync(join(dist, l.code), { recursive: true }); writeFileSync(join(dist, l.code, 'index.html'), page(l)) }

const today = new Date().toISOString().slice(0, 10)
const alts = langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${SITE}/${l.code}/"/>`).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/"/>`
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${langs.map((l) => `  <url>\n    <loc>${SITE}/${l.code}/</loc>\n    <lastmod>${today}</lastmod>\n${alts}\n  </url>`).join('\n')}\n</urlset>\n`)
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`prerendered ${langs.length} languages (${langs.map((l) => l.code).join(', ')}), sitemap.xml, robots.txt -> ${SITE}`)
