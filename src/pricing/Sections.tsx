// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, BadgeCheck, ChevronDown, ClipboardList, Cable, Database, FileText, FolderOpen, Globe, Info, Layers, Mail, SearchCheck, ShieldCheck, Terminal, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Reveal } from '../components/ui/Reveal'
import { openContact } from '../lib/contact'
import { ADD_ONS, FREE_BASELINE, FREE_CONNECTORS, PAID_CONNECTORS, TIERS } from './data'
import { Billing, FreeBadge, Mark, Plate, Section, SectionHead, Tilt, usd } from './ui'

/* ───────── A · Free base plan ───────── */
export function FreePlan() {
  const tiles = [['Users', FREE_BASELINE.users], ['Dashboards', FREE_BASELINE.dashboards], ['Workflows', FREE_BASELINE.workflows], ['Free Connectors', FREE_CONNECTORS.length]] as const
  return (
    <Section id="free" className="fit">
      <SectionHead eyebrow="Free base plan" title={<span id="free-h">Start Free. Grow When You Need.</span>} text="Every RaapNexus installation starts with useful business intelligence capabilities at no cost. Add more users, dashboards, workflows and integrations only when your business needs them." />
      <Reveal variant="depth" className="fit-gap mt-12">
        <div className="fit-card glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
          <div aria-hidden className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-[90px]" />
          <div className="relative grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <FreeBadge>Free baseline</FreeBadge>
              <p className="fit-zero mt-4 font-display text-7xl font-extrabold leading-none tracking-tight text-white sm:text-8xl">$0</p>
              <p className="mt-3 font-display text-lg font-bold text-emerald-200">Free baseline — included with every installation</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />No credit card or payment required.</li>
                <li className="flex gap-2"><Info size={18} className="mt-0.5 shrink-0 text-sky-300" aria-hidden />This is the free base allowance, not a time-limited trial.</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Included with every installation</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {tiles.map(([label, n]) => (
                  <Tilt key={label} className="fit-tile glass rounded-2xl p-5">
                    <p className="num font-display text-5xl font-extrabold text-white sm:text-6xl">{n}</p>
                    <p className="mt-1 font-display text-sm font-bold text-slate-300">{label}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Free allowance</p>
                  </Tilt>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

/* ───────── B · Free connectors ───────── */
const FC_ICON = { remote: Globe, local: Terminal, sqlite: Database, folder: FolderOpen } as const
export function FreeConnectors() {
  return (
    <Section id="connectors" tone="b" className="fit">
      <SectionHead eyebrow="Free connectors" title={<span id="connectors-h">Connect for Free</span>} text="Start connecting your business information without paying for the basic connector types." />
      <ul className="fit-gap mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FREE_CONNECTORS.map((c, i) => {
          const I = FC_ICON[c.icon]
          return (
            <Reveal as="li" key={c.id} delay={i * 0.07}>
              <Tilt className="glass shine relative h-full rounded-3xl border-emerald-300/20 p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-300/30"><I size={24} aria-hidden /></span>
                  <FreeBadge>FREE</FreeBadge>
                </div>
                <h3 className="mt-5 font-display text-lg font-extrabold text-white">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{c.text}</p>
              </Tilt>
            </Reveal>
          )
        })}
      </ul>
      <Reveal className="mx-auto mt-8 max-w-3xl">
        <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-5 py-4 text-sm leading-relaxed text-slate-300"><Cable size={18} className="mt-0.5 shrink-0 text-sky-300" aria-hidden /><span>These four are always free. Database and ERP connectors are separate, separately priced items — see <a href="#db-connectors" className="font-semibold text-sky-300 underline-offset-2 hover:underline">Advanced Database &amp; API Connections</a>.</span></p>
      </Reveal>
    </Section>
  )
}

/* ───────── C · Add-ons ───────── */
export function AddOns() {
  return (
    <Section id="addons">
      <SectionHead eyebrow="Add-ons" title={<span id="addons-h">Expand Your Workspace</span>} text="Increase your limits and unlock additional capabilities whenever you need them." />
      <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300"><Billing type="monthly" /> renews every month <span aria-hidden className="text-slate-600">·</span> <Billing type="one-time" /> paid once</Reveal>
      <Reveal variant="depth" className="mt-8">
        <div className="glass overflow-hidden rounded-[1.75rem]">
          <div role="table" aria-label="Add-on pricing" className="w-full">
            <div role="row" className="hidden grid-cols-[1.7fr_.7fr_.8fr_.8fr_.6fr_1.5fr] gap-4 border-b border-white/10 px-6 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 md:grid">
              {['Add-on', 'Type', 'Free baseline', 'Each pack adds', 'Price (USD)', 'Billing'].map((h) => <div key={h} role="columnheader" className={h === 'Price (USD)' ? 'text-right' : ''}>{h}</div>)}
            </div>
            {ADD_ONS.map((a) => (
              <div role="row" key={a.id} className="grid gap-x-4 gap-y-2 border-b border-white/[.06] px-5 py-5 transition-colors last:border-0 hover:bg-white/[.03] md:grid-cols-[1.7fr_.7fr_.8fr_.8fr_.6fr_1.5fr] md:items-center md:px-6">
                <div role="cell" className="min-w-0"><p className="font-display text-base font-extrabold text-white">{a.name}</p><p className="mt-0.5 text-sm leading-snug text-slate-400">{a.text}</p></div>
                <div role="cell" className="hidden text-sm text-slate-300 md:block">{a.kind}</div>
                <div role="cell" className="hidden text-sm text-slate-300 md:block num">{a.baseline}</div>
                <div role="cell" className="hidden text-sm text-slate-300 md:block num">{a.adds}</div>
                <div role="cell" className="flex items-center justify-between gap-3 md:block md:text-right">
                  <span className="num font-display text-2xl font-extrabold text-white">{usd(a.price)}</span>
                  <span className="text-xs text-slate-400 md:hidden">{a.kind} · baseline {a.baseline} · adds {a.adds}</span>
                </div>
                <div role="cell"><Billing type={a.billing} /></div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
      <Reveal className="mx-auto mt-6 max-w-4xl">
        <div className="flex gap-3 rounded-2xl border border-amber-300/30 bg-amber-400/[.07] px-5 py-4 text-sm leading-relaxed text-amber-50">
          <Info size={20} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
          <p><strong>Two separate charges.</strong> Buying an additional software-profile slot costs <strong>$10 one-time</strong>. The selected software profile itself has a separate <strong>monthly</strong> subscription, described below. They are never combined into one price.</p>
        </div>
      </Reveal>
    </Section>
  )
}

/* ───────── D · Software profiles ───────── */
const TIER_STYLE = {
  1: { ring: 'from-sky-400/60 to-blue-600/40', chip: 'text-sky-200 bg-sky-400/10 border-sky-300/40', inset: '' },
  2: { ring: 'from-sky-300/55 to-blue-500/35', chip: 'text-sky-200 bg-sky-400/10 border-sky-300/40', inset: 'lg:mx-6' },
  3: { ring: 'from-cyan-400/50 to-sky-600/30', chip: 'text-cyan-200 bg-cyan-400/10 border-cyan-300/40', inset: 'lg:mx-12' },
  4: { ring: 'from-teal-300/45 to-cyan-600/30', chip: 'text-teal-200 bg-teal-400/10 border-teal-300/40', inset: 'lg:mx-[4.5rem]' },
  5: { ring: 'from-slate-300/35 to-slate-500/20', chip: 'text-slate-200 bg-white/10 border-white/25', inset: 'lg:mx-24' },
} as const
export function Profiles() {
  return (
    <Section id="profiles" tone="b">
      <SectionHead eyebrow="Software profiles" title={<span id="profiles-h">Connect the Business Systems You Already Use</span>} text="Bring your existing ERP and accounting systems into RaapNexus. Each connected business-system profile provides the software-specific knowledge required for AI-powered business intelligence." />
      <div className="mt-14 space-y-5 [perspective:1400px]">
        {TIERS.map((t, i) => {
          const s = TIER_STYLE[t.id]
          return (
            <Reveal key={t.id} variant="depth" delay={i * 0.05} className={s.inset}>
              <Tilt max={3} className={`relative rounded-[1.75rem] bg-gradient-to-br p-px ${s.ring}`}>
                <div className="relative grid gap-6 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#0c1c42] to-[#060f26] p-6 sm:p-8 lg:grid-cols-[minmax(220px,.62fr)_1.6fr] lg:items-center">
                  <div aria-hidden className="absolute -left-10 -top-16 font-display text-[11rem] font-extrabold leading-none text-white/[.035]">{t.id}</div>
                  <div className="relative">
                    <span className={`inline-flex rounded-full border px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.16em] ${s.chip}`}>Tier {t.id} · {t.name}</span>
                    <p className="mt-4 flex items-baseline gap-2"><span className="num font-display text-6xl font-extrabold leading-none text-white sm:text-7xl">{usd(t.price)}</span><span className="font-display text-base font-bold text-slate-300">/ month</span></p>
                    <p className="mt-2 text-sm text-slate-300">per software profile</p>
                    <div className="mt-3"><Billing type="monthly" /></div>
                  </div>
                  <ul className={`relative grid gap-3 ${t.profiles.length === 1 ? 'sm:max-w-xs' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
                    {t.profiles.map((p) => <li key={p.id} className="min-w-0"><Plate k={p.logo} name={p.name} /></li>)}
                  </ul>
                </div>
              </Tilt>
            </Reveal>
          )
        })}
      </div>
      <Reveal className="mx-auto mt-10 max-w-4xl">
        <div className="glass rounded-2xl p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-white"><Layers size={18} className="text-sky-300" aria-hidden />How software profiles are billed</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
            <li>• Each connected software profile is billed monthly.</li>
            <li>• Each software profile requires an available profile slot. The free baseline includes 1.</li>
            <li>• A new profile slot costs $10 one-time — separate from the monthly profile price.</li>
            <li>• Software systems not listed above use the standard Software profiles rate.</li>
          </ul>
        </div>
      </Reveal>
    </Section>
  )
}

/* ───────── E · Paid database & API connectors ───────── */
export function DbConnectors() {
  const groups = [{ price: 100, items: PAID_CONNECTORS.filter((c) => c.price === 100) }, { price: 20, items: PAID_CONNECTORS.filter((c) => c.price === 20) }]
  return (
    <Section id="db-connectors">
      <SectionHead eyebrow="Paid connectors" title={<span id="db-connectors-h">Advanced Database &amp; API Connections</span>} text="Connect directly to more advanced business databases and APIs when you need them." />
      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {groups.map((g, gi) => (
          <Reveal key={g.price} variant={gi ? 'right' : 'left'}>
            <Tilt max={4} className="glass h-full rounded-[1.75rem] p-6 sm:p-8">
              <p className="flex items-baseline gap-2"><span className="num font-display text-6xl font-extrabold leading-none text-white">{usd(g.price)}</span><span className="font-display text-base font-bold text-slate-300">/ month per connector</span></p>
              <div className="mt-3"><Billing type="monthly" /></div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {g.items.map((c) => <li key={c.id} className="min-w-0"><Plate k={c.logo} name={c.name} /></li>)}
              </ul>
            </Tilt>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-8 max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/35 bg-emerald-400/[.07] p-5 sm:p-6">
          <p className="flex gap-3 font-display text-base font-bold leading-snug text-emerald-50 sm:text-lg"><ShieldCheck size={24} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden />Already paying for the matching software profile? Its corresponding connectors are included at no additional cost.</p>
          <p className="mt-2 ps-9 text-sm text-emerald-100/80">You are never charged twice for the same included connector capability. The four free connectors (Remote MCP Server, Local MCP Server, SQLite Database, Folder of Files) are not paid connectors.</p>
        </div>
      </Reveal>
    </Section>
  )
}

/* ───────── Payments ───────── */
export function Payments() {
  const once = ['Extra dashboards', 'Extra workflows', 'Customer channel lines', 'Approvals', 'Phone mode', 'Software-profile packs']
  const monthly = ['Extra users', 'Company web address', 'Every software profile', 'Every paid connector']
  return (
    <Section id="payments" tone="b" className="fit">
      <SectionHead eyebrow="Billing" title={<span id="payments-h">Simple, Transparent Payments</span>} text="Two payment methods. Every price is in USD and excludes applicable local taxes." />
      <div className="fit-gap mt-12 grid gap-5 md:grid-cols-2">
        <Reveal variant="left"><div className="glass h-full rounded-[1.75rem] border-amber-300/20 p-7"><Billing type="one-time" /><h3 className="mt-4 font-display text-2xl font-extrabold text-white">One-time payments</h3><p className="mt-1 text-sm text-slate-300">Paid once through a payment link. Used for:</p><ul className="mt-4 space-y-2">{once.map((x) => <li key={x} className="flex gap-2 text-sm text-slate-200"><span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300" />{x}</li>)}</ul></div></Reveal>
        <Reveal variant="right"><div className="glass h-full rounded-[1.75rem] border-cyan-300/20 p-7"><Billing type="monthly" /><h3 className="mt-4 font-display text-2xl font-extrabold text-white">Monthly subscriptions</h3><p className="mt-1 text-sm text-slate-300">Renew monthly through Razorpay. Used for:</p><ul className="mt-4 space-y-2">{monthly.map((x) => <li key={x} className="flex gap-2 text-sm text-slate-200"><span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />{x}</li>)}</ul></div></Reveal>
      </div>
    </Section>
  )
}

/* ───────── Approval process ───────── */
const STEPS = [
  { icon: ClipboardList, t: 'Request', d: 'Customer requests an add-on or integration inside RaapNexus.' },
  { icon: SearchCheck, t: 'Review', d: 'Techlogica administrator reviews the request in the Central Console Marketplace.' },
  { icon: ShieldCheck, t: 'Approval', d: 'The administrator approves or rejects the request. If rejected, the customer can see the reason.' },
  { icon: Zap, t: 'Activation', d: 'The approved change reaches the customer’s application during its next hourly check-in, or immediately when the customer selects “Check now.”' },
]
export function Approval() {
  const [on, setOn] = useState(0)
  const [pause, setPause] = useState(false)
  const calm = !!useReducedMotion()
  useEffect(() => {
    if (pause || calm) return
    const id = window.setInterval(() => setOn((o) => (o + 1) % 4), 2600)
    return () => window.clearInterval(id)
  }, [pause, calm])
  return (
    <Section id="approval" className="fit">
      <SectionHead eyebrow="Approval process" title={<span id="approval-h">Every Purchase Is Reviewed and Approved</span>} text="Your requested capabilities become active only after Techlogica reviews and approves your purchase request." />
      <div className="fit-gap relative mt-14" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
        <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[42px] hidden h-0.5 rounded-full bg-white/10 lg:block"><div className="flow-line h-full rounded-full transition-[width] duration-700" style={{ width: `${(on / 3) * 100}%` }} /></div>
        <ol className="relative z-10 grid gap-4 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const I = s.icon, active = i === on, done = i < on
            return (
              <li key={s.t}>
                <button type="button" onClick={() => { setOn(i); setPause(true) }} aria-current={active ? 'step' : undefined}
                  className={`group relative block h-full w-full rounded-3xl border p-6 text-start transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${active ? 'border-sky-300/60 bg-sky-400/[.1] shadow-[0_30px_70px_-30px_rgba(37,99,235,.8)] [transform:translateZ(40px)_translateY(-6px)]' : 'glass !bg-none !bg-[#0a1430]'} ${done ? 'border-emerald-300/30' : ''}`}>
                  <span className={`relative grid h-[52px] w-[52px] place-items-center rounded-2xl ring-1 transition-colors ${active ? 'bg-sky-400/25 text-white ring-sky-300/60' : done ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-300/30' : 'bg-white/[.06] text-slate-300 ring-white/15'}`}>{<I size={24} aria-hidden />}<span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#0a162e] font-display text-xs font-extrabold text-sky-200 ring-1 ring-sky-300/40">{i + 1}</span></span>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-white">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.d}</p>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}

/* ───────── Scenarios ───────── */
export interface Preset { profiles?: string[]; connectors?: string[]; domain?: boolean; phone?: boolean; approvals?: boolean; users?: number }
export function Scenarios({ onLoad }: { onLoad: (p: Preset) => void }) {
  const cards: { id: string; name: string; illustrative: boolean; points: string[]; preset: Preset; cta: string }[] = [
    { id: 'rest', name: 'Small Restaurant', illustrative: false, points: ['TallyPrime profile', 'Two additional users', 'Company web address', 'Phone mode', 'Approvals'], preset: { profiles: ['tallyprime'], users: 2, domain: true, phone: true, approvals: true }, cta: 'Load this example' },
    { id: 'grow', name: 'Growing Business', illustrative: true, points: ['Odoo or ERPNext profile', 'Additional users', 'More dashboards', 'Additional workflows', 'Financial analysis'], preset: { profiles: ['odoo'] }, cta: 'Start from Odoo' },
    { id: 'ent', name: 'Enterprise Business', illustrative: true, points: ['Multiple ERP systems', 'Advanced database connectors', 'More users', 'More dashboards and workflows', 'Multiple business locations'], preset: { profiles: ['s4', 'odoo'], connectors: ['mssql', 'oracle'] }, cta: 'Start from two ERPs' },
  ]
  return (
    <Section id="scenarios" tone="b">
      <SectionHead eyebrow="Examples" title={<span id="scenarios-h">What It Looks Like for Real Businesses</span>} text="Three ways the pricing model can fit. Pick one to load it into the calculator." />
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08}>
            <Tilt className="glass flex h-full flex-col rounded-3xl p-7">
              <div className="flex items-start justify-between gap-3"><h3 className="font-display text-xl font-extrabold text-white">{c.name}</h3>{c.illustrative && <span className="rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300">Illustrative</span>}</div>
              <ul className="mt-4 flex-1 space-y-2">{c.points.map((p) => <li key={p} className="flex gap-2 text-sm text-slate-200"><span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300" />{p}</li>)}</ul>
              {c.illustrative && <p className="mt-4 text-xs leading-relaxed text-slate-400">Illustrative scenario — no fixed total is quoted. Use the calculator for the exact amount.</p>}
              <button type="button" onClick={() => { onLoad(c.preset); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-sky-300/40 bg-sky-400/10 px-5 py-2.5 font-display text-sm font-bold text-sky-100 transition hover:bg-sky-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">{c.cta}<ArrowRight size={16} aria-hidden /></button>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ───────── FAQ ───────── */
const FAQ: [string, string][] = [
  ['Is RaapNexus free to start?', 'Yes. Every installation starts with a free baseline: 3 users, 5 dashboards, 3 workflows and 1 software profile, at $0. It is a free base allowance, not a time-limited trial.'],
  ['Do I need a credit card to use the free version?', 'No. The free baseline requires no credit card or payment.'],
  ['Which connectors are always free?', 'Four connector types are free: Remote MCP Server (connect using an MCP server URL), Local MCP Server (connect using a local command), SQLite Database (read-only access to local SQLite files) and Folder of Files (Excel, Word, PDF, CSV, text, JSON and Markdown files).'],
  ['What is a software profile?', 'A software profile is the software-specific knowledge for one of your business systems, such as an ERP or accounting system. It lets RaapNexus provide AI-powered business intelligence for that system. Each connected profile is billed monthly at its tier price and needs an available profile slot.'],
  ['What is the difference between a software profile and a connector?', 'A software profile provides the knowledge about a specific business system. A connector is the connection to a database or API. Profiles and paid connectors are priced separately, and each is billed monthly.'],
  ['Do I pay separately for a connector if I already purchase its software profile?', 'No. If you already purchase the matching software profile, the connectors made specifically for that software are included at no additional cost. You are never charged twice for the same included connector capability.'],
  ['Are additional dashboards and workflows monthly or one-time payments?', 'One-time. Extra dashboards and extra workflows are $1 each, paid once. By contrast, extra users ($1 each) and the company web address ($1) are monthly subscriptions.'],
  ['How quickly does an approved purchase become active?', 'The approved change reaches your application during its next hourly check-in, or immediately when you select “Check now.”'],
  ['Which currency are the prices displayed in?', 'All prices are in US dollars (USD).'],
  ['Are local taxes included?', 'No. Prices exclude applicable local taxes.'],
]
export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <Section id="faq">
      <SectionHead eyebrow="FAQ" title={<span id="faq-h">Frequently Asked Questions</span>} />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQ.map(([q, a], i) => {
          const o = open === i
          return (
            <Reveal key={q}>
              <div className={`glass rounded-2xl transition-colors ${o ? 'border-sky-300/40' : ''}`}>
                <h3><button type="button" id={`faq-q-${i}`} aria-expanded={o} aria-controls={`faq-a-${i}`} onClick={() => setOpen(o ? null : i)} className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-start font-display text-base font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                  <span>{q}</span><ChevronDown size={20} aria-hidden className={`shrink-0 text-sky-300 transition-transform duration-300 ${o ? 'rotate-180' : ''}`} /></button></h3>
                <AnimatePresence initial={false}>
                  {o && <motion.div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-slate-300">{a}</p></motion.div>}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

/* ───────── Final CTA ───────── */
export function FinalCta({ lang }: { lang: string }) {
  return (
    <section aria-labelledby="cta-h" className="relative overflow-hidden px-4 py-24 sm:px-6">
      <div aria-hidden className="absolute inset-x-0 top-0 mx-auto h-[420px] max-w-3xl rounded-full bg-blue-600/25 blur-[120px]" />
      <Reveal variant="scale" className="relative mx-auto max-w-3xl text-center">
        <h2 id="cta-h" className="font-display text-3xl font-extrabold leading-tight text-white [text-wrap:balance] sm:text-5xl">Start Free. <span className="glow-text">Expand With Confidence.</span></h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">Connect your existing business systems, unlock AI-powered financial intelligence and grow your capabilities as your business evolves.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to={`/${lang}`} className="inline-flex items-center gap-2 rounded-full bg-electric-blue px-7 py-3.5 font-display text-base font-bold text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,.9)] transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">Explore RaapNexus<ArrowRight size={18} aria-hidden className="rtl:-scale-x-100" /></Link>
          <button type="button" onClick={openContact} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[.07] px-7 py-3.5 font-display text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/[.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Mail size={18} aria-hidden />Contact Techlogica</button>
        </div>
      </Reveal>
    </section>
  )
}
export { FileText, Mark }
