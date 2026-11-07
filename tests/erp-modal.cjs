const { chromium } = require('playwright')
const PORT = process.env.PORT || 4400
;(async () => {
  const b = await chromium.launch(); let bad = 0
  const ck = (n, ok, x='') => { if (!ok) bad++; console.log(ok ? 'OK ' : 'BAD', n, x) }
  for (const [name, vp, mobile] of [['desktop',{width:1440,height:900},false],['laptop',{width:1280,height:720},false],['tablet',{width:820,height:1180},true],['mobile',{width:390,height:844},true]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile }); const p = await ctx.newPage()
    const errs = [], reqs = [], pages = []; ctx.on('page', q => pages.push(q))
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type()==='error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text()) && errs.push(m.text()))
    p.on('request', r => reqs.push(r.url())); p.on('response', r => { if (r.status() >= 400 && r.url().includes('localhost')) errs.push(r.status()+' '+r.url()) })
    await p.goto(`http://localhost:${PORT}/en/`, { waitUntil: 'load' }); await p.waitForTimeout(800)
    const cta = p.locator('main a[href$="/erp/dashboard.html"]').first()
    for (let run = 1; run <= 2; run++) {
      await cta.scrollIntoViewIfNeeded(); await cta.click(); 
      await p.waitForSelector('[role=dialog] iframe', { timeout: 5000 })
      await p.waitForFunction(() => { const f=document.querySelector('[role=dialog] iframe'); return f && getComputedStyle(f).opacity==='1' }, null, { timeout: 15000 })
      await p.waitForTimeout(1200)
      const n = reqs.filter(u => u.endsWith('/erp/dashboard.html')).length
      ck(`${name} open#${run}: dashboard fetched ${run}x, no new tab`, n === run && pages.length === 0, `fetches=${n} tabs=${pages.length}`)
      const info = await p.evaluate(() => { const f=document.querySelector('[role=dialog] iframe'), d=f.contentDocument, r=f.getBoundingClientRect(); return { title:d.title, h1:d.querySelector('h1')?.textContent.trim().slice(0,30), figs:d.querySelectorAll('.kpi, .card, svg').length, docOver:document.documentElement.scrollWidth>innerWidth, frameW:Math.round(r.width), frameH:Math.round(r.height), vw:innerWidth, vh:innerHeight, innerOver:d.documentElement.scrollWidth>d.documentElement.clientWidth+1, bodyLock:getComputedStyle(document.body).overflow } })
      ck(`${name} #${run}: dashboard rendered, fits`, info.figs>10 && !info.docOver && info.frameW<=info.vw && info.frameH<=info.vh && info.bodyLock==='hidden', JSON.stringify(info))
      if (run === 1 && ['desktop','mobile'].includes(name)) await p.screenshot({ path: `/tmp/erp-${name}.png` })
      await p.keyboard.press('Escape'); await p.waitForTimeout(600)
      ck(`${name} #${run}: Esc closes + iframe unmounted`, await p.locator('[role=dialog]').count() === 0)
    }
    // open, stays open: no reload while viewing
    await cta.click(); await p.waitForSelector('[role=dialog] iframe'); await p.waitForTimeout(2500)
    const before = reqs.filter(u => u.endsWith('/erp/dashboard.html')).length
    await p.waitForTimeout(3000); ck(`${name} no reload while open`, reqs.filter(u => u.endsWith('/erp/dashboard.html')).length === before)
    await p.getByRole('button', { name: /Close dashboard/ }).click(); await p.waitForTimeout(500)
    ck(`${name} close button`, await p.locator('[role=dialog]').count() === 0)
    ck(`${name} console/network errors`, errs.length === 0, errs.slice(0,3).join(' | '))
    if (!mobile) { // modified click keeps normal link behaviour (new tab), no modal
      const [np] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(()=>null), cta.click({ modifiers: ['Control'] })])
      ck(`${name} ctrl-click opens tab, no modal`, !!np && await p.locator('[role=dialog]').count() === 0)
    }
    await ctx.close()
  }
  // error state: dashboard blocked
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage()
  await p.route('**/erp/dashboard.html', r => r.fulfill({ status: 404, contentType: 'text/html', body: '<h1>nope</h1>' }))
  await p.goto(`http://localhost:${PORT}/en/`); await p.waitForTimeout(600)
  const cta = p.locator('main a[href$="/erp/dashboard.html"]').first(); await cta.scrollIntoViewIfNeeded(); await cta.click()
  await p.waitForSelector('[role=alert]', { timeout: 8000 }); ck('error state shown with retry', await p.getByRole('button', { name: 'Try again' }).count() === 1)
  await b.close(); console.log(bad ? 'FAIL ' + bad : 'ALL PASS')
})()
