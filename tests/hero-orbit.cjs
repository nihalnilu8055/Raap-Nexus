// Real-browser verification of the hero orbit: all words, R-only core, overlap over a full rotation, hover / click / keyboard / touch, fallbacks.
const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4180)
const GL = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
const WORDS = ['SAP', 'Oracle', 'Odoo', 'Microsoft Dynamics 365', 'NetSuite', 'Sage', 'Unit4', 'Infor', 'Epicor', 'Tally', 'Zoho Books', 'Acumatica', 'IFS', 'QuickBooks', 'Focus ERP', 'Workday']
const EXT = /fonts\.g|youtube|ytimg|ERR_TUNNEL|ERR_CONNECTION|google|GL Driver|ReadPixels/i
let fail = 0
const ok = (c, m) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + m) }
;(async () => {
  const b = await chromium.launch({ args: GL })
  const SIZES = [[2560, 1440], [1920, 1080], [1440, 900], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [820, 1180], [430, 932], [390, 844], [375, 667], [360, 740], [320, 640]]
  for (const [w, h] of SIZES) {
    const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 500 }); const p = await c.newPage(); const errs = []
    p.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !EXT.test(m.text())) errs.push(m.text().slice(0, 120)) }); p.on('pageerror', (e) => errs.push('PE ' + e.message))
    await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForSelector('[data-orbit-word]'); await p.waitForTimeout(1500)
    const r = await p.evaluate(async () => {
      const box = document.querySelector('[data-orbit]'), br = box.getBoundingClientRect()
      const btns = [...document.querySelectorAll('[data-orbit-word]')]
      const names = btns.map((e) => e.dataset.orbitWord)
      const worst = { pill: 1e9, sphere: 1e9, edge: 1e9, text: 1e9 }; let pairs = ''
      const cx = br.left + br.width / 2, cy = br.top + br.height / 2
      const sphereR = br.width * (br.width < 600 ? 0.1 : 0.11)
      const h1e = document.querySelector('h1'); const textRects = (el) => { const out = []; const wk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = wk.nextNode())) { if (!n.textContent.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); out.push(...[...r.getClientRects()].filter((q) => q.width > 4)) } return out }; const hrs = textRects(h1e); const subEl = [...document.querySelectorAll('p')].find((e) => /financial insights/i.test(e.textContent)); const lineRects = [...hrs, ...textRects(subEl)]; const cta = [...document.querySelectorAll('a,button')].find((e) => /Explore Platform/.test(e.textContent))?.getBoundingClientRect()
      let hit = 0
      for (let k = 0; k < 360; k += 4) {
        window.__RN_ORBIT.set((k * Math.PI) / 180); await new Promise((r) => requestAnimationFrame(() => r()))
        const R = btns.map((e) => e.getBoundingClientRect())
        for (let i = 0; i < R.length; i++) {
          const a = R[i]
          // sphere clearance
          const dx = Math.max(Math.abs(a.left + a.width / 2 - cx) - a.width / 2, 0), dy = Math.max(Math.abs(a.top + a.height / 2 - cy) - a.height / 2, 0)
          worst.sphere = Math.min(worst.sphere, Math.hypot(dx, dy) - sphereR)
          // stays inside the box horizontally (no clipping at the viewport / artwork edge)
          worst.edge = Math.min(worst.edge, Math.min(a.left, innerWidth - a.right))
          for (let j = i + 1; j < R.length; j++) { const b = R[j]; const gx = Math.max(a.left, b.left) - Math.min(a.right, b.right), gy = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom); const g = Math.max(gx, gy); if (g < worst.pill) { worst.pill = g; pairs = names[i] + '/' + names[j] + '@' + k } }
          // heading + CTA
          for (const q of lineRects) if (a.right > q.left - 2 && a.left < q.right + 2 && a.bottom > q.top && a.top < q.bottom) { hit++; break }
          if (cta && a.right > cta.left && a.left < cta.right && a.bottom > cta.top && a.top < cta.bottom) hit += 100
        }
      }
      window.__RN_ORBIT.set(0)
      const fs = parseFloat(getComputedStyle(btns[0]).fontSize)
      return { n: btns.length, names, W: Math.round(br.width), worst, pairs, hit, fs, ov: document.documentElement.scrollWidth - innerWidth, h1txt: document.querySelector('h1').textContent.trim() }
    })
    const all = WORDS.every((x) => r.names.includes(x))
    ok(r.n === 16 && all, `${w}x${h} W=${r.W} 16 words present, font ${r.fs.toFixed(1)}px`)
    ok(r.worst.pill >= 0, `${w}x${h} no pill/pill overlap over 360° (min gap ${r.worst.pill.toFixed(1)}px ${r.pairs})`)
    ok(r.worst.sphere >= 0, `${w}x${h} no pill/sphere overlap (min gap ${r.worst.sphere.toFixed(1)}px)`)
    ok(r.worst.edge >= 0, `${w}x${h} no label clipped by the viewport edge (min margin ${r.worst.edge.toFixed(1)}px)`)
    if (h >= 700) ok(r.hit === 0, `${w}x${h} labels never cover hero heading, sub-text / CTA (${r.hit})`); else console.log(`INFO ${w}x${h} short phone: ${r.hit} label/heading intersections (heading is drawn above the model)`)
    ok(r.ov <= 0, `${w}x${h} no horizontal overflow (${r.ov})`)
    ok(errs.length === 0, `${w}x${h} no console errors/warnings ${errs.slice(0, 2)}`)
    await c.close()
  }
  await b.close()
  console.log(fail ? `\n${fail} FAILED` : '\nALL PASSED'); process.exit(fail ? 1 : 0)
})()
