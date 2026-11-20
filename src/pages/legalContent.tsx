import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT_EMAIL } from '../config/contact'
import { openCookieSettings } from '../lib/consent'

/**
 * DRAFT legal text (LEGAL-PAGES, removable). Not legal advice and not approved.
 * Wording is generic and states only what the site's code shows. Have a lawyer review it, then set LEGAL_DRAFT = false.
 */
export const LEGAL_DRAFT = true
export const Ph = ({ children }: { children: ReactNode }) => (
  <mark className="rounded border border-dashed border-amber-400/60 bg-amber-400/15 px-1.5 text-[0.92em] font-semibold text-amber-200">[CONFIRM: {children}]</mark>
)
const Email = () => <code className="break-all rounded bg-[#050c20] px-1.5 py-0.5 font-mono text-[12.5px] text-sky-300">{CONTACT_EMAIL}</code>
const L = ({ to, lang, children }: { to: string; lang: string; children: ReactNode }) => <Link to={`/${lang}/${to}`} className="text-sky-400 underline underline-offset-2">{children}</Link>

export interface Doc { slug: string; title: string; intro: string; sections: { h: string; body: (lang: string) => ReactNode }[] }
export const LEGAL_SLUGS = ['privacy-policy', 'cookie-policy', 'terms', 'disclaimer'] as const
export type LegalSlug = (typeof LEGAL_SLUGS)[number]

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="mt-3 overflow-x-auto rounded-xl border border-white/10" tabIndex={0} role="region" aria-label="Table, scrollable">
    <table className="w-full min-w-[520px] border-collapse text-sm">
      <thead><tr>{head.map((h) => <th key={h} scope="col" className="bg-[#1e3a78]/25 px-3 py-2.5 text-start text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-white/10">{r.map((c, j) => <td key={j} className="px-3 py-2.5 align-top">{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
)

export const DOCS: Record<LegalSlug, Doc> = {
  'privacy-policy': {
    slug: 'privacy-policy', title: 'Privacy Policy', intro: 'How RaapNexus handles personal information received through this website.',
    sections: [
      { h: 'Who we are', body: () => <><p>This website is run by RaapNexus ("we", "us"). For any privacy question, write to <Email />.</p></> },
      { h: 'Information we collect', body: () => <><p>Information you give us through the contact form: full name, company name, business email, phone number (optional), country, subject and message.</p><p>Technical information: the site uses a small edge function that returns a country code, used for form defaults. We do not store it. Optional analytics can be switched on for the site; it only runs if it is enabled and you allow it in Cookie Settings.</p></> },
      { h: 'How we use information', body: () => <ul><li>To reply to your enquiry.</li><li>To operate, secure and improve the website.</li></ul> },
      { h: 'Legal basis', body: () => <p>We handle your information to answer your enquiry, to run and protect the website, and, where you allow it, for optional analytics. Where the law requires your consent, we ask for it and you can withdraw it at any time in Cookie Settings.</p> },
      { h: 'Who we share it with', body: () => <p>Service providers that help us run the site, for example email delivery, hosting and analytics (if enabled). We do not sell your personal information.</p> },
      { h: 'Third-party content', body: (l) => <p>The site loads fonts from Google Fonts and can embed videos using YouTube's privacy-enhanced mode after you press play. Those providers receive technical data such as your IP address when content loads. See the <L to="cookie-policy" lang={l}>Cookie Policy</L>.</p> },
      { h: 'Cookies and local storage', body: (l) => <p>See the <L to="cookie-policy" lang={l}>Cookie Policy</L> and use <strong>Cookie Settings</strong> in the footer to change your choices at any time.</p> },
      { h: 'International transfers', body: () => <p>Our service providers may process information in other countries. Where they do, we expect them to protect it to a standard comparable to this policy.</p> },
      { h: 'Retention', body: () => <p>We keep enquiries only as long as needed to respond to you and to keep reasonable business records, then delete or anonymise them.</p> },
      { h: 'Your rights', body: () => <p>Depending on where you live you may have rights to access, correct, delete or restrict use of your information, to object, and to complain to a regulator. To use these rights, write to us at the address in the Contact section.</p> },
      { h: 'Security', body: () => <p>We take reasonable steps to protect the information you send us. No method of sending or storing data is completely secure, so we cannot guarantee absolute security.</p> },
      { h: 'Children', body: () => <p>The website is intended for businesses and is not directed at children.</p> },
      { h: 'Changes to this policy', body: () => <p>We will post updates on this page and change the "Last updated" date.</p> },
      { h: 'Contact us', body: () => <p>Questions: <Email />.</p> },
    ],
  },
  'cookie-policy': {
    slug: 'cookie-policy', title: 'Cookie Policy', intro: 'What cookies and similar technologies this website may use, and how to control them.',
    sections: [
      { h: 'What are cookies', body: () => <p>Cookies are small files stored by your browser. "Similar technologies", such as local storage, work in a comparable way. We call them all cookies here for simplicity.</p> },
      { h: 'How we use them', body: () => <p>Strictly necessary items are always on. Functional, Analytics and Marketing items are only used if you allow them. You can change your mind at any time:{' '}
        <button type="button" onClick={openCookieSettings} className="ml-1 inline-flex min-h-[40px] items-center rounded-full border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white hover:border-sky-400">Cookie Settings</button></p> },
      { h: 'Categories', body: () => <Table head={['Category', 'Purpose', 'Default']} rows={[['Strictly necessary', 'Language choice, remembering your cookie decision', 'Always on'], ['Functional', 'Optional display and help-centre preferences', 'Off until you allow'], ['Analytics', 'Aggregate usage statistics, only if configured', 'Off until you allow'], ['Marketing', 'None identified on the current site', 'Off until you allow']]} /> },
      { h: 'Cookies and similar technologies we use', body: () => <><p>The table lists what the site uses or can use. Optional items only run if you allow them.</p>
        <Table head={['Name', 'Provider', 'Purpose']} rows={[
          [<><code className="font-mono text-[12.5px] text-sky-300">rn.*</code> local-storage keys (e.g. language, cookie choice)</>, 'RaapNexus (first-party)', 'Remember language / settings / your cookie choice'],
          ['Help-centre settings', 'RaapNexus (first-party)', 'Help portal preferences'],
          ['Google Analytics 4 (optional)', 'Google', 'Usage statistics — inactive unless configured'],
          ['Google Fonts', 'Google', 'Fonts delivered from Google servers'],
          ['YouTube privacy-enhanced embed', 'Google / YouTube', 'Video playback after you press play'],
        ]} /></> },
      { h: 'Managing cookies', body: () => <p>Use Cookie Settings in the footer, and your browser's own controls to block or delete cookies. Blocking necessary items may stop parts of the site working.</p> },
      { h: 'Changes', body: () => <p>We will update this page when the items above change.</p> },
      { h: 'Contact', body: (l) => <p><Email />. See also the <L to="privacy-policy" lang={l}>Privacy Policy</L>.</p> },
    ],
  },
  terms: {
    slug: 'terms', title: 'Terms & Conditions', intro: 'The rules for using the RaapNexus website.',
    sections: [
      { h: 'Acceptance', body: () => <p>By using this website you agree to these terms. If you do not agree, please do not use it. These terms cover the website only. Use of RaapNexus products is covered by separate terms.</p> },
      { h: 'Use of the website', body: () => <ul><li>Use it lawfully and do not attempt to disrupt or gain unauthorised access to it.</li><li>Do not copy or scrape it in ways that harm the service.</li></ul> },
      { h: 'Intellectual property', body: () => <p>Site content, design and the RaapNexus name and logo belong to RaapNexus or its licensors. You may not use them without our written permission.</p> },
      { h: 'Demonstrations and sample data', body: () => <p>Interactive demonstrations use simulated sample data for illustration only. They are not real customer data and not a promise of results.</p> },
      { h: 'Information submitted by you', body: (l) => <p>Information you send through forms is handled under the <L to="privacy-policy" lang={l}>Privacy Policy</L>.</p> },
      { h: 'Third-party links and content', body: () => <p>We are not responsible for third-party sites or content that the website links to or embeds.</p> },
      { h: 'Availability', body: () => <p>We aim to keep the site available but do not guarantee uninterrupted access. </p> },
      { h: 'Disclaimers and liability', body: (l) => <p>See the <L to="disclaimer" lang={l}>Disclaimer</L>. To the extent the law allows, we are not liable for loss arising from your use of this website or your reliance on its content.</p> },
      { h: 'Changes', body: () => <p>We may update these terms; continued use means acceptance. We will post the new version on this page.</p> },
      { h: 'Contact', body: () => <p><Email /></p> },
    ],
  },
  disclaimer: {
    slug: 'disclaimer', title: 'Disclaimer', intro: 'Important limits on the information shown on this website.',
    sections: [
      { h: 'General information only', body: () => <p>The website describes RaapNexus products and services in general terms. It is not an offer, and details may change.</p> },
      { h: 'No professional advice', body: () => <p>Nothing here is financial, tax, audit, accounting or legal advice. Please consult a qualified professional for your situation.</p> },
      { h: 'AI-assisted insights', body: () => <p>Where the website shows AI-assisted analysis, outputs can be incomplete or wrong and should be reviewed by a person.</p> },
      { h: 'Sample and simulated data', body: () => <p>Figures in demonstrations, including the Before &amp; After workspace, are simulated.</p> },
      { h: 'No guarantees', body: () => <p>We do not guarantee any particular outcome, saving or result.</p> },
      { h: 'External links', body: () => <p>We do not control or endorse third-party sites.</p> },
      { h: 'Limitation of liability', body: () => <p>To the extent the law allows, we are not liable for loss arising from your use of this website or your reliance on its content.</p> },
      { h: 'Contact', body: () => <p><Email /></p> },
    ],
  },
}
