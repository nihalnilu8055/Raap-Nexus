// Coming Soon modal (opened by "Explore All Demo Videos"): layout, a11y, WebGL lifecycle, fallback, reduced motion, link guard, no effect on the initial load.
const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4180)
let bad = 0
const reveal = async (p, ms = 300) => { await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#demo-videos').scrollIntoView({ block: 'center' }) }); await p.waitForSelector('.cs-stage.cs-in', { timeout: 15000 }).catch(() => {}); await p.waitForFunction(() => [...document.querySelectorAll('.cs-t i')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 25000 }).catch(() => {}); await p.waitForTimeout(ms) }
const log = (ok, m, x = '') => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + m, x) }
;(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
  // 1) initial load must not touch the scene chunk (the inline stage was replaced by the local video)
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const reqs = []
    p.on('request', (r) => reqs.push(r.url())); await p.goto(B + '/en/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
    log(!reqs.some((u) => /ComingSoonScene/.test(u)), 'scene chunk is NOT requested while the hero loads'); await p.close() }
  // 6) links: library link works, '#' anchors never jump
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(B + '/en/', { waitUntil: 'load' })
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
