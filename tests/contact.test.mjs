// Server-side contact API tests. Uses a LOCAL mock of the email provider: no real email is sent.
import http from 'node:http'
import assert from 'node:assert/strict'
const sent = []
let providerMode = 'ok'
const mock = http.createServer((req, res) => {
  let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => {
    sent.push({ auth: req.headers.authorization, body: JSON.parse(d) })
    if (providerMode === 'fail') { res.writeHead(500); return res.end('{"message":"boom"}') }
    if (providerMode === 'noid') { res.writeHead(200); return res.end('{}') }
    res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"id":"test-id-1"}')
  })
}).listen(0)
const port = mock.address().port
process.env.RESEND_API_URL = `http://127.0.0.1:${port}/emails`
process.env.RESEND_API_KEY = 'test_key_not_real'; process.env.CONTACT_FROM_EMAIL = 'RaapNexus <sender@test.invalid>'
const { default: handler } = await import('../api/contact.js')
const call = async (body, { method = 'POST', headers = {} } = {}) => {
  let out; const res = { _h: {}, status(c) { this.code = c; return this }, setHeader(k, v) { this._h[k] = v }, send(x) { out = JSON.parse(x) } }
  await handler({ method, headers: { host: 'site.test', ...headers }, body, socket: { remoteAddress: '1.1.1.1' } }, res)
  return { code: res.code, out }
}
const good = (o = {}) => ({ name: 'Test User', company: 'Acme', email: 'visitor@example.com', phone: '+971 50 123 4567', country: 'UAE', subject: 'Demo request', message: 'Hello, I would like a demo of RaapNexus please.', consent: true, website: '', elapsed: 9000, ...o })
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log('PASS', name) }

await t('GET rejected 405', async () => assert.equal((await call(null, { method: 'GET' })).code, 405))
await t('empty body rejected 400', async () => assert.equal((await call({})).code, 400))
await t('missing required fields -> field errors', async () => { const r = await call({ elapsed: 9000 }); assert.equal(r.code, 400); assert.ok(r.out.errors.name && r.out.errors.email && r.out.errors.subject && r.out.errors.message && r.out.errors.consent) })
await t('invalid email', async () => { const r = await call(good({ email: 'not-an-email' })); assert.equal(r.code, 400); assert.equal(r.out.errors.email, 'email') })
await t('invalid phone', async () => assert.equal((await call(good({ phone: 'abc' }))).out.errors.phone, 'phone'))
await t('short message', async () => assert.equal((await call(good({ message: 'hi' }))).out.errors.message, 'message'))
await t('too long message', async () => assert.equal((await call(good({ message: 'x'.repeat(3001) }))).out.errors.message, 'message'))
await t('consent required (must be boolean true)', async () => assert.equal((await call(good({ consent: 'true' }))).out.errors.consent, 'consent'))
await t('cross-origin rejected 403', async () => assert.equal((await call(good(), { headers: { origin: 'https://evil.example' } })).code, 403))
await t('honeypot: silent success, nothing sent', async () => { const b = sent.length; const r = await call(good({ website: 'http://spam' })); assert.equal(r.code, 200); assert.equal(sent.length, b) })
await t('too-fast submit: nothing sent', async () => { const b = sent.length; const r = await call(good({ elapsed: 200 })); assert.equal(r.code, 200); assert.equal(sent.length, b) })
await t('valid submission: provider called with Reply-To = visitor, From = configured sender', async () => {
  const b = sent.length; const r = await call(good({ subject: 'A\r\nBcc: evil@x.com' }), { headers: { origin: 'https://site.test'.replace('https://', 'http://') } })
  assert.equal(r.code, 200); assert.equal(r.out.ok, true)
  const inbox = sent[b].body
  assert.deepEqual(inbox.to, ['project@techlogica.com']); assert.equal(inbox.reply_to, 'visitor@example.com'); assert.equal(inbox.from, 'RaapNexus <sender@test.invalid>')
  assert.ok(!/[\r\n]/.test(inbox.subject), 'subject has no header injection'); assert.ok(inbox.text.includes('Submitted (UTC)') && inbox.text.includes('Acme') && inbox.text.includes('+971'))
  assert.equal(sent[b].auth, 'Bearer test_key_not_real'); assert.equal(sent[b + 1].body.to[0], 'visitor@example.com', 'acknowledgement sent')
})
await t('HTML is escaped in the email', async () => { const b = sent.length; await call(good({ email: 'x2@example.com', message: '<script>alert(1)</script> hello there friend' })); assert.ok(!sent[b].body.html.includes('<script>')); assert.ok(sent[b].body.html.includes('&lt;script&gt;')) })
await t('duplicate submission not re-sent', async () => { await call(good({ email: 'dup@example.com' })); const b = sent.length; const r = await call(good({ email: 'dup@example.com' })); assert.equal(r.code, 200); assert.equal(sent.length, b) })
await t('provider failure -> 502, no success', async () => { providerMode = 'fail'; const r = await call(good({ email: 'f@example.com', subject: 'Fail case' })); providerMode = 'ok'; assert.equal(r.code, 502); assert.notEqual(r.out.ok, true) })
await t('provider 200 without id -> 502', async () => { providerMode = 'noid'; const r = await call(good({ email: 'g@example.com', subject: 'No id case' })); providerMode = 'ok'; assert.equal(r.code, 502) })
await t('rate limit -> 429', async () => { let last; for (let i = 0; i < 8; i++) last = await call(good({ email: `r${i}@example.com`, subject: `Rate ${i}` })); assert.equal(last.code, 429) })
delete process.env.RESEND_API_KEY
await t('not configured -> 503 (never fake success)', async () => { const r = await call(good({ email: 'h@example.com', subject: 'cfg' }), { headers: { 'x-forwarded-for': '9.9.9.9' } }); assert.equal(r.code, 503); assert.notEqual(r.out.ok, true) })
console.log(`\n${n} tests passed`); mock.close()
