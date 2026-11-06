// Video section "coming soon": layout, a11y, WebGL lifecycle, fallback, reduced motion, link guard, no effect on the initial load.
const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4180)
let bad = 0
const reveal = async (p, ms = 300) => { await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#demo-videos').scrollIntoView({ block: 'center' }) }); await p.waitForSelector('.cs-stage.cs-in', { timeout: 15000 }).catch(() => {}); await p.waitForFunction(() => [...document.querySelectorAll('.cs-t i')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 25000 }).catch(() => {}); await p.waitForTimeout(ms) }
const log = (ok, m, x = '') => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + m, x) }
;(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
  // 1) initial load must not touch the scene chunk
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const reqs = []
    p.on('request', (r) => reqs.push(r.url())); await p.goto(B + '/en/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
    log(!reqs.some((u) => /ComingSoonScene/.test(u)), 'scene chunk is NOT requested while the hero loads'); await p.close() }
  // 2) per viewport / language
  for (const [w, h, lang] of [[1440, 900, 'en'], [1024, 768, 'en'], [820, 1100, 'en'], [390, 844, 'en'], [360, 740, 'en'], [320, 640, 'en'], [390, 844, 'de'], [390, 844, 'es'], [390, 844, 'fr'], [1440, 900, 'ar'], [390, 844, 'ar']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/TUNNEL|Failed to load resource/.test(m.text())) errs.push(m.text()) })
    await p.goto(`${B}/${lang}/`, { waitUntil: 'load' }); await p.waitForTimeout(600)
    await reveal(p)
    const r = await p.evaluate(() => {
      const st = document.querySelector('.cs-stage').getBoundingClientRect(), t = document.querySelector('.cs-t').getBoundingClientRect(), sc = document.querySelector('.cs-screen').getBoundingClientRect()
      const letters = [...document.querySelectorAll('.cs-t i:not(.cs-sp)')].map((e) => +getComputedStyle(e).opacity)
      return { ox: document.documentElement.scrollWidth - innerWidth, inside: t.left >= sc.left - 1 && t.right <= sc.right + 1, letters: Math.min(...letters), h2: document.querySelector('#vg-h .sr-only').textContent, sw: Math.round(sc.width), tw: Math.round(t.width), fs: getComputedStyle(document.querySelector('.cs-t')).fontSize }
    })
    log(r.ox === 0 && r.inside && r.letters === 1 && !errs.length, `${lang} ${w}x${h}: no overflow, title inside screen, fully revealed, no errors`, `h2="${r.h2}" screen ${r.sw}px title ${r.tw}px ${r.fs} ox=${r.ox} inside=${r.inside} letters=${r.letters} ${errs.join('|')}`)
    await p.close()
  }
  // 3) WebGL lifecycle
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(500)
    await reveal(p, 300); await p.waitForSelector('.cs-gl canvas', { timeout: 20000 }).catch(() => {})
    const on = await p.evaluate(() => !!document.querySelector('.cs-gl canvas'))
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(2500)
    const off = await p.evaluate(() => !document.querySelector('.cs-gl canvas'))
    log(on, 'WebGL scene mounts when the section is on screen'); log(off, 'WebGL scene is unmounted (context released) after scrolling away'); await p.close() }
  // 4) no WebGL -> CSS version stays complete
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a) } })
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.goto(B + '/en/', { waitUntil: 'load' })
    await reveal(p)
    const r = await p.evaluate(() => ({ gl: !!document.querySelector('.cs-gl'), screen: !!document.querySelector('.cs-screen'), op: +getComputedStyle(document.querySelector('.cs-t i')).opacity }))
    log(!r.gl && r.screen && r.op === 1 && !errs.length, 'no-WebGL: CSS 3D screen + title shown, no scene, no errors', JSON.stringify(r) + errs.join('|')); await ctx.close() }
  // 5) reduced motion
  { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' })
    await reveal(p, 300)
    const r = await p.evaluate(() => ({ gl: !!document.querySelector('.cs-gl'), rig: getComputedStyle(document.querySelector('.cs-rig')).animationName, op: +getComputedStyle(document.querySelector('.cs-t i')).opacity, front: getComputedStyle(document.querySelector('.cs-front')).animationName }))
    log(!r.gl && r.rig === 'none' && r.front === 'none' && r.op === 1, 'reduced motion: no WebGL, no animation, title static and readable', JSON.stringify(r)); await ctx.close() }
  // 6) links: library link works, '#' anchors never jump
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(B + '/en/', { waitUntil: 'load' })
    await p.evaluate(() => { const a = document.createElement('a'); a.href = '#'; a.id = 'probe'; a.textContent = 'probe'; document.querySelector('#demo-videos .cs-stage').after(a); document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#demo-videos').scrollIntoView({ block: 'center' }) }); await p.waitForTimeout(1500)
    const y0 = await p.evaluate(() => scrollY); await p.click('#probe'); await p.waitForTimeout(400); const y1 = await p.evaluate(() => scrollY)
    log(Math.abs(y1 - y0) < 2 && !/#$/.test(await p.evaluate(() => location.href)), 'href="#" inside the section does not jump or change the URL', `${y0}->${y1}`)
    // 7) button opens the Coming Soon modal: no navigation, no jump, close works (button / Esc / backdrop), focus + scroll restored
    const url0 = p.url(), btn = '#demo-videos a[href$="/demo-videos"]'
    await p.evaluate(() => { document.querySelector('#demo-videos a[href$="/demo-videos"]').scrollIntoView({ block: 'center' }) }); await p.waitForTimeout(600); await p.hover(btn); await p.waitForTimeout(400)
    const ys = await p.evaluate(() => scrollY)
    await p.click(btn); await p.waitForSelector('[role=dialog] .cs-stage', { timeout: 5000 }); await p.waitForTimeout(900)
    const o = await p.evaluate(() => ({ y: scrollY, url: location.href, n: document.querySelectorAll('[role=dialog] [data-component=coming-soon]').length, ids: document.querySelectorAll('[id=vg-h]').length + document.querySelectorAll('[id=vg-modal-h]').length, lock: document.body.style.overflow, f: document.activeElement && document.activeElement.getAttribute('aria-label') }))
    log(o.url === url0 && Math.abs(o.y - ys) < 2 && o.n === 1 && o.ids === 2 && o.lock === 'hidden' && o.f === 'Close', 'button opens the modal: same URL, no jump, scroll locked, unique ids, close focused', JSON.stringify(o))
    await p.waitForFunction(() => [...document.querySelectorAll('[role=dialog] .cs-t i')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 25000 }).catch(() => {})
    await p.screenshot({ path: process.env.SHOT_OPEN || '/tmp/modal-open.png' })
    for (const how of ['button', 'esc', 'backdrop']) {
      if (how !== 'button') { await p.click(btn); await p.waitForSelector('[role=dialog] .cs-stage'); await p.waitForTimeout(600) }
      if (how === 'button') await p.click('[role=dialog] button[aria-label=Close]'); else if (how === 'esc') await p.keyboard.press('Escape'); else await p.mouse.click(30, 450)
      await p.waitForSelector('[role=dialog]', { state: 'detached', timeout: 4000 }).catch(() => {}); await p.waitForTimeout(200)
      const c = await p.evaluate(() => ({ y: scrollY, url: location.href, d: document.querySelectorAll('[role=dialog]').length, lock: document.body.style.overflow, f: document.activeElement && document.activeElement.matches('a[href$="/demo-videos"]') }))
      log(c.d === 0 && c.url === url0 && Math.abs(c.y - ys) < 2 && c.lock === '' && c.f, 'close via ' + how + ': removed, same URL, scroll position + lock restored, focus back on button', JSON.stringify(c))
    }
    await p.close() }
  // 8) modal on phone + RTL
  for (const [lang, w, h] of [['en', 390, 844], ['ar', 390, 844]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto(B + '/' + lang + '/', { waitUntil: 'load' })
    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#demo-videos a[href$="/demo-videos"]').scrollIntoView({ block: 'center' }) }); await p.waitForTimeout(800)
    await p.click('#demo-videos a[href$="/demo-videos"]'); await p.waitForSelector('[role=dialog] .cs-stage'); await p.waitForTimeout(1500)
    const m = await p.evaluate(() => { const r = document.querySelector('[role=dialog] .cs-screen').getBoundingClientRect(), x = document.querySelector('[role=dialog] button[aria-label]').getBoundingClientRect(); return { ox: document.documentElement.scrollWidth > innerWidth, inside: r.left >= 0 && r.right <= innerWidth, btn: x.top >= 0 && x.right <= innerWidth && x.left >= 0 } })
    log(!m.ox && m.inside && m.btn, `modal fits ${w}px (${lang})`, JSON.stringify(m)); await p.screenshot({ path: `/tmp/modal-${lang}-${w}.png` }); await p.close() }
  await b.close(); console.log(bad ? bad + ' FAILED' : 'ALL PASSED'); process.exit(bad ? 1 : 0)
})()
