const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4305); let fails = 0
const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + m) }
const GL = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
const track = () => { const o = HTMLCanvasElement.prototype.getContext; window.__ctx = []; HTMLCanvasElement.prototype.getContext = function (t, ...a) { const c = o.call(this, t, ...a); if (c && /webgl/.test(t)) window.__ctx.push([this, c]); return c } }
const noGL = () => { const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : o.call(this, t, ...a) } }
const toFlow = (p) => p.evaluate(() => { const e = document.querySelector('#flow [data-cursor=visual]'); scrollTo(0, e.getBoundingClientRect().top + scrollY - 140) })
;(async () => {
  const b = await chromium.launch({ args: GL })
  // 1 desktop: renders, stages follow scroll, pointer, selection, modules, keyboard
  let c = await b.newContext({ viewport: { width: 1440, height: 900 } }); await c.addInitScript(track); let p = await c.newPage(); const errs = []
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text()) && errs.push(m.text()))
  await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(2500)
  log((await p.locator('#flow canvas').count()) === 0, 'scene not mounted until the section is near (lazy)')
  await toFlow(p); await p.waitForTimeout(3500)
  log((await p.locator('#flow canvas').count()) === 1, 'WebGL scene renders (1 canvas)')
  const png = await p.locator('#flow canvas').screenshot(); log(png.length > 25000, 'canvas has drawn content (screenshot ' + png.length + ' bytes)')
  const stage0 = await p.locator('#flow [aria-live]').innerText()
  await p.evaluate(() => scrollBy(0, 330)); await p.waitForTimeout(1500)
  const stage1 = await p.locator('#flow [aria-live]').innerText(); log(stage0 !== stage1, `scroll advances stage: "${stage0.split(' – ')[0]}" → "${stage1.split(' – ')[0]}"`)
  const ap = await p.locator('#flow [aria-pressed=true]').allInnerTexts(); log(ap.length === 2, 'selected chip + active tab marked via aria-pressed: ' + ap.join(' / ').replace(/\n/g, ''))
  await toFlow(p); await p.waitForTimeout(800)
  const box = await p.locator('#flow [data-cursor=visual]').boundingBox()
  const shot = async () => p.locator('#flow canvas').screenshot()
  await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3, { steps: 6 }); await p.waitForTimeout(1500); const s1 = await shot()
  await p.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.7, { steps: 6 }); await p.waitForTimeout(1500); const s2 = await shot()
  log(Buffer.compare(s1, s2) !== 0, 'pointer movement changes the 3D view (parallax)')
  await p.locator('#flow').getByRole('button', { name: 'Business Insights', exact: true }).click(); await p.waitForTimeout(600)
  log((await p.locator('#flow [aria-live]').innerText()).startsWith('Business Insights'), 'clicking a stage selects it')
  await p.evaluate(() => scrollBy(0, 200)); await p.waitForTimeout(1200); log((await p.locator('#flow [aria-live]').innerText()).startsWith('Business Insights'), 'manual selection is not overridden by scrolling')
  await p.locator('#flow').getByRole('button', { name: 'ERP modules', exact: true }).click(); await p.waitForTimeout(800)
  log((await p.locator('#flow ol button').count()) === 6, 'ERP modules view lists 6 modules')
  for (const m of ['Finance', 'Sales', 'Purchase', 'Inventory', 'HR & Payroll', 'Reporting & Analytics']) { await p.locator('#flow ol').getByRole('button', { name: m, exact: true }).click(); await p.waitForTimeout(250); if (!(await p.locator('#flow [aria-live]').innerText()).startsWith(m)) log(false, 'module ' + m) }
  log(true, 'each module selectable, description updates')
  await p.locator('#flow ol').getByRole('button', { name: 'Sales', exact: true }).focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(300)
  log((await p.locator('#flow [aria-live]').innerText()).startsWith('Purchase'), 'keyboard Tab/Enter selects the next module')
  // canvas click on a node selects it (3D hit test)
  const cb = await p.locator('#flow canvas').boundingBox(); let hit = false
  scan: for (let gy = 0.1; gy < 0.95; gy += 0.1) for (let gx = 0.1; gx < 0.95; gx += 0.05) { const before = await p.locator('#flow [aria-live]').innerText(); await p.mouse.click(cb.x + cb.width * gx, cb.y + cb.height * gy); await p.waitForTimeout(60); if ((await p.locator('#flow [aria-live]').innerText()) !== before) { hit = true; break scan } }
  log(hit, 'clicking a node inside the 3D scene selects it')
  // existing sections intact
  const ids = await p.evaluate(() => ['top', 'platform', 'services', 'flow', 'intelligence', 'audit', 'ai', 'deploy', 'demo-videos', 'about'].filter((i) => !document.getElementById(i)))
  log(ids.length === 0, 'all existing sections + new section present, missing: ' + JSON.stringify(ids))
  await p.evaluate(() => document.getElementById('deploy').scrollIntoView()); await p.waitForTimeout(3500)
  log((await p.locator('#deploy canvas').count()) === 1, 'existing "Where the Model Runs" scene still renders')
  const hs = await p.evaluate(() => { const f = document.getElementById('flow').getBoundingClientRect(), h = document.querySelector('#flow h2').getBoundingClientRect(), cv = document.querySelector('#flow [data-cursor=visual]').getBoundingClientRect(); return { overlap: cv.top < h.bottom - 1 } })
  log(!hs.overlap, 'canvas area does not overlap the heading')
  log(errs.length === 0, 'no console / page errors: ' + (errs.join(' | ') || 'none'))
  // 2 resource cleanup: leave the page and come back 3x
  for (let i = 0; i < 3; i++) { await p.goto(B + '/en/demo-videos', { waitUntil: 'load' }); await p.waitForTimeout(600); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(600); await toFlow(p); await p.waitForTimeout(2500) }
  const live = await p.evaluate(() => window.__ctx.filter(([cv, g]) => cv.isConnected && !g.isContextLost()).length)
  log(live <= 5, 'after 3 route round-trips, live WebGL contexts = ' + live + ' (≤5 sections)')
  await c.close()
  // 3 viewports
  for (const [w, h] of [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 800]]) {
    c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 500 }); p = await c.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(2000)
    let tries = 0; for (; tries < 4; tries++) { await toFlow(p); try { await p.waitForSelector('#flow canvas', { timeout: 5000 }); break } catch { /* layout may have shifted: scroll to the section again */ } } await p.waitForTimeout(1500)
    if (tries) console.log('   (needed ' + tries + ' re-scroll(s) at ' + w + 'px)')
    const r = await p.evaluate(() => { const cv = document.querySelector('#flow canvas')?.getBoundingClientRect(); const chips = [...document.querySelectorAll('#flow ol button')].map((e) => e.getBoundingClientRect()); const ch0 = chips[0]; return { ov: document.documentElement.scrollWidth - innerWidth, canvas: !!cv, cw: Math.round(cv?.width || 0), chOver: chips.some((q) => q.right > innerWidth + 1 || q.left < -1), gap: ch0 && cv ? Math.round(ch0.top - cv.bottom) : null } })
    log(r.ov <= 0 && r.canvas && !r.chOver && r.gap >= 0, `${w}x${h}: canvas ${r.cw}px, overflow ${r.ov}, chips inside viewport, gap below scene ${r.gap}px`)
    if (w === 1920 || w === 768) await p.screenshot({ path: `/tmp/fc_${w}.png` })
    await c.close()
  }
  // 4 reduced motion
  c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); await c.addInitScript(track); p = await c.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await toFlow(p); await p.waitForTimeout(3000)
  const r1 = await p.locator('#flow canvas').screenshot(); await p.waitForTimeout(1500); const r2 = await p.locator('#flow canvas').screenshot()
  log((await p.locator('#flow canvas').count()) === 1 && Buffer.compare(r1, r2) === 0, 'reduced motion: scene rendered once and static (no continuous animation)')
  const st = await p.locator('#flow [aria-live]').innerText(); await p.evaluate(() => scrollBy(0, 300)); await p.waitForTimeout(800); log((await p.locator('#flow [aria-live]').innerText()) === st, 'reduced motion: scrolling does not auto-advance stages')
  await p.locator('#flow').getByRole('button', { name: 'Auditing', exact: true }).click(); await p.waitForTimeout(800)
  const r3 = await p.locator('#flow canvas').screenshot(); log(Buffer.compare(r2, r3) !== 0, 'reduced motion: selecting a stage still repaints the scene')
  await c.close()
  // 5 WebGL unavailable
  c = await b.newContext({ viewport: { width: 1440, height: 900 } }); await c.addInitScript(noGL); p = await c.newPage(); const e2 = []; p.on('pageerror', (e) => e2.push(e.message))
  await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(2000); await toFlow(p); await p.waitForTimeout(1500)
  log((await p.locator('#flow canvas').count()) === 0 && (await p.locator('#flow svg').count()) > 0, 'no WebGL: static SVG fallback shown instead of the canvas')
  await p.locator('#flow').getByRole('button', { name: 'Auditing', exact: true }).click(); await p.waitForTimeout(300); log((await p.locator('#flow [aria-live]').innerText()).startsWith('Auditing'), 'no WebGL: stage controls and descriptions still work')
  await p.locator('#flow').getByRole('button', { name: 'ERP modules', exact: true }).click(); await p.waitForTimeout(300); log((await p.locator('#flow ol button').count()) === 6, 'no WebGL: ERP modules view still works')
  await p.screenshot({ path: '/tmp/fc_nogl.png' }); log(e2.length === 0, 'no WebGL: no page errors')
  await c.close()
  // 6 other languages
  for (const l of ['ar', 'fr', 'de', 'es']) { c = await b.newContext({ viewport: { width: 1440, height: 900 } }); p = await c.newPage(); await p.goto(`${B}/${l}/`, { waitUntil: 'load' }); await p.waitForTimeout(1800); const h = await p.locator('#flow h2').innerText(); const ch = await p.locator('#flow ol button').allInnerTexts(); log(h.length > 5 && ch.length === 5 && !ch.some((x) => /flow\./.test(x)), `${l}: translated heading "${h.replace(/\n/g, ' ')}", chips ${ch.map((x) => x.replace(/\d/, '').trim()).join(', ')}`); await c.close() }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0)
})()
