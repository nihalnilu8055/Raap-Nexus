// In the RaapNexus page: every open / reopen / in-dashboard refresh draws exactly one new multiplier; the label is visible; no overflow on any size.
const { chromium } = require('playwright'); const PORT = process.env.PORT || 4400
;(async () => {
  const b = await chromium.launch(); let bad = 0; const ck = (n, ok, x = '') => { if (!ok) bad++; console.log(ok ? 'OK ' : 'BAD', n, x) }
  for (const [name, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['laptop', { width: 1280, height: 720 }, false], ['tablet', { width: 820, height: 1180 }, true], ['mobile', { width: 390, height: 844 }, true], ['small', { width: 320, height: 640 }, true]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile }); const p = await ctx.newPage(); const errs = []
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text()) && errs.push(m.text()))
    await p.goto(`http://localhost:${PORT}/en/`, { waitUntil: 'load' }); await p.waitForTimeout(700)
    const cta = p.locator('main a[href$="/erp/dashboard.html"]').first(), ks = []
    const readK = async () => p.evaluate(() => document.querySelector('[role=dialog] iframe').contentDocument.documentElement.dataset.demoK)
    const open = async () => { await cta.scrollIntoViewIfNeeded(); await cta.click(); await p.waitForFunction(() => { const f = document.querySelector('[role=dialog] iframe'); return f && getComputedStyle(f).opacity === '1' }, null, { timeout: 15000 }); await p.waitForTimeout(900) }
    await open(); ks.push(await readK())
    const m = await p.evaluate(() => { const d = document.querySelector('[role=dialog] iframe').contentDocument, vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none'; const chips = [...d.querySelectorAll('.demo-sim')]; return { labelVisible: chips.some(vis), labelTexts: chips.map(c => c.textContent), docOver: d.documentElement.scrollWidth > d.documentElement.clientWidth + 1, tbOver: (() => { const t = d.querySelector('.topbar'); return t ? t.scrollWidth > t.clientWidth + 1 : false })() } })
    ck(`${name}: label visible, exact text`, m.labelVisible && m.labelTexts.every(t => t === 'DEMO DATA – SIMULATED'), JSON.stringify(m.labelTexts))
    ck(`${name}: no horizontal overflow in dashboard (page + top bar)`, !m.docOver && !m.tbOver, JSON.stringify(m))
    if (['desktop', 'mobile'].includes(name)) await p.screenshot({ path: `/tmp/demo-${name}.png` })
    // refresh inside the dashboard (what a user's F5 on the dashboard does): a new document -> a new multiplier
    await p.evaluate(() => document.querySelector('[role=dialog] iframe').contentWindow.location.reload()); await p.waitForTimeout(1500); ks.push(await readK())
    await p.keyboard.press('Escape'); await p.waitForTimeout(500)
    await open(); ks.push(await readK())
    await p.keyboard.press('Escape'); await p.waitForTimeout(500)
    await open(); ks.push(await readK())
    const one = await p.evaluate(() => { const d = document.querySelector('[role=dialog] iframe').contentDocument; return d.querySelectorAll('html[data-demo-k]').length })
    ck(`${name}: open, refresh, reopen, reopen -> 4 different multipliers`, new Set(ks).size === 4, ks.join(' '))
    ck(`${name}: exactly one multiplier per document`, one === 1)
    ck(`${name}: no console errors`, errs.length === 0, errs.slice(0, 2).join(' | '))
    await ctx.close()
  }
  await b.close(); console.log(bad ? 'FAIL ' + bad : 'ALL PASS')
})()
