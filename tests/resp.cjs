const { chromium } = require('playwright')
const out = process.env.OUT
const VP = [[1920,1080,'xl'],[1440,900,'dt'],[1366,768,'lp'],[1280,720,'sl'],[1024,768,'tl'],[768,1024,'tp'],[430,932,'m430'],[390,844,'m390'],[360,800,'m360'],[320,720,'m320']]
;(async () => {
  const b = await chromium.launch()
  for (const [w, h, n] of VP) {
    const pg = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800 })).newPage(); const errs = []
    pg.on('pageerror', (e) => errs.push(e.message))
    await pg.goto('http://localhost:4180/en/', { waitUntil: 'load', timeout: 90000 }); await pg.waitForTimeout(2800)
    const r = await pg.evaluate(() => {
      const R = (e) => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height } }
      const h1 = R(document.querySelector('h1')), ctas = [...document.querySelectorAll('main a, main button')].filter((e) => /Explore Platform|Contact Us/.test(e.textContent) && e.getBoundingClientRect().top < innerHeight).map((e) => ({ t: e.textContent.trim(), ...R(e) }))
      const nav = [...document.querySelectorAll('header button, header a')].filter((e) => e.offsetParent).map((e) => ({ t: (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 18), ...R(e) }))
      let overlap = []; for (let i = 0; i < nav.length; i++) for (let j = i + 1; j < nav.length; j++) { const a = nav[i], c = nav[j]; if (a.l < c.r - 1 && c.l < a.r - 1 && a.t < c.b - 1 && c.t < a.b - 1) overlap.push(a.t + '|' + c.t) }
      const small = [...nav, ...ctas].filter((x) => x.h < 40 || x.w < 40).map((x) => x.t + ` ${Math.round(x.w)}x${Math.round(x.h)}`)
      const overflow = document.documentElement.scrollWidth - innerWidth
      const ctaOverH1 = ctas.some((c) => c.t < h1.b && c.b > h1.t && c.l < h1.r && c.r > h1.l)
      return { overflow, overlap, small, ctas: ctas.map((c) => `${c.t}@${Math.round(c.l)},${Math.round(c.t)} ${Math.round(c.w)}x${Math.round(c.h)}`), h1w: Math.round(h1.w), ctaOverH1, navCount: nav.length, ctaRight: Math.max(...ctas.map((c) => c.r)), ctaBottom: Math.max(...ctas.map((c) => c.b)) }
    })
    await pg.screenshot({ path: `${out}/r_${n}_hero.png`, timeout: 120000 })
    // contact modal
    { const hb = pg.locator('header').getByRole('button', { name: 'Contact Us' }); if (!(await hb.isVisible())) { await pg.getByRole('button', { name: 'Open menu' }).click(); await pg.waitForTimeout(500); await pg.getByRole('dialog').or(pg.locator('header')).getByRole('button', { name: 'Contact Us' }).last().click() } else await hb.click() } await pg.waitForSelector('[role=dialog]'); await pg.waitForTimeout(700)
    const m = await pg.evaluate(() => { const d = document.querySelector('[role=dialog]').getBoundingClientRect(); return { dl: Math.round(d.left), dr: Math.round(d.right), dw: Math.round(innerWidth), over: document.documentElement.scrollWidth - innerWidth, inputs: [...document.querySelectorAll('[role=dialog] input:not([tabindex="-1"]),[role=dialog] textarea')].map((e) => Math.round(e.getBoundingClientRect().height)).filter((x) => x && x < 40).length } })
    await pg.screenshot({ path: `${out}/r_${n}_modal.png`, timeout: 120000 }); await pg.keyboard.press('Escape'); await pg.waitForSelector('[role=dialog]', { state: 'detached', timeout: 8000 }).catch(() => {})
    await pg.evaluate(() => scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(1800)
    const f = await pg.evaluate(() => { const c = [...document.querySelectorAll('footer p')].find((p) => /©/.test(p.textContent)); return { copy: c.textContent.trim(), n: [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /All rights reserved/.test(e.textContent)).length, ov: document.documentElement.scrollWidth - innerWidth } })
    await pg.screenshot({ path: `${out}/r_${n}_footer.png`, timeout: 120000 })
    console.log(n, `${w}x${h}`, JSON.stringify({ ...r }), 'modal', JSON.stringify(m), 'footer', JSON.stringify(f), 'errors', errs.length)
    await pg.context().close()
  }
  await b.close()
})()
