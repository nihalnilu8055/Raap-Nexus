// Whole-homepage audit in a real browser at 7 viewports: horizontal overflow, elements poking outside the viewport, clipped text,
// section heights / gaps / padding, blank bands while scrolling, images that stretch, console + network errors. Screenshots per section.
const { chromium } = require('playwright'); const fs = require('fs')
const PORT = process.env.PORT || 4400, OUT = process.env.OUT || '/tmp/audit'; fs.mkdirSync(OUT, { recursive: true })
const ALL = [['320x640', 320, 640], ['375x812', 375, 812], ['430x932', 430, 932], ['768x1024', 768, 1024], ['1024x768', 1024, 768], ['1366x768', 1366, 768], ['1920x1080', 1920, 1080]]
const VPS = process.env.VP ? ALL.filter(v => v[0] === process.env.VP) : ALL
const EXT = /fonts\.g|ERR_TUNNEL|ERR_CONNECTION|youtube|ytimg|google|GL Driver|ReadPixels|swiftshader/i
;(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const report = {}
  for (const [name, w, h] of VPS) {
    const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 500 }); const p = await c.newPage(); const errs = [], fails = []
    p.on('console', m => { if (['error', 'warning'].includes(m.type()) && !EXT.test(m.text())) errs.push(m.text().slice(0, 140)) }); p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 140)))
    p.on('requestfailed', r => { if (!EXT.test(r.url())) fails.push(r.url()) }); p.on('response', r => { if (r.status() >= 400 && !EXT.test(r.url())) fails.push(r.status() + ' ' + r.url()) })
    await p.goto(`http://localhost:${PORT}/en/`, { waitUntil: 'load' }); await p.waitForTimeout(2500)
    // scroll through slowly so lazy content mounts and animations run
    const total = await p.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < total; y += Math.round(h * 0.8)) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(60) }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500)
    const r = await p.evaluate(() => {
      const vw = innerWidth, de = document.documentElement
      const out = { docOverflowX: de.scrollWidth - vw, bodyOverflowX: document.body.scrollWidth - vw, pageH: de.scrollHeight, sections: [], offenders: [], clipped: [], imgs: [], tiny: [] }
      const secs = [...document.querySelectorAll('main > *, main > div > *')].filter(e => e.getBoundingClientRect().height > 40)
      const top = new Set(); const list = []
      document.querySelectorAll('main > *').forEach(e => { if (!top.has(e)) { top.add(e); list.push(e) } })
      let prev = null
      list.forEach(e => {
        const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
        out.sections.push({ id: e.id || e.tagName.toLowerCase(), top: Math.round(r.top + scrollY), h: Math.round(r.height), pt: cs.paddingTop, pb: cs.paddingBottom, gap: prev == null ? 0 : Math.round(r.top + scrollY - prev) })
        prev = r.bottom + scrollY
      })
      // elements that stick out of the viewport horizontally (ignore ones inside intentionally clipped / scrolling containers, fixed/sticky layers and aria-hidden art)
      const clipAnc = (el) => { let a = el.parentElement; while (a && a !== document.body) { const s = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(s.overflowX) && a.getBoundingClientRect().width <= vw + 1) return true; a = a.parentElement } return false }
      document.querySelectorAll('main *, header *, footer *').forEach(el => {
        const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return
        if ((r.right > vw + 1 || r.left < -1) && !clipAnc(el) && !el.closest('[aria-hidden="true"]')) out.offenders.push((el.tagName + '.' + String(el.className).slice(0, 50)) + ' L' + Math.round(r.left) + ' R' + Math.round(r.right))
      })
      // text clipped by its own box (overflow hidden + scroll size larger) for text blocks
      document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,li,label').forEach(el => {
        if (!el.textContent.trim() || el.closest('[aria-hidden="true"]') || el.closest('svg')) return
        const cs = getComputedStyle(el); if (cs.display === 'inline') return
        if ((el.scrollWidth > el.clientWidth + 2 && /hidden|clip/.test(cs.overflowX) && !/ellipsis/.test(cs.textOverflow)) || (el.scrollHeight > el.clientHeight + 3 && /hidden|clip/.test(cs.overflowY) && el.clientHeight > 0 && cs.display !== 'none'))
          out.clipped.push(el.tagName + ':' + el.textContent.trim().slice(0, 40) + ' sw' + el.scrollWidth + '/cw' + el.clientWidth + ' sh' + el.scrollHeight + '/ch' + el.clientHeight)
        const fs = parseFloat(cs.fontSize); if (fs < 11 && el.children.length === 0 && el.getBoundingClientRect().width > 0) out.tiny.push(el.textContent.trim().slice(0, 30) + ' ' + fs + 'px')
      })
      document.querySelectorAll('main img, footer img, header img').forEach(im => { if (!im.complete || im.naturalWidth === 0) { if (im.loading !== 'lazy' || im.getBoundingClientRect().top < innerHeight * 3) out.imgs.push('broken ' + im.src.slice(-50)) ; return } const r = im.getBoundingClientRect(); if (r.width < 2) return; const ar = im.naturalWidth / im.naturalHeight, rr = r.width / r.height; const fit = getComputedStyle(im).objectFit; if (fit === 'fill' && Math.abs(ar - rr) / ar > 0.06) out.imgs.push('stretched ' + im.src.slice(-40) + ' nat ' + ar.toFixed(2) + ' box ' + rr.toFixed(2)) })
      return out
    })
    report[name] = { ...r, errs, fails: [...new Set(fails)] }
    // screenshots of each section (viewport-sized crops are heavy; take one full-page capture at reduced scale)
    if (['320x640', '768x1024', '1366x768'].includes(name)) { await p.screenshot({ path: `${OUT}/full-${name}.png`, fullPage: true }).catch(() => {}) }
    await c.close()
  }
  await b.close()
  for (const [n, r] of Object.entries(report)) {
    console.log(`\n=== ${n}  pageH ${r.pageH}  docOverflowX ${r.docOverflowX}  bodyOverflowX ${r.bodyOverflowX}`)
    console.log('sections:', r.sections.map(s => `${s.id}[h${s.h} pt${s.pt} pb${s.pb} gap${s.gap}]`).join(' '))
    ;[['offenders', r.offenders], ['clipped', r.clipped], ['imgs', r.imgs], ['tiny', r.tiny], ['console', r.errs], ['network', r.fails]].forEach(([k, a]) => { if (a.length) console.log(' ' + k + ' (' + a.length + '):', [...new Set(a)].slice(0, 12).join(' | ')) })
  }
  fs.writeFileSync(OUT + '/report.json', JSON.stringify(report, null, 1))
})()
