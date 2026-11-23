// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Braces, Network, RefreshCw, Ticket } from 'lucide-react'
import { Reveal } from '../components/ui/Reveal'
import { MARKS } from './logos'

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`

export function Billing({ type, className = '' }: { type: 'monthly' | 'one-time'; className?: string }) {
  const m = type === 'monthly'
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] ${m ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-200' : 'border-amber-300/40 bg-amber-400/10 text-amber-200'} ${className}`}>
      {m ? <RefreshCw size={12} aria-hidden /> : <Ticket size={12} aria-hidden />}{m ? 'Monthly subscription' : 'One-time'}
    </span>
  )
}
export const FreeBadge = ({ children = 'Free' }: { children?: ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200">{children}</span>
)

/** Brand mark on a neutral light plate, never cropped: the box is `h` tall and as wide as the mark's own aspect ratio allows (capped, contain). */
export function Mark({ k, name, h = 30, maxW = 96, className = '' }: { k: string; name: string; h?: number; maxW?: number; className?: string }) {
  const m = MARKS[k]
  if (!m && (k === 'rest' || k === 'odata')) { const I = k === 'rest' ? Braces : Network; return <span aria-hidden className={`grid place-items-center rounded-lg text-slate-700 ${className}`} style={{ height: h, width: h }}><I size={Math.round(h * 0.8)} strokeWidth={2.2} /></span> }
  if (!m) {
    const ini = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    return <span aria-hidden className={`grid place-items-center rounded-lg bg-slate-200 font-display text-[13px] font-extrabold text-slate-600 ${className}`} style={{ height: h, width: h }}>{ini}</span>
  }
  const w = Math.min(maxW, Math.round(h * m.ar))
  return <img src={m.src} alt={m.alt} loading="lazy" decoding="async" width={w} height={Math.round(w / m.ar)} draggable={false} className={`object-contain ${className}`} style={{ height: 'auto', maxHeight: h, width: w, maxWidth: '100%' }} />
}

export function Plate({ k, name, label = true, tone = 'light' }: { k: string; name: string; label?: boolean; tone?: 'light' | 'dark' }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-2.5 pe-3.5 transition-colors hover:border-sky-300/40 hover:bg-white/[.07]">
      <span className="plate grid h-12 w-[76px] shrink-0 place-items-center px-2"><Mark k={k} name={name} h={28} maxW={60} /></span>
      {label && <span className={`min-w-0 font-display text-sm font-bold leading-tight ${tone === 'dark' ? 'text-slate-900' : 'text-white'}`}>{name}</span>}
    </div>
  )
}

/** Pointer tilt (mouse only, off for reduced motion). */
export function Tilt({ children, className = '', max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const calm = !!useReducedMotion()
  const move = (e: React.PointerEvent) => {
    if (calm || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`
  }
  const leave = () => { if (ref.current) ref.current.style.transform = '' }
  return <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt ${className}`}>{children}</div>
}

export function SectionHead({ eyebrow, title, text, align = 'center' }: { eyebrow: string; title: ReactNode; text?: ReactNode; align?: 'center' | 'left' }) {
  return (
    <Reveal className={`mx-auto max-w-3xl ${align === 'center' ? 'text-center' : ''}`}>
      <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-sky-300">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-[2.6rem]">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{text}</p>}
    </Reveal>
  )
}

export function Section({ id, children, className = '', tone = 'a' }: { id: string; children: ReactNode; className?: string; tone?: 'a' | 'b' }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`relative scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 ${tone === 'b' ? 'bg-[#050d24]' : ''} ${className}`}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  )
}
export { motion }
