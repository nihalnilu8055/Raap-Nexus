// Vercel Serverless Function: POST /api/contact
// Validates the enquiry on the server, then sends it to the RaapNexus inbox through a transactional email API (Resend REST).
// All secrets come from environment variables, nothing is hardcoded and nothing reaches the browser bundle:
//   RESEND_API_KEY      API key of the email provider
//   CONTACT_TO_EMAIL    optional override; defaults to project@techlogica.com
//   CONTACT_FROM_EMAIL  a sender address on a domain verified with the provider, e.g. "RaapNexus <no-reply@your-verified-domain>"
//   CONTACT_SEND_ACK    optional, "false" disables the acknowledgement email to the visitor (default: enabled)
//   RESEND_API_URL      optional override of the provider endpoint (used by tests)
// Success is returned only after the provider confirms acceptance of the inbox email.
// Verified RaapNexus inbox; CONTACT_TO_EMAIL can override it (e.g. for staging)
const DEFAULT_TO = 'project@techlogica.com'
const L = { name: 100, company: 120, email: 254, phone: 25, country: 80, subject: 150, messageMin: 10, message: 3000 }
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const hits = new Map() // best-effort per-instance rate limiting (serverless instances are ephemeral)
const seen = new Map() // recent payload hashes, to stop accidental double submits
const WINDOW = 15 * 60 * 1000, MAX_HITS = 5, DUP_MS = 60 * 1000

const oneLine = (v, max) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max)
const text = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const json = (res, status, body) => { res.status(status).setHeader('content-type', 'application/json'); res.setHeader('cache-control', 'no-store'); res.send(JSON.stringify(body)) }

export function validate(b) {
  const e = {}
  const v = {
    name: oneLine(b.name, L.name + 1), company: oneLine(b.company, L.company + 1), email: oneLine(b.email, L.email + 1), phone: oneLine(b.phone, L.phone + 1),
    country: oneLine(b.country, L.country + 1), subject: oneLine(b.subject, L.subject + 1), message: text(b.message, L.message + 1),
  }
  if (v.name.length < 2 || v.name.length > L.name) e.name = 'name'
  if (!EMAIL.test(v.email) || v.email.length > L.email) e.email = 'email'
  const digits = v.phone.replace(/\D/g, '')
  if (v.phone && (!/^[+0-9()\-.\s]{6,25}$/.test(v.phone) || digits.length < 7 || digits.length > 15)) e.phone = 'phone'
  if (v.company.length > L.company) e.company = 'long'
  if (v.country.length > L.country) e.country = 'long'
  if (v.subject.length < 3 || v.subject.length > L.subject) e.subject = 'subject'
  if (v.message.length < L.messageMin || v.message.length > L.message) e.message = 'message'
  if (b.consent !== true) e.consent = 'consent'
  return { v, e }
}

function compose(v, when, ip) {
  const rows = [['Name', v.name], ['Company', v.company || '-'], ['Email', v.email], ['Phone', v.phone || '-'], ['Country', v.country || '-'], ['Subject', v.subject], ['Submitted (UTC)', when]]
  const textBody = rows.map(([k, x]) => `${k}: ${x}`).join('\n') + `\n\nMessage:\n${v.message}\n\nConsent to be contacted: yes\n`
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:640px">
<h2 style="margin:0 0 12px;color:#1d4ed8">New RaapNexus website enquiry</h2>
<table style="border-collapse:collapse;width:100%">${rows.map(([k, x]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(x)}</td></tr>`).join('')}</table>
<h3 style="margin:18px 0 6px">Message</h3><div style="white-space:pre-wrap;border-left:3px solid #93c5fd;padding-left:12px">${esc(v.message)}</div>
<p style="margin-top:18px;font-size:12px;color:#64748b">The visitor agreed to be contacted about this enquiry. Reply to this email to answer them directly.</p></div>`
  return { textBody, html }
}

async function sendMail(payload, key, url) {
  const r = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) })
  let j = null
  try { j = await r.json() } catch { /* ignore */ }
  return r.ok && j && typeof j.id === 'string' && j.id.length > 0
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('allow', 'POST'); return json(res, 405, { ok: false, error: 'method' }) }
  // same-origin only
  const origin = req.headers.origin
  if (origin) {
    let ok = false
    try { const o = new URL(origin); ok = o.host === req.headers.host || (process.env.CONTACT_ALLOWED_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean).includes(o.origin) } catch { /* invalid */ }
    if (!ok) return json(res, 403, { ok: false, error: 'origin' })
  }
  let b = req.body
  if (typeof b === 'string') { try { b = JSON.parse(b) } catch { b = null } }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return json(res, 400, { ok: false, error: 'invalid' })
  if (JSON.stringify(b).length > 20000) return json(res, 413, { ok: false, error: 'too_large' })

  // spam: honeypot filled, or submitted faster than a human could. Reply as if accepted but send nothing.
  if (oneLine(b.website, 50) !== '' || (Number.isFinite(b.elapsed) && b.elapsed < 1500)) return json(res, 200, { ok: true })

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  if (list.length >= MAX_HITS) return json(res, 429, { ok: false, error: 'rate' })

  const { v, e } = validate(b)
  if (Object.keys(e).length) return json(res, 400, { ok: false, error: 'validation', errors: e })

  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO, from = process.env.CONTACT_FROM_EMAIL
  if (!key || !to || !from) return json(res, 503, { ok: false, error: 'not_configured' })

  const sig = `${v.email}|${v.subject}|${v.message}`
  if (seen.has(sig) && now - seen.get(sig) < DUP_MS) return json(res, 200, { ok: true, duplicate: true })

  list.push(now); hits.set(ip, list)
  for (const [k, t] of seen) if (now - t > DUP_MS) seen.delete(k)
  const url = process.env.RESEND_API_URL || 'https://api.resend.com/emails'
  const when = new Date(now).toISOString().replace('T', ' ').slice(0, 19)
  const { textBody, html } = compose(v, when, ip)
  try {
    const delivered = await sendMail({ from, to: [to], reply_to: v.email, subject: `[RaapNexus enquiry] ${v.subject}`, text: textBody, html }, key, url)
    if (!delivered) return json(res, 502, { ok: false, error: 'delivery' })
    seen.set(sig, now)
    if (process.env.CONTACT_SEND_ACK !== 'false') {
      // acknowledgement is best-effort: its failure never turns a delivered enquiry into an error
      await sendMail({ from, to: [v.email], subject: 'We received your message | RaapNexus', text: `Hello ${v.name},\n\nThank you for contacting RaapNexus. We have received your message ("${v.subject}") and will reply by email.\n\nThis is an automatic acknowledgement.\n`,
        html: `<div style="font-family:Arial,sans-serif;color:#0f172a"><p>Hello ${esc(v.name)},</p><p>Thank you for contacting RaapNexus. We have received your message (&ldquo;${esc(v.subject)}&rdquo;) and will reply by email.</p><p style="color:#64748b;font-size:12px">This is an automatic acknowledgement.</p></div>` }, key, url).catch(() => {})
    }
    return json(res, 200, { ok: true })
  } catch {
    return json(res, 502, { ok: false, error: 'delivery' })
  }
}
