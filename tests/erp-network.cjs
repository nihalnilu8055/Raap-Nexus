// Network-log check: every open / reopen / page refresh must hit the network for the dashboard (never a plain cache hit).
const { chromium } = require('playwright'); const PORT = process.env.PORT || 4400
;(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage()
  const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable')
  const log = []; const ids = new Map()
  cdp.on('Network.requestWillBeSent', e => { if (e.request.url.endsWith('/erp/dashboard.html')) { ids.set(e.requestId, { n: log.length + 1, ifNone: Object.keys(e.request.headers).some(k => k.toLowerCase() === 'if-none-match') }); log.push({ id: e.requestId, hdr: e.request.headers }) } })
  cdp.on('Network.requestServedFromCache', e => { if (ids.has(e.requestId)) ids.get(e.requestId).cache = true })
  cdp.on('Network.responseReceived', e => { if (ids.has(e.requestId)) Object.assign(ids.get(e.requestId), { status: e.response.status, fromDisk: e.response.fromDiskCache, cc: Object.entries(e.response.headers).find(([k]) => k.toLowerCase() === 'cache-control')?.[1] }) })
  let bad = 0; const ck = (n, ok, x = '') => { if (!ok) bad++; console.log(ok ? 'OK ' : 'BAD', n, x) }
  const open = async () => { const c = p.locator('main a[href$="/erp/dashboard.html"]').first(); await c.scrollIntoViewIfNeeded(); await c.click(); await p.waitForFunction(() => { const f = document.querySelector('[role=dialog] iframe'); return f && getComputedStyle(f).opacity === '1' }, null, { timeout: 15000 }); await p.waitForTimeout(800) }
  await p.goto(`http://localhost:${PORT}/en/`); await p.waitForTimeout(600)
  await open(); await p.keyboard.press('Escape'); await p.waitForTimeout(500)
  await open(); await p.keyboard.press('Escape'); await p.waitForTimeout(500)
  await p.reload(); await p.waitForTimeout(800); await open()
  const rows = [...ids.values()]
  rows.forEach(r => console.log(`  request#${r.n} status=${r.status} cache-control="${r.cc}" conditional(If-None-Match)=${r.ifNone} servedFromCache=${!!r.cache}`))
  ck('3 openings (open, reopen, after page refresh) = 3 network requests', rows.length === 3, String(rows.length))
  ck('none served straight from the HTTP cache', rows.every(r => !r.cache && !r.fromDisk))
  ck('responses are 200 or 304 (revalidated with the server)', rows.every(r => r.status === 200 || r.status === 304))
  ck('Cache-Control no-cache on every response', rows.every(r => /no-cache/.test(r.cc || '')))
  ck('each opening got a full 200 or a server-validated 304 (never stale)', rows.every(r => r.status === 200 || (r.status === 304 && r.ifNone)))
  await b.close(); console.log(bad ? 'FAIL ' + bad : 'ALL PASS')
})()
