// Hero heading: static 3D "BRING" + flip-flop phrase. Run against a built dist served on PORT (default 4180).
const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4180)
const log = (ok, m) => console.log((ok ? 'PASS ' : 'FAIL ') + m)
const sample = () => { const ws = [...document.querySelectorAll('.hx-t')].map((t) => [...t.querySelectorAll('i')].map((i) => +getComputedStyle(i).opacity)); const br = document.querySelector('.hx-bring__front'); const bb = br.getBoundingClientRect(); const tl = document.querySelector('.hx-tail').getBoundingClientRect()
  const slots = Math.max(ws[0].length, ws[1].length); let both = 0; for (let i = 0; i < slots; i++) if ((ws[0][i] || 0) > 0.05 && (ws[1][i] || 0) > 0.05) both++
  return { t: performance.now(), a: Math.min(...ws[0]), b: Math.min(...ws[1]), both, bo: +getComputedStyle(br).opacity, bw: bb.width, bh: bb.height, fh: tl.height, fw: tl.width, h1h: document.querySelector('h1').getBoundingClientRect().height } }
;(async () => {
  const b = await chromium.launch()
  // 1. timing / visibility / layout stability at desktop
  { const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message))
    await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) })
    await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(2000)
    const S = await p.evaluate(async (fn) => { const f = eval('(' + fn + ')'); const o = []; const t0 = performance.now(); while (performance.now() - t0 < 15000) { o.push(f()); await new Promise((r) => requestAnimationFrame(r)) } return o }, sample.toString())
    log(S.every((s) => s.bo === 1 && s.bw > 200), 'BRING stays fully visible for 15s (' + S.length + ' frames)')
    log(S.every((s) => Math.abs(s.bw - S[0].bw) < 40), 'BRING keeps its size (max width drift ' + Math.round(Math.max(...S.map((s) => Math.abs(s.bw - S[0].bw)))) + 'px, idle 3D tilt only)')
    log(S.every((s) => s.both === 0), 'old and new letters never share a slot (frames with an overlapping letter: ' + S.filter((s) => s.both > 0).length + ')')
        log(S.every((s) => s.fh === S[0].fh && s.fw === S[0].fw && s.h1h === S[0].h1h), 'tail box + h1 never change size (no layout shift) h=' + S[0].fh + ' h1=' + S[0].h1h)
    // hold durations: contiguous spans where a phrase is fully visible
    const spans = []; let cur = null; for (const s of S) { const w = s.a > 0.98 ? 'A' : s.b > 0.98 ? 'B' : null; if (w && cur && cur.w === w) cur.e = s.t; else { if (cur) spans.push(cur); cur = w ? { w, s: s.t, e: s.t } : null } } if (cur) spans.push(cur)
    const full = spans.filter((x, i) => i > 0 && i < spans.length - 1).map((x) => x.e - x.s)
    log(full.length >= 2 && full.every((d) => d > 2500 && d < 3300), 'each word held ~2.9s fully visible: ' + full.map((d) => Math.round(d)) + 'ms')
    const seen = new Set(S.map((s) => (s.a > 0.98 ? 'A' : s.b > 0.98 ? 'B' : ''))); log(seen.has('A') && seen.has('B'), 'both words were displayed')
    log((await p.evaluate(() => window.__cls)) < 0.001, 'CLS during load + animation = ' + (await p.evaluate(() => window.__cls)))
    const txt = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(), sr: document.querySelector('h1 .sr-only').textContent, hidden: document.querySelector('h1 > span[aria-hidden]') !== null, live: !!document.querySelector('h1 [aria-live]') }))
    log(txt.sr === 'Bring clarity to your finance. Bring clarity to your business.' && txt.hidden && !txt.live, 'screen readers get both statements once, animated copy aria-hidden, no live region: "' + txt.sr + '"')
    log(errs.length === 0, 'no page errors'); await c.close() }
  // 2. responsive + languages: no overflow, heading clear of CTA, both phrases fit
  for (const [n, w, h] of [['desktop', 1440, 900], ['laptop', 1280, 720], ['tablet', 1024, 768], ['tablet-p', 768, 1024], ['mobile', 390, 844], ['small', 320, 640]]) {
    for (const l of ['en', 'ar', 'fr', 'de', 'es']) {
      const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage(); await p.goto(B + '/' + l + '/', { waitUntil: 'load' }); await p.waitForTimeout(1500)
      const r = await p.evaluate(() => { const h1 = document.querySelector('h1').getBoundingClientRect(); const cta = [...document.querySelectorAll('section a')].find((a) => /dashboard/.test(a.href)); const cr = cta.getBoundingClientRect(); const br = document.querySelector('.hx-bring').getBoundingClientRect(); const ph = [...document.querySelectorAll('.hx-t')].map((e) => { const q = e.getBoundingClientRect(); return [q.left, q.right] }); const art = document.querySelector('[data-orbit]').getBoundingClientRect()
        return { ov: document.documentElement.scrollWidth - innerWidth, vis: h1.right <= innerWidth + 1 && h1.left >= -1, ctaGap: cr.top - h1.bottom, brRight: br.right, h1b: h1.bottom, ctaT: cr.top, artL: art.left, phR: Math.max(...ph.map((x) => x[1])), phL: Math.min(...ph.map((x) => x[0])) } })
      const side = w >= 1024; const rtl = l === 'ar'
      // RTL: the existing hero layout right-aligns the copy while the orbit artwork is pinned to the physical right, so copy/artwork overlap in Arabic on desktop exists independently of this heading (reported as INFO, not asserted)
      const ok = r.ov <= 0 && r.vis && r.ctaGap > 8 && (!side || rtl || (r.brRight < r.artL + 10 && r.phR < r.artL + 10))
      if (rtl && side) console.log(`INFO ${n} /ar/ copy sits over the artwork (pre-existing RTL layout): BRING right=${Math.round(r.brRight)} art left=${Math.round(r.artL)}`)
      if (!ok || l === 'en') console.log((ok ? 'PASS ' : 'FAIL ') + `${n} ${w}x${h} /${l}/ overflow=${r.ov} h1 in view=${r.vis} gap to CTA=${Math.round(r.ctaGap)} BRING right=${Math.round(r.brRight)} phrase right=${Math.round(r.phR)} art left=${Math.round(r.artL)}`)
      await c.close() } }
  // 3. reduced motion: static, first phrase shown, nothing animating
  { const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await c.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(4500)
    const r = await p.evaluate(() => { const w = [...document.querySelectorAll('.hx-t')].map((t) => [...t.querySelectorAll('i')].map((i) => getComputedStyle(i).opacity)); return { w1: w[0].every((o) => o === '1'), w2: w[1].every((o) => o === '0'), an: [...document.querySelectorAll('.hx-bring,.hx-bring__front,.hx-t i,.hx-ul')].map((e) => getComputedStyle(e).animationName).filter((x) => x !== 'none').length, bo: getComputedStyle(document.querySelector('.hx-bring__front')).opacity } })
    log(r.w1 && r.w2 && r.an === 0 && r.bo === '1', 'reduced motion: BRING + first phrase static, no CSS animation ' + JSON.stringify(r)); await c.close() }
  // 4. JS disabled: prerendered page still has the heading content
  { const c = await b.newContext({ javaScriptEnabled: false }); const p = await c.newPage(); await p.goto(B + '/en/'); const t = await p.evaluate(() => document.querySelector('h1')?.textContent || ''); log(t.length > 5, 'JS disabled: an <h1> is still present: "' + t.trim() + '"'); await c.close() }
  await b.close()
})()
