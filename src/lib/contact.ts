/** Open the contact form from anywhere (header, hero, footer, final CTA). The modal itself is mounted once in Home. */
export const openContact = () => window.dispatchEvent(new CustomEvent('open-contact'))

export interface ContactValues { name: string; company: string; email: string; phone: string; country: string; subject: string; message: string; consent: boolean }
export const LIMITS = { name: 100, company: 120, email: 254, phone: 25, country: 80, subject: 150, messageMin: 10, message: 3000 }
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/

/** Mirror of the server rules (api/contact.js). The server remains the source of truth. */
export function validate(v: ContactValues): Partial<Record<keyof ContactValues, 'name' | 'email' | 'phone' | 'subject' | 'message' | 'consent' | 'long'>> {
  const e: Partial<Record<keyof ContactValues, 'name' | 'email' | 'phone' | 'subject' | 'message' | 'consent' | 'long'>> = {}
  const n = v.name.trim(), s = v.subject.trim(), m = v.message.trim(), em = v.email.trim(), ph = v.phone.trim()
  if (n.length < 2) e.name = 'name'; else if (n.length > LIMITS.name) e.name = 'long'
  if (!EMAIL.test(em) || em.length > LIMITS.email) e.email = 'email'
  if (ph && (!/^[+0-9()\-.\s]{6,25}$/.test(ph) || ph.replace(/\D/g, '').length < 7 || ph.replace(/\D/g, '').length > 15)) e.phone = 'phone'
  if (v.company.trim().length > LIMITS.company) e.company = 'long'
  if (v.country.trim().length > LIMITS.country) e.country = 'long'
  if (s.length < 3) e.subject = 'subject'; else if (s.length > LIMITS.subject) e.subject = 'long'
  if (m.length < LIMITS.messageMin) e.message = 'message'; else if (m.length > LIMITS.message) e.message = 'long'
  if (!v.consent) e.consent = 'consent'
  return e
}
