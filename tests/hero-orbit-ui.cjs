const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4180)
const GL = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
const EXT = /fonts\.g|youtube|ytimg|ERR_TUNNEL|ERR_CONNECTION|google|GL Driver|ReadPixels/i
let fail = 0; const ok = (c, m) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + m) }
const open = async (b, o = {}, url = '/en/') => { const c = await b.newContext({ viewport: { width: 1440, height: 900 }, ...o }); const p = await c.newPage(); p.errs = []; p.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !EXT.test(m.text())) p.errs.push(m.text().slice(0, 140)) }); p.on('pageerror', (e) => p.errs.push('PE ' + e.message)); await p.goto(B + url, { waitUntil: 'load' }); await p.waitForSelector('[data-orbit-word]'); await p.waitForTimeout(3500); return [c, p] }
;(async () => {
  const b = await chromium.launch({ args: GL })
  // ---- desktop, WebGL on
  let [c, p] = await open(b)
  const info = await p.evaluate(() => ({ canvas: !!document.querySelector('[data-orbit] canvas'), cw: document.querySelector('[data-orbit] canvas')?.getBoundingClientRect().width, txt: document.querySelector('[data-orbit]').textContent, img: document.querySelector('[data-orbit] img')?.getAttribute('src'), role: document.querySelector('[data-orbit]').getAttribute('role'), label: document.querySelector('[data-orbit]').getAttribute('aria-label').slice(0, 40) }))
  ok(info.canvas, 'WebGL scene mounted (canvas ' + Math.round(info.cw) + 'px)')
  ok(!/RAAP\s*NEXUS/i.test(info.txt) && info.img === '/assets/r-icon.png', 'core shows only the R icon (no "RAAP NEXUS" text in the model)')
  // smooth rotation: sample rho at 60 ms steps
  const s = await p.evaluate(async () => { const a = []; for (let i = 0; i < 20; i++) { a.push(window.__RN_ORBIT.rho()); await new Promise((r) => setTimeout(r, 120)) } return a })
  const d = s.slice(1).map((v, i) => v - s[i]); const mean = d.reduce((x, y) => x + y) / d.length
  ok(mean > 0 && Math.max(...d) < mean * 1.6 + 0.002 && Math.min(...d) > 0, `rotation is continuous & steady (mean ${(mean / 0.12 * 57.3).toFixed(2)}°/s, no jumps)`)
  ok(mean / 0.12 * 57.3 < 8, 'rotation speed calm (< 8°/s)')
  // hover
  const sap = p.locator('[data-orbit-word="Oracle"]')
  const before = await p.evaluate(() => window.__RN_ORBIT.rho())
  const bb = await sap.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(100)
  await p.mouse.move(bb.x + bb.width / 2 + 1, bb.y + bb.height / 2)
  await p.waitForTimeout(500)
  const hv = await p.evaluate(() => { const e = document.querySelector('[data-orbit-word="Oracle"]'), t = document.getElementById('orbit-tip'); return { act: e.dataset.active, tip: t.textContent, op: getComputedStyle(t).opacity, glow: getComputedStyle(e).boxShadow !== 'none', tr: e.style.transform } })
  ok(hv.act === 'true' && hv.op !== '0' && /Oracle/.test(hv.tip), 'hover: highlight + tooltip "' + hv.tip.slice(0, 60) + '…"')
  const r1 = await p.evaluate(() => window.__RN_ORBIT.rho()); await p.waitForTimeout(1000); const r2 = await p.evaluate(() => window.__RN_ORBIT.rho())
  ok((r2 - r1) / 1.0 < 0.1 * (2 * Math.PI / 90) * 2.5 + 0.0001 && (r2 - r1) >= 0, `hover slows the orbit (${((r2 - r1) * 57.3).toFixed(2)}°/s vs ${(mean / 0.12 * 57.3).toFixed(2)}°/s)`)
  const sc = await p.evaluate(() => { const e = document.querySelector('[data-orbit-word="Oracle"]'); return /scale\(([\d.]+)\)/.exec(e.style.transform)[1] }); ok(+sc > 1.04, 'hover: slight scale-up (' + sc + ')')
  // click -> smooth scroll to #platform
  const y0 = await p.evaluate(() => scrollY); const bb2 = await sap.boundingBox(); await p.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2)
  await p.waitForTimeout(2200)
  const cl = await p.evaluate(() => ({ y: scrollY, top: document.getElementById('platform').getBoundingClientRect().top, hash: location.hash }))
  ok(cl.y > y0 + 300 && Math.abs(cl.top) < 120 && cl.hash === '#platform', `click: smooth-scrolls to the Platform section (top ${Math.round(cl.top)}px, ${cl.hash})`)
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800)
  // keyboard
  await p.evaluate(() => document.activeElement && document.activeElement.blur())
  await p.focus('[data-orbit-word="SAP"]'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150)
  const kb = await p.evaluate(() => ({ f: document.activeElement.dataset.orbitWord, ring: getComputedStyle(document.activeElement).outlineStyle + '/' + getComputedStyle(document.activeElement).boxShadow.slice(0, 40), tip: document.getElementById('orbit-tip').textContent.slice(0, 20), tabs: [...document.querySelectorAll('[data-orbit-word]')].filter((e) => e.tabIndex === 0).length }))
  ok(kb.f === 'Oracle' && /Oracle/.test(kb.tip) && kb.tabs === 1, `keyboard: arrows move focus (now ${kb.f}), tooltip on focus, single tab stop`)
  await p.keyboard.press('Enter'); await p.waitForTimeout(2000)
  ok(await p.evaluate(() => location.hash === '#platform'), 'keyboard: Enter activates the word (scrolls to #platform)')
  // pointer response (parallax) – scene reads orbitState; verify canvas pixels change with pointer
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(900)
  const a = await p.locator('[data-orbit] canvas').screenshot(); await p.mouse.move(1300, 200); await p.waitForTimeout(900); const a2 = await p.locator('[data-orbit] canvas').screenshot()
  ok(Buffer.compare(a, a2) !== 0, 'pointer / time moves the 3D scene (canvas frames differ)')
  ok(p.errs.length === 0, 'no console errors / warnings ' + p.errs.slice(0, 2)); await c.close()

  // ---- touch (phone)
  ;[c, p] = await open(b, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const th = p.locator('[data-orbit-word="Odoo"]'); const tb = await th.boundingBox()
  await p.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.waitForTimeout(2200)
  ok(await p.evaluate(() => location.hash === '#platform'), 'touch: tapping a word navigates to #platform')
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800)
  // vertical swipe starting on the model must scroll the page (we never block it)
  const touchAction = await p.evaluate(() => getComputedStyle(document.querySelector('[data-orbit-word="SAP"]')).touchAction + '/' + getComputedStyle(document.querySelector('[data-orbit]')).touchAction)
  ok(!/none/.test(touchAction), 'touch: page scrolling not blocked by the model (touch-action ' + touchAction + ')')
  const mfont = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-orbit-word="SAP"]')).fontSize)); ok(mfont >= 9.5, `mobile label font ${mfont}px`)
  ok(p.errs.length === 0, 'mobile: no console errors / warnings ' + p.errs.slice(0, 2)); await c.close()

  // ---- reduced motion
  ;[c, p] = await open(b, { reducedMotion: 'reduce' })
  const rm = await p.evaluate(async () => { const a = window.__RN_ORBIT.rho(); await new Promise((r) => setTimeout(r, 1200)); return { moved: window.__RN_ORBIT.rho() !== a, n: document.querySelectorAll('[data-orbit-word]').length, canvas: !!document.querySelector('[data-orbit] canvas'), img: !!document.querySelector('[data-orbit] img[src="/assets/r-icon.png"]'), vis: [...document.querySelectorAll('[data-orbit-word]')].every((e) => { const r = e.getBoundingClientRect(); return r.width > 20 && getComputedStyle(e).opacity !== '0' }) } })
  ok(!rm.moved && rm.n === 16 && rm.vis && rm.img && !rm.canvas, 'reduced motion: static layout, all 16 words readable, R icon shown, no animation loop/canvas')
  await p.hover('[data-orbit-word="Tally"]', { force: true }); await p.waitForTimeout(300)
  ok(await p.evaluate(() => /Tally/.test(document.getElementById('orbit-tip').textContent) && getComputedStyle(document.getElementById('orbit-tip')).opacity !== '0'), 'reduced motion: hover tooltip still works')
  await c.close()

  // ---- WebGL unavailable
  const b2 = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] })
  ;[c, p] = await open(b2)
  const nw = await p.evaluate(() => ({ gl: (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })(), canvas: !!document.querySelector('[data-orbit] canvas'), n: document.querySelectorAll('[data-orbit-word]').length, img: !!document.querySelector('[data-orbit] img[src="/assets/r-icon.png"]'), op: getComputedStyle(document.querySelector('[data-orbit] img').parentElement).opacity }))
  ok(!nw.gl && !nw.canvas && nw.n === 16 && nw.img && nw.op === '1', `no WebGL (gl=${nw.gl}): CSS sphere + R icon + all 16 orbiting words still render`)
  ok(p.errs.length === 0, 'no-WebGL: no console errors ' + p.errs.slice(0, 2)); await c.close(); await b2.close()

  // ---- logo placements + old logo gone
  ;[c, p] = await open(b)
  const lg = await p.evaluate(() => { const i = document.querySelector('header img'); return { src: i.getAttribute('src'), w: i.getBoundingClientRect().width, h: i.getBoundingClientRect().height, nat: [i.naturalWidth, i.naturalHeight] } })
  ok(lg.src === '/assets/logo-header.png' && Math.abs(lg.w / lg.h - 1063 / 244) < 0.02 && lg.nat[0] === 1063, `header logo: new asset, aspect ${(lg.w / lg.h).toFixed(2)} (native ${lg.nat.join('×')}), ${Math.round(lg.w)}×${Math.round(lg.h)}px`)
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1200)
  const ft = await p.evaluate(() => { const i = document.querySelector('footer img'); return i && { src: i.getAttribute('src'), ok: i.naturalWidth > 0 } })
  ok(ft && ft.src === '/assets/logo-light.png' && ft.ok, 'footer logo: new transparent variant on dark footer loads')
  const fav = await p.evaluate(() => [...document.querySelectorAll('link[rel*=icon]')].map((l) => l.getAttribute('href')))
  console.log('INFO favicon links', fav.join(' '))
  await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600)
  await p.click('button[aria-controls="mobile-menu"], button[aria-label*="enu"]').catch(() => {}); await p.waitForTimeout(600)
  const mi = await p.evaluate(() => ({ menu: !!document.getElementById('mobile-menu'), hdr: document.querySelectorAll('header img').length }))
  console.log('INFO mobile header logos', JSON.stringify(mi))
  await c.close(); await b.close()
  console.log(fail ? `\n${fail} FAILED` : '\nALL PASSED'); process.exit(fail ? 1 : 0)
})()
