// Differential test: the ORIGINAL dashboard (K=1) vs the new one at a fixed multiplier. In every state (each tab, each period mode) every
// money token must be original*K (within display rounding); anything unchanged is listed so non-money numbers can be reviewed.
const { chromium } = require('playwright'); const PORT = process.env.PORT || 4400, K = +(process.env.K || 1.2345)
const HIDESRC = '\\b(?:customer|salesperson)(?: ?\\d{1,3}\\b| ?\\d{0,2}…)?|\\b(?:cu|salesp)[a-z]*…|\\b(?:raw materials?|breads?|arabic bread|snacks?|confectionary|sweets|sandwich(?:es)?|hot meals|semi finished goods|dry food|sanabil snacks|abc biscuit|slice cake|non return-snacks|pudding cake|croissants?|resale items|seasonal items|philipino|cakes?)\\b|^\\s*(?:special|others)\\s*$|(?<![\\d,.])\\b(?:(?!FY|Q\\d|H\\d|Y\\d|R\\d{3}\\b)[A-Z]{1,3}\\d{2,6}|\\d{6}|0\\d{3}|00\\d)\\b(?![,.]\\d)'
const snap = async (p) => p.evaluate((HIDESRC) => { const HIDE = new RegExp(HIDESRC, 'gi'), EXA = /^\s*(?:special|others)\s*$/i; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let o = [], n; while ((n = w.nextNode())) { const t = n.parentNode.nodeName; if (n.parentElement.closest('.redact') || EXA.test(n.nodeValue)) continue; if (t==='SCRIPT'||t==='STYLE'||!n.nodeValue.trim()) continue; if (n.parentElement.closest('.demo-sim')||n.parentElement.closest('footer')) continue; const v = n.nodeValue.replace(HIDE, ' '); o.push(v) } return o.join(' ') }, HIDESRC)
async function collect(url, ctx) {
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && errs.push(m.text()))
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(1200)
  const states = []; states.push(await snap(p))
  const tabs = await p.$$eval('.tabbtn[data-tab]', b => b.map(x => x.dataset.tab))
  for (const t of tabs) {
    await p.evaluate(t => document.querySelector(`.tabbtn[data-tab="${t}"]`).click(), t); await p.waitForTimeout(250)
    states.push(await snap(p))
    const n = await p.$$eval(`#tab-${t} [id$="period"] > *`, e => e.length).catch(() => 0)
    for (let i = 0; i < n; i++) { await p.evaluate(([t, i]) => document.querySelectorAll(`#tab-${t} [id$="period"]`).forEach(c => c.children[i] && c.children[i].click()), [t, i]); await p.waitForTimeout(200); states.push(await snap(p)) }
  }
  await p.close(); return { states, errs, k: await 0 }
}
;(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const A = await collect(`http://localhost:${PORT}/erp/dashboard.orig.html`, ctx)
  const B = await collect(`http://localhost:${PORT}/erp/dashboard.html?dk=${K}`, ctx)
  const NUM = /\d+(?:,\d{3})*(?:\.\d+)?/g; let bad = 0, same = new Map(), ok = 0, shift = 0
  if (A.states.length !== B.states.length) { console.log('BAD state count', A.states.length, B.states.length); bad++ }
  A.states.forEach((sa, si) => {
    const ta = sa.split('\u0001'), tb = (B.states[si] || '').split('\u0001')
    if (ta.length !== tb.length) { console.log('BAD structure differs in state', si, ta.length, tb.length); bad++; return }
    ta.forEach((x, i) => {
      const ma = [...x.matchAll(NUM)], mb = [...tb[i].matchAll(NUM)], na = ma.map(m => m[0]), nb = mb.map(m => m[0])
      if (na.length !== nb.length) { shift++; if (shift < 8) console.log('  token-count change:', JSON.stringify(x.slice(0, 90)), '=>', JSON.stringify(tb[i].slice(0, 90))); return }
      na.forEach((a, j) => { const bb = nb[j]; const ia = ma[j].index, ib = mb[j].index; if (a === bb) { const c = x.slice(Math.max(0, ia - 24), ia + a.length + 16).replace(/\s+/g, ' '); same.set(a + ' | ' + c, 1 + (same.get(a + ' | ' + c) || 0)); return }
        const ua0 = /^\s?([KM])\b/.exec(x.slice(ia + a.length))?.[1], ub0 = /^\s?([KM])\b/.exec(tb[i].slice(ib + bb.length))?.[1]
        const va = parseFloat(a.replace(/,/g, '')), vb = parseFloat(bb.replace(/,/g, '')), dec = (bb.split('.')[1] || '').length, tol = 0.51 * Math.pow(10, -dec) + K * 0.51 * Math.pow(10, -((a.split('.')[1] || '').length)) * (ua0 === 'K' && ub0 === 'M' ? 1e-3 : 1)
        // unit change K->M is allowed: compare after normalising by the unit that follows
        const ua = /^\s?([KM])\b/.exec(x.slice(ia + a.length))?.[1], ub = /^\s?([KM])\b/.exec(tb[i].slice(ib + bb.length))?.[1]
        const exp = va * K * (ua === 'K' && ub === 'M' ? 1e-3 : 1)
        if (Math.abs(vb - exp) <= tol) ok++; else { bad++; if (bad < 15) console.log('BAD ratio', JSON.stringify(x.slice(0, 80)), a, '->', bb, 'expected', exp.toFixed(3)) } })
    })
  })
  console.log(`states=${A.states.length} scaled-ok=${ok} bad=${bad} token-count-changes=${shift} errors orig=${A.errs.length} new=${B.errs.length}`, B.errs.slice(0, 3))
  console.log('--- numbers left unchanged (review: must all be non-money) ---'); const arr = [...same.entries()].sort((a, b) => b[1] - a[1]); arr.slice(0, +(process.env.N || 400)).forEach(([k, v]) => console.log(String(v).padStart(3), k))
  await b.close(); process.exit(bad ? 1 : 0)
})()
