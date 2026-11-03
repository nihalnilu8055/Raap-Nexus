const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4310)
const EXT = /fonts\.g|youtube|ytimg|ERR_TUNNEL|ERR_CONNECTION|google/i
;(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
  for (const [vn, w, h, touch] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
    for (const route of ['/en/', '/ar/', '/fr/', '/de/', '/es/', '/en/demo-videos']) {
      const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: w < 500 }); const p = await c.newPage(); const msgs = [], fails = []
      await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) })
      p.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !EXT.test(m.text())) msgs.push(m.type() + ': ' + m.text().slice(0, 140)) })
      p.on('pageerror', (e) => msgs.push('pageerror: ' + e.message.slice(0, 140)))
      p.on('requestfailed', (r) => { if (!EXT.test(r.url())) fails.push(r.url().slice(0, 100)) })
      p.on('response', (r) => { if (r.status() >= 400 && !EXT.test(r.url())) fails.push(r.status() + ' ' + r.url().slice(0, 100)) })
      await p.goto(B + route, { waitUntil: 'load' }); await p.waitForTimeout(2500)
      const H = await p.evaluate(() => document.documentElement.scrollHeight); const overlaps = []; let maxOv = 0
      for (let y = 0; y < H; y += Math.round(h * 0.6)) {
        await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(450)
        const r = await p.evaluate(() => { const rect = (e) => e.getBoundingClientRect(); const hs = [...document.querySelectorAll('h1,h2')].filter((e) => { const r = rect(e); return r.bottom > 70 && r.top < innerHeight && getComputedStyle(e).visibility !== 'hidden' }); const cvs = [...document.querySelectorAll('canvas')].filter((e) => rect(e).height > 50); const o = []; for (const hh of hs) for (const cv of cvs) { const a = rect(hh), d = rect(cv); const ix = Math.min(a.right, d.right) - Math.max(a.left, d.left), iy = Math.min(a.bottom, d.bottom) - Math.max(a.top, d.top); if (ix > 4 && iy > 6) o.push(hh.textContent.trim().slice(0, 30) + ' × canvas in ' + (cv.closest('section')?.id || '?')) } return { o, ov: document.documentElement.scrollWidth - innerWidth } })
        overlaps.push(...r.o); maxOv = Math.max(maxOv, r.ov)
      }
      const heads = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((e) => +e.tagName[1]))
      let skip = 0, h1 = heads.filter((x) => x === 1).length; for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) skip++
      const cls = await p.evaluate(() => +window.__cls.toFixed(3))
      const lang = await p.evaluate(() => document.documentElement.lang + '/' + document.documentElement.dir)
      console.log(`${vn.padEnd(7)} ${route.padEnd(16)} h1=${h1} skippedLevels=${skip} overflow=${maxOv} overlaps=${[...new Set(overlaps)].length ? JSON.stringify([...new Set(overlaps)]) : 'none'} CLS=${cls} html=${lang} warn/err=${msgs.length ? JSON.stringify(msgs.slice(0, 3)) : 'none'} failedReq=${fails.length ? JSON.stringify(fails.slice(0, 3)) : 'none'}`)
      await c.close()
    }
  }
  await b.close()
})()
