// Local E2E server: serves dist/ like Vercel (static + SPA fallback) and runs api/contact.js against a LOCAL MOCK email provider.
// Mock provider mode can be switched at runtime: GET /__mock/fail, /__mock/ok, /__mock/sent
import http from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
const dist = join(process.cwd(), 'dist'), port = +(process.argv[2] || 4180)
const sent = []; let mode = 'ok'
const mock = http.createServer((req, res) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { sent.push(JSON.parse(d)); if (mode === 'fail') { res.writeHead(500); return res.end('{}') } res.writeHead(200, { 'content-type': 'application/json' }); res.end('{"id":"mock-1"}') }) }).listen(0)
process.env.RESEND_API_URL = `http://127.0.0.1:${mock.address().port}/emails`
if (process.env.NO_CONFIG !== '1') { process.env.RESEND_API_KEY = 'mock_key'; process.env.CONTACT_FROM_EMAIL = 'RaapNexus <sender@mock.invalid>' }
const { default: contact } = await import('../api/contact.js')
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' }
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x')
  if (u.pathname === '/__mock/fail') { mode = 'fail'; return res.end('ok') }
  if (u.pathname === '/__mock/ok') { mode = 'ok'; return res.end('ok') }
  if (u.pathname === '/__mock/sent') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify(sent)) }
  if (u.pathname === '/api/contact') {
    let d = ''; for await (const c of req) d += c
    let body; try { body = JSON.parse(d) } catch { body = null }
    const r = { status(c) { res.statusCode = c; return r }, setHeader: (k, v) => res.setHeader(k, v), send: (x) => res.end(x) }
    return contact({ method: req.method, headers: req.headers, body, socket: req.socket }, r)
  }
  if (/^\/hi(\/|$)/.test(u.pathname)) { res.writeHead(301, { location: '/en/' }); return res.end() }
  let p = join(dist, decodeURIComponent(u.pathname))
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html')
  if (!existsSync(p)) p = join(dist, 'index.html')
  res.setHeader('content-type', T[extname(p)] || 'application/octet-stream'); res.end(readFileSync(p))
}).listen(port, () => console.log('serving', port))
