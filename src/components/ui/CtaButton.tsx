import { motion } from 'framer-motion'
import { ArrowUpRight, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { ERP_URL } from '../../config/routes'
import { EASE } from '../../lib/motion'

type Variant = 'light' | 'blue' | 'glass' | 'tint'
const STYLE: Record<Variant, { btn: string; chip: string }> = {
  light: { btn: 'bg-white text-slate-900 shadow-[0_8px_30px_-10px_rgba(96,165,250,.55)] hover:shadow-[0_12px_40px_-8px_rgba(96,165,250,.8)]', chip: 'bg-slate-900 text-white' },
  blue: { btn: 'bg-electric-blue text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,.7)] hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,.9)]', chip: 'bg-white/20 text-white' },
  glass: { btn: 'border border-white/25 bg-white/10 text-white backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_10px_30px_-12px_rgba(0,0,0,.6)] hover:bg-white/[.16]', chip: 'bg-white/20 text-white' },
  tint: { btn: 'bg-[var(--cta)] text-white shadow-[0_10px_28px_-10px_var(--cta)] hover:brightness-110', chip: 'bg-white/25 text-white' },
}

/** RaapNexus button system. One destination (the ERP); the icon is chosen to match the action. */
export default function CtaButton({ label, variant = 'light', small = false, icon: Icon = LayoutDashboard, accent, href = ERP_URL }: { label: string; variant?: Variant; small?: boolean; icon?: LucideIcon; accent?: string; href?: string }) {
  const s = STYLE[variant]
  return (
    <motion.a href={href} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: EASE }} style={accent ? ({ '--cta': accent } as React.CSSProperties) : undefined}
      className={`group relative inline-flex items-center overflow-hidden rounded-full font-display font-bold transition-[box-shadow,background-color,filter] duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${small ? 'gap-2 py-1.5 pl-1.5 pr-3.5 text-sm' : 'gap-3 py-2 pl-2 pr-6 text-base'} ${s.btn}`}>
      <span className={`relative z-10 grid place-items-center rounded-full transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-6deg] ${small ? 'h-7 w-7' : 'h-9 w-9'} ${s.chip}`}><Icon size={small ? 15 : 18} strokeWidth={2} aria-hidden /></span>
      <span className="relative z-10">{label}</span>
      <ArrowUpRight size={small ? 14 : 16} className="relative z-10 opacity-60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
    </motion.a>
  )
}
