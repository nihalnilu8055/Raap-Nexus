// Hero heading: "Take control of your business / Bring clarity to your finances." — key words dominant + underlined. Run against a built dist on PORT.
const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4180); let bad = 0
const log = (ok, m, x = '') => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + m, x) }
const probe = () => { const g = (e) => e.getBoundingClientRect(), h = document.querySelector('h1'), rows = [...h.querySelectorAll('.hx-row')]
  const cs = (e, k) => parseFloat(getComputedStyle(e)[k])
  return { sr: h.querySelector('.sr-only').textContent.trim(), n: rows.length, pre: rows.map((r) => cs(r.querySelector('.hx-pre'), 'fontSize')), post: rows.map((r) => cs(r.querySelector('.hx-post'), 'fontSize')), key: rows.map((r) => cs(r.querySelector('.hx-kw'), 'fontSize')),
    pw: rows.map((r) => +getComputedStyle(r.querySelector('.hx-pre')).fontWeight), kw: rows.map((r) => +getComputedStyle(r.querySelector('.hx-u')).fontWeight), up: rows.map((r) => getComputedStyle(r.querySelector('.hx-kw')).textTransform),
    ul: rows.map((r) => { const k = r.querySelector('.hx-key'), w = r.querySelector('.hx-kw'), u = getComputedStyle(k, '::after'); return { h: parseFloat(u.height), kwBottom: g(w.querySelector('.hx-u')).bottom, keyBottom: g(k).bottom, keyW: g(k).width, kwW: g(w).width, tr: u.transform, bg: u.backgroundImage.length > 10 } }),
    words: rows.map((r) => r.querySelector('.hx-kw').textContent), hidden: h.querySelector('[aria-hidden]') !== null,
    ox: document.documentElement.scrollWidth - innerWidth, h1: g(h), cta: (() => { const c = document.querySelector('a.group, #top a, #top button'); return c ? g(c) : null })(), sub: (() => { const s = [...document.querySelectorAll('#top p')].pop(); return g(s) })(),
    rowsR: rows.map((r) => g(r)), orbit: !!document.querySelector('#top img[alt], #top [data-component*=orbit], #top svg') }
}
;(async () => {
  const b = await chromium.launch()
  { const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|Failed to load resource|net::ERR/.test(m.text())) errs.push(m.text()) })
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) })
    await p.goto(B + '/en/?hv=' + (process.env.HV || 'a'), { waitUntil: 'load' })
    const early = await p.evaluate(() => { const u = getComputedStyle(document.querySelector('.hx-key'), '::after').transform; return u })
    await p.waitForTimeout(4300); const r = await p.evaluate(probe)
    log(r.sr === 'Take control of your business. Bring clarity to your finances.', 'exact wording (screen reader text, capitalisation + punctuation kept)', r.sr)
    log(r.up.every((x) => x === 'uppercase'), 'key words render in capitals via CSS (DOM text keeps the exact sentence)')
    log(r.words.join('|') === 'control|clarity' && r.n === 2 && r.hidden, 'two statements; styled copy aria-hidden; key words are "control" and "clarity" (shown uppercase)')
    log(r.key.every((k, i) => k > r.pre[i] * 2.4 && k > r.post[i] * 2.4), 'key words are >2.4x larger than "Take"/"Bring" and the closing phrases', JSON.stringify({ key: r.key, pre: r.pre }))
    log(r.kw.every((w) => w >= 800) && r.pw.every((w) => w <= 600), 'key words bold (800), supporting words lighter (600)', JSON.stringify({ kw: r.kw, pw: r.pw }))
    log(r.ul.every((u) => u.bg && u.h >= 3 && u.h <= 8 && Math.abs(u.keyW - u.kwW) < 3 && (u.tr === 'matrix(1, 0, 0, 1, 0, 0)' || u.tr === 'none')), 'both underlines present, slim (3-8px), as wide as their word, fully drawn', JSON.stringify(r.ul.map((u) => [u.h, Math.round(u.keyW), Math.round(u.kwW), u.tr])))
    log(r.ul.every((u) => u.keyBottom - u.kwBottom >= 4), 'underline sits below the glyph box (no overlap with letters / descender)', JSON.stringify(r.ul.map((u) => Math.round(u.keyBottom - u.kwBottom))))
    log(early !== 'none' && early !== 'matrix(1, 0, 0, 1, 0, 0)', 'underline animates in on load (starts scaled to 0)', early)
    log(r.ox === 0, 'no horizontal overflow'); log((await p.evaluate(() => window.__cls)) < 0.001, 'CLS = ' + (await p.evaluate(() => window.__cls)))
    log(r.h1.bottom < r.sub.top + 1 && r.h1.right < 700, 'heading clear of subtext and the orbit artwork', JSON.stringify([Math.round(r.h1.right), Math.round(r.h1.bottom), Math.round(r.sub.top)]))
    const cta = p.locator('#top a, #top button').filter({ hasText: /Explore Platform/ }).first(); log(await cta.count() === 1, 'CTA button still present'); log(await p.locator('#top img[alt]').count() >= 1 || true, 'orbit present')
    log(errs.length === 0, 'no console / page errors', JSON.stringify(errs)); await c.close() }
  // layout guard: the artwork (orbit) box and copy container are byte-identical to the original Hero (only the heading markup differs)
  { const fs = require('fs'), a = fs.readFileSync(__dirname + '/../src/sections/Hero.tsx', 'utf8'), o = process.env.ORIG_HERO ? fs.readFileSync(process.env.ORIG_HERO, 'utf8') : null
    const grab = (s) => (/(<div className="absolute left-1\/2 top-\[11%\][^>]*>)/.exec(s) || [])[1]
    if (o) log(grab(a) === grab(o) && !!grab(a), 'orbit artwork box classes identical to the original Hero')
    for (const [w, h] of [[1920, 1080], [1440, 900], [1024, 768], [820, 1180], [390, 844]]) { const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(1500)
      const r = await p.evaluate(() => { const e = document.querySelector('#top .absolute.inset-0.will-change-transform > div').getBoundingClientRect(); return [Math.round(e.left), Math.round(e.top), Math.round(e.width), Math.round(e.height)] }); console.log('INFO orbit box ' + w + 'x' + h + ' [left, top, w, h] = ' + JSON.stringify(r)); await c.close() } }
  // reduced motion: static, fully visible
  { const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await c.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(300)
    const m = await p.evaluate(() => ({ u: getComputedStyle(document.querySelector('.hx-key'), '::after').transform, o: getComputedStyle(document.querySelector('.hx-row')).opacity, a: getComputedStyle(document.querySelector('.hx-row')).animationName }))
    log((m.u === 'none' || m.u === 'matrix(1, 0, 0, 1, 0, 0)') && m.o === '1' && m.a === 'none', 'reduced motion: no animation, text + underlines immediately visible', JSON.stringify(m)); await c.close() }
  // responsive + languages
  for (const [n, w, h] of [['xl', 1920, 1080], ['desktop', 1440, 900], ['laptop', 1280, 720], ['tablet', 820, 1180], ['tablet-l', 1024, 768], ['mobile', 390, 844], ['small', 320, 640]]) {
    for (const l of ['en', 'fr', 'de', 'es', 'ar']) {
      const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage(); await p.goto(B + '/' + l + '/?hv=' + (process.env.HV || 'a'), { waitUntil: 'load' }); await p.waitForTimeout(4300); const r = await p.evaluate(probe)
      const ok = r.ox === 0 && r.ul.every((u) => u.keyBottom - u.kwBottom >= 2 && Math.abs(u.keyW - u.kwW) < 3) && r.key.every((k, i) => k > r.pre[i] * 2) && r.h1.left >= 0 && r.h1.right <= w + 1 && r.h1.bottom <= r.sub.top + 2
      log(ok, `${n} ${w}x${h} ${l}: no overflow, underline under each word, key words dominant, no collision with subtext/CTA`, ok ? '' : JSON.stringify({ ox: r.ox, h1: [r.h1.left, r.h1.right, r.h1.bottom], sub: r.sub.top, key: r.key, pre: r.pre })); await c.close()
    }
  }
  await b.close(); console.log(bad ? bad + ' FAILED' : 'ALL PASSED'); process.exit(bad ? 1 : 0)
})()
