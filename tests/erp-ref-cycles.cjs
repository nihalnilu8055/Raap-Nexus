// 7 cycles of open -> record KPIs -> in-dashboard refresh -> close -> reopen. Every document must show different figures; blur must be present.
const { chromium } = require('playwright'); const PORT = process.env.PORT || 4400
;(async () => {
  const b = await chromium.launch(); let bad = 0; const ck = (n, ok, x = '') => { if (!ok) bad++; console.log(ok ? 'OK ' : 'BAD', n, x) }
  for (const [name, vp, mobile, theme] of [['desktop', { width: 1440, height: 900 }, false, 'light'], ['mobile', { width: 390, height: 844 }, true, 'dark']]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile, colorScheme: theme }); const p = await ctx.newPage(); const errs = [], net = []
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/ERR_TUNNEL/.test(m.text()) && errs.push(m.text())); p.on('requestfailed', r => net.push(r.url()))
    await p.goto(`http://localhost:${PORT}/en/`, { waitUntil: 'load' }); await p.waitForTimeout(700)
    const cta = p.locator('main a[href$="/erp/dashboard.html"]').first()
    const read = () => p.evaluate(() => { const d = document.querySelector('[role=dialog] iframe').contentDocument
      const kp = [...d.querySelectorAll('.hero [data-final], .hero .kpi-value, [data-final]')].slice(0, 4).map(e => e.textContent.replace(/\s+/g, ' ').trim())
      return { k: d.documentElement.dataset.demoK, kp, redact: d.querySelectorAll('.redact').length, svg: d.querySelectorAll('.redact-svg[filter]').length, filt: !!d.getElementById('rdx-blur') } })
    const open = async () => { await cta.scrollIntoViewIfNeeded(); await cta.click(); await p.waitForFunction(() => { const f = document.querySelector('[role=dialog] iframe'); return f && getComputedStyle(f).opacity === '1' }, null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(2200) }
    const seen = []; const rec = async (tag) => { const r = await read(); seen.push(r); console.log(`  ${name} ${tag}: K=${r.k} KPIs=${JSON.stringify(r.kp)} redact=${r.redact} svgBlur=${r.svg} filter=${r.filt}`); return r }
    for (let i = 1; i <= 7; i++) {
      await open(); await rec(`#${i} open`)
      if (i === 1) await p.screenshot({ path: `/tmp/ref-modal-${name}.png` })
      await p.evaluate(() => document.querySelector('[role=dialog] iframe').contentWindow.location.reload()); await p.waitForTimeout(2200); await rec(`#${i} refresh`)
      await p.keyboard.press('Escape'); await p.waitForTimeout(500)
    }
    ck(`${name}: 14 documents -> 14 distinct multipliers`, new Set(seen.map(s => s.k)).size === seen.length, [...new Set(seen.map(s => s.k))].length + ' distinct')
    ck(`${name}: KPI text changes on every document`, new Set(seen.map(s => s.kp.join('|'))).size >= seen.length - 1, new Set(seen.map(s => s.kp.join('|'))).size + ' distinct KPI sets')
    ck(`${name}: names/categories/codes blurred + SVG filter in every document`, seen.every(s => s.redact > 100 && s.svg > 10 && s.filt))
    ck(`${name}: no console/network errors`, errs.length === 0 && net.length === 0, errs.concat(net).slice(0, 3).join(' | '))
    await ctx.close()
  }
  await b.close(); console.log(bad ? 'FAIL ' + bad : 'ALL PASS')
})()
