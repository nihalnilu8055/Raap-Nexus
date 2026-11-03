const { chromium } = require('playwright')
const B = 'http://localhost:4180'
const log = (ok, m) => console.log((ok ? 'PASS ' : 'FAIL ') + m)
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const pg = await ctx.newPage()
  const reqs = []; pg.on('request', (r) => reqs.push(r.url())); const errs = []; pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await pg.goto(B + '/en/', { waitUntil: 'load' }); await pg.waitForTimeout(3000)
  // currency removal
  const nav = await pg.evaluate(() => document.querySelector('header').innerText)
  log(!/\b(AED|USD|SAR|INR|EUR|GBP)\b/.test(nav) && !/currency/i.test(await pg.evaluate(() => document.querySelector('header').innerHTML)), 'nav has no currency selector')
  log(!reqs.some((u) => /open\.er-api|exchangerate/.test(u)), 'no exchange-rate network request')
  log(await pg.evaluate(() => !Object.keys(localStorage).some((k) => /cur|rates/i.test(k))), 'no currency keys in localStorage')
  const body = await pg.evaluate(() => document.body.innerText); log(!/\bAED\b|currency/i.test(body), 'no AED/currency text on the homepage')
  log(await pg.locator('header button:has-text("English")').count() === 1, 'language selector still present')
  // headings + head
  const h = await pg.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((e) => e.tagName + ':' + e.textContent.trim().slice(0, 50)))
  console.log(h.join(' | ')); log(h.filter((x) => x.startsWith('H1')).length === 1, 'exactly one H1')
  const head = await pg.evaluate(() => ({ t: document.title, d: document.querySelector('meta[name=description]')?.content, c: document.querySelector('link[rel=canonical]')?.href, og: document.querySelector('meta[property="og:image"]')?.content, hl: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.hreflang), ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent) }))
  log(head.t === 'RaapNexus | Tax Auditing, Financial Auditing & Business Analysis', 'title: ' + head.t)
  log(/finance platform for tax auditing/.test(head.d), 'description (' + head.d.length + ' chars)')
  log(head.c === 'https://raap-nexus-new.vercel.app/en/' && !head.hl.includes('hi') && head.hl.length === 6, 'canonical + hreflang ' + head.hl)
  let ld = []; try { ld = JSON.parse(head.ld[0]) } catch { }
  const types = (Array.isArray(ld) ? ld : [ld]).map((x) => x['@type']); log(['Organization', 'WebSite', 'WebPage', 'Service', 'BreadcrumbList'].every((t) => types.includes(t)) && !JSON.stringify(ld).includes('localhost') && !/telephone|address|aggregateRating/.test(JSON.stringify(ld)), 'JSON-LD valid + types ' + [...new Set(types)])
  // static files
  for (const f of ['/sitemap.xml', '/robots.txt']) { const r = await pg.request.get(B + f); const t = await r.text(); log(r.status() === 200 && !/\/hi\/|localhost/.test(t), f + ' ' + r.status() + ' ' + t.length + 'b') }
  const sm = await (await pg.request.get(B + '/sitemap.xml')).text(); log((sm.match(/<loc>/g) || []).length === 10, 'sitemap lists 10 URLs (5 languages x home + demo-videos)')
  for (const p of ['/en/', '/ar/', '/fr/', '/de/', '/es/']) { const r = await pg.request.get(B + p); log(r.status() === 200, p + ' 200') }
  log((await pg.request.get(B + '/hi/')).status() !== 500, '/hi/ handled (' + (await pg.request.get(B + '/hi/')).status() + ')')
  // broken internal links / assets
  const links = await pg.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && !h.startsWith('#') && !h.startsWith('mailto:')))])
  const bad = []; for (const l of links) { if (/^https?:/.test(l) && !l.startsWith(B)) continue; const r = await pg.request.get(new URL(l, B).href); if (r.status() >= 400) bad.push(l + ' ' + r.status()) }
  log(bad.length === 0, 'internal links ok (' + links.length + ' checked) ' + bad)
  const imgs = await pg.evaluate(async () => { const o = []; for (const i of document.images) { if (!i.complete || i.naturalWidth === 0) o.push(i.src) } return o }); log(imgs.length === 0, 'no broken images ' + imgs)
  // contact form fields + label
  await pg.locator('header').getByRole('button', { name: /Contact/ }).first().click(); await pg.waitForSelector('[role=dialog]')
  const labels = await pg.evaluate(() => [...document.querySelectorAll('[role=dialog] label')].map((l) => l.textContent.replace(/\s+/g, ' ').trim()).filter((x) => x && x !== 'Website'))
  console.log(labels.join(' | ')); log(labels.length === 8 && await pg.getByRole('button', { name: 'Submit Inquiry' }).count() === 1, '8 form fields + Submit Inquiry button')
  console.log('console errors:', errs.length ? errs : 'none'); await b.close()
})()
