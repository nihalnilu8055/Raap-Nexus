const { chromium } = require('playwright')
const B = 'http://localhost:4180'
const out = process.env.OUT || '/tmp'
const log = (ok, m) => console.log((ok ? 'PASS ' : 'FAIL ') + m)
;(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
  const pg = await ctx.newPage(); const errs = []
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/net::|Failed to load|ERR_|Content Security|fonts|rates|exchange/i.test(m.text())) errs.push(m.text()) })
  await pg.goto(B + '/en/', { waitUntil: 'load' }); await pg.waitForTimeout(4000)
  const dialogs = await pg.evaluate(() => ({ region: !!document.querySelector('[aria-label="Language and currency"]'), txt: /Show amounts in|Would you like to view/i.test(document.body.innerText), dlg: !!document.querySelector('[role=dialog]') }))
  log(!dialogs.region && !dialogs.txt && !dialogs.dlg, 'no language/currency popup after 4s on direct load ' + JSON.stringify(dialogs))
  // language selector
  await pg.getByRole('button', { name: /Language/ }).first().click()
  const langs = await pg.locator('[role=listbox] [role=option]').allInnerTexts()
  log(langs.length === 5 && !langs.join(' ').match(/हिन्दी|Hindi/), 'language options: ' + langs.map((x) => x.replace(/\n/g, '/')).join(', '))
  await pg.keyboard.press('Escape')
  // switch language to French via UI, hash and route
  await pg.getByRole('button', { name: /Language/ }).first().click(); await pg.locator('[role=option]', { hasText: 'Français' }).click(); await pg.waitForTimeout(500)
  log(pg.url().endsWith('/fr/'), 'language switch -> ' + pg.url()); log(!(await pg.getByRole('button', { name: /Currency|Devise/ }).count()), 'no currency control after language change')
  await pg.goto(B + '/en/', { waitUntil: 'load' }); await pg.waitForTimeout(1500)
  // hindi route
  const r = await pg.goto(B + '/hi/'); log(pg.url().endsWith('/en/'), 'old /hi/ redirects to /en/ (' + pg.url() + ')')
  await pg.waitForTimeout(1500)
  // CTAs
  const exp = pg.locator('main a', { hasText: 'Explore Platform' }).first()
  log((await exp.getAttribute('target')) === '_blank' && /noopener/.test(await exp.getAttribute('rel')) && /noreferrer/.test(await exp.getAttribute('rel')), 'hero Explore Platform target=_blank rel=' + (await exp.getAttribute('rel')) + ' href=' + (await exp.getAttribute('href')))
  const popP = ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null); await exp.click(); const np = await popP
  log(!!np, 'Explore Platform opened a new tab' + (np ? ' -> ' + np.url() : '')); if (np) await np.close()
  const cnt = await pg.locator('a', { hasText: /^Explore Platform$/ }).count(); console.log('INFO Explore Platform anchors on page:', cnt)
  const rs = await pg.request.get(B + '/erp/dashboard.html'); log(rs.status() === 200, 'local /erp/dashboard.html status ' + rs.status())
  // contact: scroll then open from hero
  await pg.evaluate(() => scrollTo(0, 0))
  await pg.locator('header').getByRole('button', { name: 'Contact Us' }).click(); await pg.waitForSelector('[role=dialog]')
  log(true, 'Contact Us (header) opens dialog'); await pg.screenshot({ path: out + '/c_open.png' })
  await pg.getByRole('button', { name: 'Submit Inquiry' }).click(); await pg.waitForTimeout(300)
  const errsTxt = await pg.locator('[role=dialog] [role=alert]').allInnerTexts(); log(errsTxt.length >= 5, 'empty submit shows inline errors: ' + errsTxt.length)
  await pg.screenshot({ path: out + '/c_errors.png' })
  await pg.getByLabel(/Full name/).fill('Test Visitor'); await pg.getByLabel(/Business email/).fill('bad@'); await pg.getByLabel(/Subject/).fill('Demo'); await pg.getByLabel(/Message/).fill('Short'); await pg.getByRole('button', { name: 'Submit Inquiry' }).click(); await pg.waitForTimeout(200)
  const t2 = await pg.locator('[role=dialog]').innerText(); log(/valid email/.test(t2) && /at least 10/.test(t2) && /Please accept/.test(t2), 'invalid email / short message / consent errors')
  await pg.getByLabel(/Business email/).fill('visitor@example.com'); await pg.getByLabel(/Message/).fill('I would like to see a demo of the platform.'); await pg.getByLabel(/I agree/).check()
  await pg.waitForTimeout(1700)
  // double click -> single send
  await pg.getByRole('button', { name: 'Submit Inquiry' }).dblclick(); await pg.waitForSelector('text=Message sent', { timeout: 8000 })
  log(true, 'valid submission shows success only after server OK'); await pg.screenshot({ path: out + '/c_success.png' })
  const sent = await (await pg.request.get(B + '/__mock/sent')).json(); const inbox = sent.filter((m) => m.to[0] === 'project@techlogica.com')
  log(inbox.length === 1 && inbox[0].reply_to === 'visitor@example.com', 'exactly one inbox email (double-click safe), reply_to=visitor; total mails incl. ack=' + sent.length)
  await pg.getByRole('button', { name: 'Done' }).click(); await pg.waitForSelector('[role=dialog]', { state: 'detached', timeout: 8000 }).catch(() => {})
  log((await pg.locator('[role=dialog]').count()) === 0, 'dialog closes')
  // provider failure
  await pg.request.get(B + '/__mock/fail')
  await pg.locator('header').getByRole('button', { name: 'Contact Us' }).click(); await pg.waitForSelector('[role=dialog]')
  await pg.getByLabel(/Full name/).fill('Fail Case'); await pg.getByLabel(/Business email/).fill('fail@example.com'); await pg.getByLabel(/Subject/).fill('Failure test'); await pg.getByLabel(/Message/).fill('This should fail at the provider.'); await pg.getByLabel(/I agree/).check(); await pg.waitForTimeout(1700)
  await pg.getByRole('button', { name: 'Submit Inquiry' }).click(); await pg.waitForTimeout(1500)
  const failTxt = await pg.locator('[role=dialog]').innerText(); log(/could not send/.test(failTxt) && !/Message sent/.test(failTxt), 'provider failure shows error, no success'); await pg.screenshot({ path: out + '/c_fail.png' })
  await pg.request.get(B + '/__mock/ok'); await pg.keyboard.press('Escape'); await pg.waitForSelector('[role=dialog]', { state: 'detached', timeout: 8000 })
  // scroll position retained + focus return
  await pg.evaluate(() => scrollTo(0, 3000)); await pg.waitForTimeout(500); const y0 = await pg.evaluate(() => scrollY)
  await pg.locator('header').getByRole('button', { name: 'Contact Us' }).click(); await pg.waitForSelector('[role=dialog]'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(500)
  const y1 = await pg.evaluate(() => scrollY); log(Math.abs(y0 - y1) < 5, `scroll position kept after closing form (${y0} -> ${y1})`)
  console.log('console/page errors:', errs.length ? errs : 'none')
  await b.close()
  // unconfigured server
  const b2 = await chromium.launch(); const p2 = await (await b2.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  await p2.goto('http://localhost:4181/en/', { waitUntil: 'load' }); await p2.waitForTimeout(1500); await p2.locator('header').getByRole('button', { name: 'Contact Us' }).click(); await p2.waitForSelector('[role=dialog]')
  await p2.getByLabel(/Full name/).fill('Cfg Case'); await p2.getByLabel(/Business email/).fill('cfg@example.com'); await p2.getByLabel(/Subject/).fill('Config test'); await p2.getByLabel(/Message/).fill('Server has no email configuration.'); await p2.getByLabel(/I agree/).check(); await p2.waitForTimeout(1700)
  await p2.getByRole('button', { name: 'Submit Inquiry' }).click(); await p2.waitForTimeout(1200)
  const ct = await p2.locator('[role=dialog]').innerText(); log(/temporarily unavailable/.test(ct) && !/Message sent/.test(ct), 'unconfigured server -> unavailable message, never success')
  await b2.close()
})()
