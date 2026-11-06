const { chromium } = require('playwright')
const B = 'http://localhost:' + (process.env.PORT || 4291); let fails = 0
const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + m) }
const EMBED = `<!doctype html><body style="background:#123"><script>addEventListener('message',e=>{if(typeof e.data==='string'&&e.data.includes('listening')){let t=+(new URLSearchParams(location.search).get('start')||0);setInterval(()=>{t+=1;parent.postMessage(JSON.stringify({event:'infoDelivery',info:{currentTime:t}}),'*')},200)}})</script></body>`
;(async () => {
  const b = await chromium.launch()
  for (const [w, h, cols] of [[1920, 1080, 4], [1440, 900, 4], [1366, 768, 3], [1024, 768, 3], [900, 1000, 2], [768, 1024, 2], [430, 932, 1], [390, 844, 1], [360, 800, 1]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800 })
    await ctx.route(/img\.youtube\.com|ytimg/, (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#246"/></svg>' }))
    await ctx.route(/youtube-nocookie\.com\/embed/, (r) => r.fulfill({ contentType: 'text/html', body: EMBED }))
    const p = await ctx.newPage(); await p.goto(B + '/en/demo-videos', { waitUntil: 'load' }); await p.waitForTimeout(2500)
    const r = await p.evaluate(() => {
      const fr = [...document.querySelectorAll('[data-component=video-showcase]')]
      const tops = [...new Set(fr.map((f) => Math.round(f.getBoundingClientRect().top + scrollY)))]
      const first = fr.filter((f) => Math.abs(Math.round(f.getBoundingClientRect().top + scrollY) - tops[0]) < 30).length
      const sc = fr.map((f) => { const r = f.querySelector('.aspect-video').getBoundingClientRect(); return r.width / r.height })
      const tb = fr.map((f) => { const bs = [...f.querySelectorAll('button[aria-label]')].slice(0, 2).map((x) => x.getBoundingClientRect()); const pill = f.querySelector('span.truncate')?.getBoundingClientRect(); return bs.length === 2 && (!pill || pill.width === 0 || (pill.right <= bs[0].left + 1 && pill.left >= 0)) })
      return { n: fr.length, perRow: first, ov: document.documentElement.scrollWidth - innerWidth, ratios: sc, tb, w: Math.round(fr[0].getBoundingClientRect().width) }
    })
    log(r.n === 4 && r.perRow === Math.min(cols, 4) && r.ov <= 0 && r.ratios.every((x) => Math.abs(x - 16 / 9) < 0.02) && r.tb.every(Boolean), `${w}x${h}: ${r.perRow}/row (want ${cols}), card ${r.w}px, overflow ${r.ov}, 16:9 ok, toolbar no overlap`)
    if ([1440, 1024, 768, 390].includes(w)) await p.screenshot({ path: `/tmp/lib_${w}.png`, fullPage: false })
    if (w === 1440 || w === 1024 || w === 390) {
      // controls on every video
      const n = await p.locator('[data-component=video-showcase]').count(); let okAll = true
      for (let i = 0; i < n; i++) {
        const f = p.locator('[data-component=video-showcase]').nth(i)
        await f.scrollIntoViewIfNeeded(); await f.getByRole('button', { name: /Expand video/ }).first().click({ force: true }); 
        try { await p.waitForSelector('[role=dialog] iframe', { timeout: 4000 }); const d = await p.locator('[role=dialog] .aspect-video').boundingBox(); if (!(d.x >= 0 && d.x + d.width <= w + 1)) { okAll = false; console.log("  step fail video", i) } } catch (e) { okAll = false; console.log("  err", i, String(e).slice(0,160)) }
        await p.waitForTimeout(700); await p.keyboard.press('Escape'); await p.waitForSelector('[role=dialog]', { state: 'detached' }).catch(() => { okAll = false; console.log("  step fail esc", i) })
        await f.getByRole('button', { name: 'Mini window' }).first().click({ force: true })
        try { await p.waitForSelector('[role=region] iframe', { timeout: 4000 }); await p.waitForTimeout(500); const src = await p.locator('[role=region] iframe').getAttribute('src'); if (!/start=[1-9]/.test(src)) { okAll = false; console.log("  resume fail", i, src) }; await p.locator('[role=region]').getByRole('button', { name: /Return/ }).click({ force: true }); await p.waitForTimeout(500); await f.getByRole('button', { name: 'Mini window' }).first().click({ force: true }); await p.getByRole('button', { name: /Close mini/ }).click({ force: true }); await p.waitForTimeout(900) } catch (e) { okAll = false; console.log("  err", i, String(e).slice(0,160)) }
      }
      log(okAll, `${w}: expand (Esc) + mini (resume, Return, Close) work on all ${n} videos`)
      // keyboard
      await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1500)
      const eb = p.locator('[data-component=video-showcase]').first().getByRole('button', { name: /Expand video/ }); await eb.focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[role=dialog]', { timeout: 4000 }).then(() => log(true, `${w}: Expand via keyboard Enter`), () => log(false, 'keyboard expand')); await p.keyboard.press('Escape')
    }
    await ctx.close()
  }
  // landing: the Video section is the 3D "coming soon" stage (COMING_SOON in VideoGallery.tsx); set the flag to false to restore the 2 players
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); await p.goto(B + '/en/', { waitUntil: 'load' }); await p.waitForTimeout(1500)
  log((await p.locator('#demo-videos [data-component=coming-soon]').count()) === 1 && (await p.locator('#demo-videos [data-component=video-showcase]').count()) === 0 && (await p.locator('#demo-videos a[href$="/demo-videos"]').count()) === 1, 'landing shows the coming-soon stage (no players) and still links to the library')
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); process.exit(fails ? 1 : 0)
})()
