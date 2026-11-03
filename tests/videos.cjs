const { chromium } = require('playwright')
const B = 'http://localhost:4290'
let fails = 0
const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + m) }
const EMBED = `<!doctype html><body style="margin:0;background:#123"><script>
addEventListener('message',e=>{ if(typeof e.data==='string'&&e.data.includes('listening')){ let t=+(new URLSearchParams(location.search).get('start')||0); setInterval(()=>{t+=1;parent.postMessage(JSON.stringify({event:'infoDelivery',info:{currentTime:t}}),'*')},200)}})
</script>PLAYER</body>`
async function setup(b, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  await ctx.route(/img\.youtube\.com|ytimg/, (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="1280" height="720" fill="#246"/></svg>' }))
  await ctx.route(/youtube-nocookie\.com\/embed/, (r) => r.fulfill({ contentType: 'text/html', body: EMBED }))
  return ctx
}
;(async () => {
  const b = await chromium.launch()
  const ctx = await setup(b); const pg = await ctx.newPage(); const errs = []; const pages = []
  pg.on('pageerror', (e) => errs.push(e.message)); ctx.on('page', (p) => pages.push(p))
  await pg.goto(B + '/en/', { waitUntil: 'load' }); await pg.locator('#demo-videos').scrollIntoViewIfNeeded(); await pg.waitForTimeout(2500)
  const sec = pg.locator('#demo-videos')
  log((await sec.locator('[data-video-frame], [data-component=video-showcase]').count()) === 2, 'landing: exactly 2 video mockups')
  log((await sec.locator('h2').innerText()) === 'Explore RaapNexus ERP in Action', 'heading')
  log((await sec.innerText()).includes('Experience how RaapNexus simplifies financial management'), 'supporting text')
  const txt = await sec.innerText()
  log(!/youtube|youtu\.be|watch on|sample/i.test(txt) && (await sec.locator('a[href*=youtube]').count()) === 0, 'no YouTube text/links in UI')
  log((await sec.locator('iframe').count()) === 0, 'no iframe before Play (lazy)')
  log((await sec.locator('a').allInnerTexts()).some((x) => /Explore All Demo Videos/.test(x)), 'CTA present')
  const frame = sec.locator('[data-component=video-showcase]').first()
  const box = await frame.locator('.aspect-video').boundingBox(); log(Math.abs(box.width / box.height - 16 / 9) < 0.02, '16:9 screen ' + box.width.toFixed(0) + 'x' + box.height.toFixed(0))
  const url0 = pg.url()
  await frame.getByRole('button', { name: /Play/ }).click({ force: true }); await pg.waitForSelector('#demo-videos iframe')
  const f = await frame.locator('iframe').first()
  const srcA = await f.getAttribute('src'); const id = await frame.getAttribute('data-video-id')
  log(srcA.startsWith('https://www.youtube-nocookie.com/embed/' + id) && /autoplay=1/.test(srcA) && /enablejsapi=1/.test(srcA), 'inline iframe nocookie src for ' + id)
  log(!!(await f.getAttribute('title')), 'iframe title attr'); log(pages.length === 0 && pg.url() === url0, 'no new tab, URL unchanged')
  await pg.waitForTimeout(1500)
  // second video stops the first
  const f2 = sec.locator('[data-component=video-showcase]').nth(1)
  await f2.getByRole('button', { name: /Play/ }).click({ force: true }); await pg.waitForTimeout(500)
  log((await sec.locator('iframe').count()) === 1 && (await frame.locator('iframe').count()) === 0, 'starting second video stops first')
  // expand
  await f2.getByRole('button', { name: 'Expand' }).click({ force: true }); await pg.waitForSelector('[role=dialog] iframe'); await pg.waitForTimeout(600)
  const dsrc = await pg.locator('[role=dialog] iframe').getAttribute('src'); log(/start=\d+/.test(dsrc) && !/start=0\b/.test(dsrc), 'expanded resumes position: ' + dsrc.match(/start=\d+/))
  const db = await pg.locator('[role=dialog] .aspect-video').boundingBox(); log(db.width > 900 && db.x > 0 && Math.abs(db.x + db.width / 2 - 720) < 5, 'expanded centred/large ' + Math.round(db.width))
  await pg.screenshot({ path: '/tmp/vid_expanded.png' })
  const y0 = await pg.evaluate(() => scrollY)
  await pg.keyboard.press('Escape'); await pg.waitForSelector('[role=dialog]', { state: 'detached' })
  log((await pg.evaluate(() => scrollY)) === y0 && (await f2.locator('iframe').count()) === 1, 'Escape closes, scroll kept, back inline')
  log(await pg.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Expand video'), 'focus restored to Expand button')
  await f2.getByRole('button', { name: 'Expand' }).click({ force: true }); await pg.waitForSelector('[role=dialog]'); await pg.getByRole('button', { name: /Close/ }).first().click({ force: true }); await pg.waitForSelector('[role=dialog]', { state: 'detached' }); log(true, 'close button works')
  // mini window
  await f2.getByRole('button', { name: /mini window/i }).click({ force: true }); await pg.waitForSelector('[role=region] iframe'); await pg.waitForTimeout(500)
  const mw = pg.locator('[role=region]:has(iframe)'); await pg.mouse.wheel(0, 1500); await pg.waitForTimeout(700)
  const m1 = await mw.boundingBox(); log(m1 && m1.y > 400 && m1.y + m1.height <= 900, 'mini window stays fixed while scrolling')
  await pg.screenshot({ path: '/tmp/vid_mini.png' })
  await mw.getByRole('button', { name: /Return/ }).click({ force: true }); await pg.waitForTimeout(500); log((await pg.locator('[role=region]:has(iframe)').count()) === 0 && (await sec.locator('iframe').count()) === 1, 'Return to frame')
  await f2.getByRole('button', { name: /mini window/i }).click({ force: true }); await pg.waitForSelector('[role=region] iframe'); await pg.getByRole('button', { name: /Close mini/i }).click({ force: true }); await pg.waitForTimeout(1500)
  log((await pg.locator('iframe').count()) === 0, 'mini close stops video')
  // error state
  await pg.route(/youtube-nocookie\.com\/embed/, (r) => r.fulfill({ contentType: 'text/html', body: '<script>parent.postMessage(JSON.stringify({event:"onError",info:101}),"*");addEventListener("message",()=>parent.postMessage(JSON.stringify({event:"onError",info:101}),"*"))</script>' }))
  await frame.getByRole('button', { name: /Play/ }).click({ force: true }); await pg.waitForSelector('[role=alert]', { timeout: 6000 }); log(true, 'error state shown')
  await pg.unroute(/youtube-nocookie\.com\/embed/); await ctx.route(/youtube-nocookie\.com\/embed/, (r) => r.fulfill({ contentType: 'text/html', body: EMBED }))
  await pg.getByRole('button', { name: /Try again|Retry/i }).click({ force: true }); await pg.waitForTimeout(1200); log((await pg.locator('[role=alert]').count()) === 0, 'retry recovers')
  // CTA -> library
  await pg.getByRole('link', { name: /Explore All Demo Videos/ }).click({ force: true }); await pg.waitForURL('**/en/demo-videos'); await pg.waitForTimeout(1500)
  log((await pg.locator('h1').innerText()) === 'RaapNexus ERP Demo Library', 'library h1')
  log((await pg.locator('[data-component=video-showcase]').count()) === 4, 'library shows all 4 with same component')
  log((await pg.locator('main a[href*=youtube], iframe').count()) === 0, 'library: no YouTube links, no iframes before play')
  await pg.locator('#vl-search').fill('SAP'); await pg.waitForTimeout(1800); log((await pg.locator('[data-component=video-showcase]').count()) === 1, 'search filters')
  await pg.locator('#vl-search').fill('zzzz'); await pg.waitForTimeout(1800); log((await pg.locator('[data-component=video-showcase]').count()) === 0, 'empty state')
  await pg.locator('#vl-search').fill(''); await pg.waitForTimeout(500)
  const pills = pg.locator('button[aria-pressed]'); log((await pills.count()) >= 3, 'category filters (' + (await pills.count()) + ')')
  await pills.nth(1).click({ force: true }); await pg.waitForTimeout(1800); const n1 = await pg.locator('[data-component=video-showcase]').count(); log(n1 > 0 && n1 < 4, 'category filter narrows: ' + n1)
  await pills.nth(0).click({ force: true }); await pg.waitForTimeout(700)
  await pg.locator('[data-component=video-showcase]').first().getByRole('button', { name: /Play/ }).click({ force: true }); await pg.waitForSelector('main iframe, iframe'); log(true, 'library plays inline')
  log(errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
  await ctx.close()
  // responsive
  for (const [w, h] of [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [768, 1024], [430, 932], [390, 844], [360, 800]]) {
    const c = await setup(b, { viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 500 }); const p = await c.newPage()
    await p.goto(B + '/en/', { waitUntil: 'load' }); await p.locator('#demo-videos').scrollIntoViewIfNeeded(); await p.waitForTimeout(3000)
    const r = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, b: [...document.querySelectorAll('#demo-videos [data-component=video-showcase] .aspect-video')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)] }) }))
    const side = r.b.length === 2 && Math.abs(r.b[0][1] - r.b[1][1]) < 40
    log(r.ov <= 0 && r.b.length === 2 && (w >= 1024 ? side : !side), `${w}x${h}: 2 frames ${w >= 1024 ? 'side by side' : 'stacked'}, overflow ${r.ov}, widths ${r.b.map((x) => x[2])}`)
    if (w === 390) { await p.locator('[data-component=video-showcase]').first().getByRole('button', { name: 'Expand' }).click({ force: true }); await p.waitForSelector('[role=dialog] iframe'); const d = await p.locator('[role=dialog] .aspect-video').boundingBox(); log(d.width > 330 && d.x >= 0, 'mobile expand fits ' + Math.round(d.width)); await p.screenshot({ path: '/tmp/vid_m_exp.png' }) }
    if (w === 1440) await p.screenshot({ path: '/tmp/vid_landing.png' })
    await c.close()
  }
  // reduced motion + touch
  const rc = await setup(b, { reducedMotion: 'reduce' }); const rp = await rc.newPage(); await rp.goto(B + '/en/', { waitUntil: 'load' }); await rp.locator('#demo-videos').scrollIntoViewIfNeeded(); await rp.waitForTimeout(1500)
  log(await rp.evaluate(() => getComputedStyle(document.querySelector('.rn-float') || document.body).animationName === 'none' || !document.querySelector('.rn-float')), 'reduced motion: no float')
  await b.close(); console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0)
})()
