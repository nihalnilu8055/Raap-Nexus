// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
import { useId } from 'react'
import { AlertTriangle, BadgeCheck, Minus, Plus, RotateCcw } from 'lucide-react'
import { Reveal } from '../components/ui/Reveal'
import { ALL_PROFILES, EMPTY, FREE_BASELINE, INCLUDED_WITH, PAID_CONNECTORS, PRICE, TIERS, calculate, type Selection } from './data'
import { Billing, Mark, Section, SectionHead, usd } from './ui'

function Stepper({ label, hint, value, onChange, price, billing }: { label: string; hint: string; value: number; onChange: (n: number) => void; price: number; billing: 'monthly' | 'one-time' }) {
  const id = useId()
  const set = (n: number) => onChange(Math.max(0, Math.min(999, Math.round(n) || 0)))
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 rounded-2xl border border-white/10 bg-white/[.03] p-3.5">
      <div className="min-w-[8.5rem] flex-1"><label htmlFor={id} className="block font-display text-sm font-bold text-white">{label}</label><p className="mt-0.5 text-xs text-slate-400">{usd(price)} each · {billing === 'monthly' ? 'per month' : 'one-time'} · {hint}</p></div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => set(value - 1)} disabled={value <= 0} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[.06] text-white transition hover:bg-white/[.14] disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Minus size={16} aria-hidden /></button>
        <input id={id} type="number" inputMode="numeric" min={0} max={999} value={value} onChange={(e) => set(Number(e.target.value))} className="num h-11 w-14 rounded-xl border border-white/15 bg-[#0a162e] text-center font-display text-base font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
        <button type="button" aria-label={`Increase ${label}`} onClick={() => set(value + 1)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/[.06] text-white transition hover:bg-white/[.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Plus size={16} aria-hidden /></button>
      </div>
    </div>
  )
}
function Switch({ label, hint, on, onChange, price, billing }: { label: string; hint: string; on: boolean; onChange: (b: boolean) => void; price: number; billing: 'monthly' | 'one-time' }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${on ? 'border-sky-300/50 bg-sky-400/10' : 'border-white/10 bg-white/[.03] hover:bg-white/[.06]'}`}>
      <span className="min-w-0"><span className="block font-display text-sm font-bold text-white">{label}</span><span className="mt-0.5 block text-xs text-slate-400">{usd(price)} · {billing === 'monthly' ? 'per month' : 'one-time'} · {hint}</span></span>
      <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-electric-blue' : 'bg-white/20'}`}><span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></span>
    </button>
  )
}
function Chip({ on, onClick, k, name, sub, disabled }: { on: boolean; onClick: () => void; k: string; name: string; sub: string; disabled?: boolean }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} disabled={disabled} onClick={onClick} className={`flex min-h-[52px] w-full items-center gap-2.5 rounded-xl border p-2 pe-3 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${on ? 'border-sky-300/60 bg-sky-400/15' : 'border-white/10 bg-white/[.03] hover:bg-white/[.07]'}`}>
      <span className="plate grid h-9 w-12 shrink-0 place-items-center px-1.5"><Mark k={k} name={name} h={20} maxW={36} /></span>
      <span className="min-w-0 flex-1"><span className="block truncate font-display text-[13px] font-bold leading-tight text-white">{name}</span><span className="block text-[11px] text-slate-400">{sub}</span></span>
      <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? 'border-sky-300 bg-sky-400 text-[#04122e]' : 'border-white/25'}`}>{on && <BadgeCheck size={14} />}</span>
    </button>
  )
}

export default function Calculator({ sel, setSel }: { sel: Selection; setSel: (s: Selection) => void }) {
  const r = calculate(sel)
  const up = (p: Partial<Selection>) => setSel({ ...sel, ...p })
  const toggle = (key: 'profiles' | 'connectors', id: string) => up({ [key]: sel[key].includes(id) ? sel[key].filter((x) => x !== id) : [...sel[key], id] } as Partial<Selection>)
  const money = (n: number) => usd(n)
  return (
    <Section id="calculator">
      <SectionHead eyebrow="Calculator" title={<span id="calculator-h">Estimate What Your Business Needs</span>} text="Try the pricing model with the exact rates. Everything is calculated here in your browser — no payment, no request is sent." />
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Reveal className="min-w-0"><div className="glass space-y-8 rounded-[1.75rem] p-4 sm:p-7">
          <fieldset className="space-y-2.5"><legend className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Capacity</legend>
            <Stepper label="Additional users" hint={`${FREE_BASELINE.users} free`} value={sel.users} onChange={(n) => up({ users: n })} price={PRICE.users} billing="monthly" />
            <Stepper label="Additional dashboards" hint={`${FREE_BASELINE.dashboards} free`} value={sel.dashboards} onChange={(n) => up({ dashboards: n })} price={PRICE.dashboards} billing="one-time" />
            <Stepper label="Additional workflows" hint={`${FREE_BASELINE.workflows} free`} value={sel.workflows} onChange={(n) => up({ workflows: n })} price={PRICE.workflows} billing="one-time" />
            <Stepper label="Customer channel lines" hint="WhatsApp / Instagram" value={sel.lines} onChange={(n) => up({ lines: n })} price={PRICE.lines} billing="one-time" />
            <Stepper label="Additional software-profile slots" hint={`${FREE_BASELINE.profiles} free`} value={sel.slots} onChange={(n) => up({ slots: n })} price={PRICE.slots} billing="one-time" />
          </fieldset>
          <fieldset className="space-y-2.5"><legend className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Features</legend>
            <Switch label="Approvals" hint="multi-level sign-off" on={sel.approvals} onChange={(b) => up({ approvals: b })} price={PRICE.approvals} billing="one-time" />
            <Switch label="Phone mode" hint="use RaapNexus from a phone" on={sel.phone} onChange={(b) => up({ phone: b })} price={PRICE.phone} billing="one-time" />
            <Switch label="Company web address" hint="your own subdomain" on={sel.domain} onChange={(b) => up({ domain: b })} price={PRICE.domain} billing="monthly" />
          </fieldset>
          <fieldset><legend className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Software profiles <span className="font-semibold normal-case tracking-normal text-slate-500">· monthly, each needs a profile slot</span></legend>
            <div className="space-y-4">{TIERS.map((t) => (
              <div key={t.id}><p className="mb-2 text-xs font-semibold text-slate-400">{t.name} · {usd(t.price)}/month each</p>
                <div className="grid gap-2 sm:grid-cols-2">{t.profiles.map((p) => <Chip key={p.id} k={p.logo} name={p.name} sub={`${usd(t.price)} / month`} on={sel.profiles.includes(p.id)} onClick={() => toggle('profiles', p.id)} />)}</div></div>
            ))}</div>
          </fieldset>
          <fieldset><legend className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Paid database &amp; API connectors <span className="font-semibold normal-case tracking-normal text-slate-500">· monthly</span></legend>
            <div className="grid gap-2 sm:grid-cols-2">{PAID_CONNECTORS.map((c) => {
              const inc = INCLUDED_WITH[c.id] && sel.profiles.includes(INCLUDED_WITH[c.id])
              return <Chip key={c.id} k={c.logo} name={c.name} sub={inc ? 'Included with matching profile' : `${usd(c.price)} / month`} on={sel.connectors.includes(c.id)} onClick={() => toggle('connectors', c.id)} />
            })}</div>
          </fieldset>
          <button type="button" onClick={() => setSel({ ...EMPTY })} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-display text-sm font-bold text-slate-200 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><RotateCcw size={15} aria-hidden />Reset</button>
        </div></Reveal>

        <div className="min-w-0 lg:sticky lg:top-24">
          <div className="glass overflow-hidden rounded-[1.75rem]" aria-live="polite" aria-label="Estimate">
            <div className="border-b border-white/10 bg-emerald-400/[.06] p-5">
              <div className="flex items-center justify-between gap-2"><p className="font-display text-sm font-extrabold text-white">1 · Free baseline</p><span className="num font-display text-lg font-extrabold text-emerald-300">$0</span></div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">Included, not charged: {FREE_BASELINE.users} users · {FREE_BASELINE.dashboards} dashboards · {FREE_BASELINE.workflows} workflows · {FREE_BASELINE.profiles} software profile.</p>
              <p className="mt-2 text-xs text-slate-400">With your selection: <strong className="text-slate-200">{r.totals.users} users, {r.totals.dashboards} dashboards, {r.totals.workflows} workflows, {r.totals.lines} channel lines, {r.totals.profileSlots} profile slot{r.totals.profileSlots === 1 ? '' : 's'}</strong></p>
            </div>
            <Group title="2 · Monthly recurring" tag={<Billing type="monthly" />} lines={r.monthly} total={r.monthlyTotal} unit="/ month" empty="No monthly charges selected." />
            <Group title="3 · One-time charges" tag={<Billing type="one-time" />} lines={r.oneTime} total={r.oneTimeTotal} unit="one-time" empty="No one-time charges selected." />
            {r.included.length > 0 && <div className="border-t border-white/10 p-5"><p className="font-display text-sm font-extrabold text-emerald-200">Included at no additional cost</p><ul className="mt-2 space-y-1">{r.included.map((l) => <li key={l.label} className="flex items-start justify-between gap-3 text-sm text-slate-200"><span>{l.label}<span className="block text-xs text-slate-400">{l.detail}</span></span><span className="num font-bold text-emerald-300">$0</span></li>)}</ul></div>}
            {r.slotShortfall > 0 && (
              <div className="border-t border-amber-300/30 bg-amber-400/[.08] p-5 text-sm text-amber-50">
                <p className="flex gap-2 font-display font-bold"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />Profile slot needed</p>
                <p className="mt-1 leading-relaxed">You selected {r.slotsNeeded} software profiles but have {r.slotsAvailable} slot{r.slotsAvailable === 1 ? '' : 's'} ({FREE_BASELINE.profiles} free + {sel.slots} added). Each missing slot is a separate <strong>{usd(PRICE.slots)} one-time</strong> charge — {r.slotShortfall} more = <strong>{usd(r.slotShortfall * PRICE.slots)} one-time</strong>. It is not included in the totals below until you add it.</p>
                <button type="button" onClick={() => up({ slots: sel.slots + r.slotShortfall })} className="mt-3 rounded-full bg-amber-300 px-4 py-2 font-display text-sm font-bold text-[#2a1b00] transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">Add {r.slotShortfall} slot{r.slotShortfall === 1 ? '' : 's'} ({usd(r.slotShortfall * PRICE.slots)})</button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-px bg-white/10 border-t border-white/10">
              <div className="min-w-0 bg-[#0a162e] p-4 sm:p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">4 · Estimated first month</p><p className="num mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl" data-testid="first">{money(r.firstMonth)}</p><p className="mt-1 text-xs text-slate-400">{money(r.monthlyTotal)} monthly + {money(r.oneTimeTotal)} one-time</p></div>
              <div className="min-w-0 bg-[#0a162e] p-4 sm:p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">5 · Ongoing monthly</p><p className="num mt-1 font-display text-2xl font-extrabold text-cyan-200 sm:text-3xl" data-testid="ongoing">{money(r.monthlyTotal)}</p><p className="mt-1 text-xs text-slate-400">per month, excl. one-time</p></div>
            </div>
            <p className="border-t border-white/10 px-5 py-3 text-[11px] leading-relaxed text-slate-400">USD, excluding applicable local taxes. An estimate only: every purchase is subject to Techlogica review and approval.</p>
          </div>
          <p className="sr-only" data-testid="summary">{`${money(r.monthlyTotal)} per month plus ${money(r.oneTimeTotal)} one-time`}</p>
        </div>
      </div>
    </Section>
  )
}
function Group({ title, tag, lines, total, unit, empty }: { title: string; tag: React.ReactNode; lines: { label: string; detail: string; amount: number }[]; total: number; unit: string; empty: string }) {
  return (
    <div className="border-t border-white/10 p-5">
      <div className="flex items-center justify-between gap-2"><p className="font-display text-sm font-extrabold text-white">{title}</p>{tag}</div>
      {lines.length === 0 ? <p className="mt-2 text-sm text-slate-500">{empty}</p> : (
        <ul className="mt-3 space-y-2">{lines.map((l) => <li key={l.label} className="flex items-start justify-between gap-3 text-sm text-slate-200"><span className="min-w-0">{l.label}<span className="block text-xs text-slate-400">{l.detail}</span></span><span className="num shrink-0 font-bold text-white">{usd(l.amount)}</span></li>)}</ul>
      )}
      <p className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3 text-sm font-bold text-slate-200"><span>Total</span><span><span className="num font-display text-xl font-extrabold text-white">{usd(total)}</span> <span className="text-xs font-semibold text-slate-400">{unit}</span></span></p>
    </div>
  )
}
export { ALL_PROFILES }
