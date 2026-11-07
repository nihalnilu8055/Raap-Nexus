// Accounting-identity checks on the rendered (scaled) dashboard, over several independent openings (each a new random multiplier).
const { chromium } = require('playwright'); const PORT = process.env.PORT || 4400
const num = (t) => { t = (t || '').trim(); if (!t) return NaN; const neg = /^\(/.test(t) || /^[-−]/.test(t); const v = parseFloat(t.replace(/[(),−\-+AED\s]/g, '')); return neg ? -v : v }
;(async () => {
  const b = await chromium.launch(); let bad = 0; const ck = (n, ok, x = '') => { if (!ok) { bad++; console.log('BAD', n, x) } return ok }
  const ks = []
  for (let run = 0; run < 6; run++) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); const errs = []
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()))
    await p.goto(`http://localhost:${PORT}/erp/dashboard.html`, { waitUntil: 'load' }); await p.waitForTimeout(900)
    const k = +(await p.evaluate(() => document.documentElement.dataset.demoK)); ks.push(k)
    ck(`run${run} multiplier within configured ±22% × ±6%`, k >= 0.78 * 0.94 - 1e-6 && k <= 1.22 * 1.06 + 1e-6, String(k))
    const d = await p.evaluate(() => {
      const rows = (id) => [...document.querySelectorAll(`${id} tbody tr`)].map(tr => [...tr.cells].map(c => c.textContent.trim()))
      return { pl: rows('#tbl-monthlypl'), tb: rows('#tbl-trialbalance'), bsA: rows('#tbl-bs-assets'), bsL: rows('#tbl-bs-liab'), cf: rows('#tbl-cashflow'), hero: [...document.querySelectorAll('.hero .hv')].map(e => e.textContent.trim()), lbl: document.querySelectorAll('.demo-sim').length, labelText: document.querySelector('.hero .demo-sim')?.textContent }
    })
    const R = (n) => d.pl.find(r => r[0] === n).slice(1).map(num)
    const rev = R('TOTAL REVENUE'), prod = R('Product revenue (Sales)'), oth = R('Other revenue'), cogs = R('Cost of revenue (COGS)'), gp = R('GROSS PROFIT'), opx = R('TOTAL OPERATING EXPENSES'), ni = R('NET INCOME')
    const lines = ['Employment costs', 'Production / factory', 'Occupancy', 'Vehicle & distribution', 'Sales & marketing', 'Depreciation', 'Finance costs', 'G&A / other'].map(R)
    let okp = true
    rev.forEach((v, i) => { const e = [Math.abs(v - prod[i] - oth[i]) <= 2, Math.abs(gp[i] - (v - cogs[i])) <= 2, Math.abs(opx[i] - lines.reduce((s, l) => s + l[i], 0)) <= 5, Math.abs(ni[i] - (gp[i] - opx[i])) <= 6]; if (e.includes(false)) { okp = false; console.log('  P&L col', i, e) } })
    ck(`run${run} P&L: revenue = product + other; GP = rev - COGS; OPEX = Σ lines; NI = GP - OPEX (all 10 columns)`, okp)
    const ytd = (arr) => Math.abs(arr[9] - arr.slice(0, 9).reduce((s, v) => s + v, 0)) <= 12
    ck(`run${run} P&L: YTD column = sum of the 9 months (rev, GP, NI)`, ytd(rev) && ytd(gp) && ytd(ni))
    const heroRev = num(d.hero[0].replace(/M$/, '')) * 1e6, heroNi = d.hero[1]
    ck(`run${run} hero revenue KPI = P&L YTD revenue`, Math.abs(heroRev - rev[9]) <= (0.05 * k + 0.05) * 1e6, `${d.hero[0]} vs ${rev[9]}`)
    const niK = Math.abs(num(d.hero[1].replace(/[KM]$/, '').replace(/AED|\u2212|-/g, ''))) * (/K$/.test(d.hero[1]) ? 1e3 : /M$/.test(d.hero[1]) ? 1e6 : 1) * (/[\u2212-]/.test(d.hero[1]) ? -1 : 1)
    ck(`run${run} hero net income KPI = P&L YTD net income`, Math.abs(niK - ni[9]) <= 50 * k + 50 && (niK < 0) === (ni[9] < 0), `${d.hero[1]} vs ${ni[9]}`)
    // trial balance: debit total = credit total (both period columns)
    const tb = d.tb.filter(r => r.length >= 8); const col = i => tb.reduce((s, r) => s + num(r[i]), 0)
    const dr = col(3), cr = col(4), drS = col(6), crS = col(7)
    ck(`run${run} trial balance: Σdebit = Σcredit (YTD & Sep)`, Math.abs(dr - cr) <= 0.00001 * dr + tb.length && Math.abs(drS - crS) <= 0.00001 * drS + tb.length, `${dr.toFixed(0)} / ${cr.toFixed(0)}  ${drS.toFixed(0)} / ${crS.toFixed(0)}`)
    // balance sheet movement: assets = liabilities + equity
    const subs = (rows) => rows.filter(r => /^(Current|Non-Current|Equity)/.test(r[0])).reduce((s, r) => s + num(r[1]), 0)
    const A = subs(d.bsA), LE = subs(d.bsL)
    ck(`run${run} balance sheet movement: assets = liabilities + equity`, Math.abs(A - LE) <= Math.max(25, Math.abs(A) * 0.0001), `${A.toFixed(0)} vs ${LE.toFixed(0)}`)
    // cash flow identities per column
    const C = (n) => d.cf.find(r => r[0].startsWith(n)).slice(1).map(num)
    const cni = C('Net income'), cd = C('Depreciation'), cw = C('Changes in working'), cfo = C('Net cash from operating'), cx = C('Net cash from investing'), cfn = C('Net cash from financing'), net = C('Net change')
    let okc = true; cni.forEach((v, i) => { if (Math.abs(cfo[i] - (v + cd[i] + cw[i])) > 4 || Math.abs(net[i] - (cfo[i] + cx[i] + cfn[i])) > 4) { okc = false; console.log('  CF col', i, cfo[i], v + cd[i] + cw[i], net[i], cfo[i] + cx[i] + cfn[i]) } })
    ck(`run${run} cash flow: CFO = NI + non-cash + WC; net change = CFO + investing + financing`, okc)
    ck(`run${run} cash-flow NI row = P&L NI row`, cni.slice(0, 9).every((v, i) => Math.abs(v - ni[i]) <= 3), `${cni[0]} vs ${ni[0]}`)
    ck(`run${run} label present, exact text, no console errors`, d.lbl >= 2 && d.labelText === 'DEMO DATA – SIMULATED' && errs.length === 0, errs.slice(0, 2).join('|'))
    await ctx.close()
  }
  ck('6 openings produced 6 different multipliers', new Set(ks.map(x => x.toFixed(6))).size === 6, ks.map(x => x.toFixed(3)).join(' '))
  console.log('multipliers:', ks.map(x => x.toFixed(3)).join(' '))
  await b.close(); console.log(bad ? 'FAIL ' + bad : 'ALL PASS')
})()
