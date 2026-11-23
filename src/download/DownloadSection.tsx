// DOWNLOAD-APP (removable): self-contained desktop download section, see README-REMOVE.md in this folder
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Check, Download, Loader2, Clock } from 'lucide-react'
import { EASE } from '../lib/motion'

/** Verified installer URLs (HTTP 200, real MZ / PK file headers, checked 23 Nov 2026). Set a url to null to show the "awaiting installer" state. */
export const DOWNLOADS = {
  windows: { url: 'https://raap.techorbit.net/nexusupdates/latest/windows.exe' as string | null, file: 'windows.exe' },
  macos: { url: 'https://raap.techorbit.net/nexusupdates/latest/macos.zip' as string | null, file: 'macos.zip' },
}

const WinIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor"><path d="M2 4.6 10.4 3.4v7.8H2zM11.5 3.3 22 1.8v9.4H11.5zM2 12.3h8.4v7.9L2 19zM11.5 12.3H22v9.4l-10.5-1.5z" /></svg>
)
const AppleIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor"><path d="M17.05 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.15-2.8.85-3.5.85-.75 0-1.85-.8-3.05-.8-1.55 0-3 .9-3.8 2.3-1.65 2.85-.4 7 1.15 9.3.8 1.1 1.7 2.35 2.9 2.3 1.15-.05 1.6-.75 3-.75s1.8.75 3.05.7c1.25-.05 2.05-1.15 2.8-2.25.9-1.3 1.25-2.55 1.3-2.6-.05 0-2.45-.95-2.5-3.75zM14.8 5.8c.65-.8 1.1-1.9.95-3-.95.05-2.1.65-2.75 1.45-.6.7-1.1 1.8-.95 2.9 1.05.1 2.1-.5 2.75-1.35z" /></svg>
)

type Plat = 'windows' | 'macos'
const META: Record<Plat, { title: string; desc: string; btn: string; kind: string; Icon: typeof WinIcon; glow: string; chip: string }> = {
  windows: { title: 'RaapNexus for Windows', desc: 'Download the desktop application for Windows.', btn: 'Download for Windows', kind: 'Windows installer · .exe', Icon: WinIcon, glow: '56,189,248', chip: 'from-sky-400 to-blue-600' },
  macos: { title: 'RaapNexus for macOS', desc: 'Download the desktop application for macOS.', btn: 'Download for macOS', kind: 'macOS app · .zip', Icon: AppleIcon, glow: '167,139,250', chip: 'from-slate-200 to-slate-400' },
}

/** When false the button follows the verified installer URL (the browser downloads the file). Kept as a switch for demos. */
const DEMO = false

function Card({ plat, recommended, index }: { plat: Plat; recommended: boolean; index: number }) {
  const m = META[plat]; const d = DOWNLOADS[plat]; const live = !!d.url
  const reduced = !!useReducedMotion()
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const mx = useMotionValue(0), my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 140, damping: 16 }), sy = useSpring(my, { stiffness: 140, damping: 16 })
  const rx = useTransform(sy, [-0.5, 0.5], [9, -9]), ry = useTransform(sx, [-0.5, 0.5], [-11, 11])
  const gx = useTransform(sx, [-0.5, 0.5], ['25%', '75%']), gy = useTransform(sy, [-0.5, 0.5], ['20%', '80%'])
  const glare = useTransform([gx, gy] as never, ([x, y]: string[]) => `radial-gradient(420px circle at ${x} ${y}, rgba(255,255,255,.10), transparent 55%)`)
  const move = (e: React.PointerEvent<HTMLDivElement>) => { if (reduced || e.pointerType !== 'mouse') return; const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5) }
  const leave = () => { mx.set(0); my.set(0) }
  const click = (e: React.MouseEvent) => {
    if (!live) { e.preventDefault(); return }
    if (DEMO) { e.preventDefault(); if (state !== 'idle') return; setState('busy'); window.setTimeout(() => setState('done'), 1100); window.setTimeout(() => setState('idle'), 4200) }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, ease: EASE, delay: index * 0.12 }} style={{ perspective: 1100 }} className="min-w-0">
      <motion.div onPointerMove={move} onPointerLeave={leave} style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'flat' }}
        className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[.07] to-white/[.02] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)] transition-[border-color,box-shadow] duration-300 hover:border-white/25 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: `rgba(${m.glow},.35)` }} />
        {!reduced && <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />}
        {recommended && <span className="absolute end-4 top-4 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-emerald-200">Your device</span>}
        <div className="relative flex flex-col items-center text-center sm:items-start sm:text-start">
          <motion.span whileHover={reduced ? undefined : { rotateY: 14, rotateX: -8, scale: 1.05 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className={`grid h-[72px] w-[72px] place-items-center rounded-2xl bg-gradient-to-br ${m.chip} text-[#05102a] shadow-[0_12px_30px_-8px_rgba(${m.glow},.6),inset_0_1px_0_rgba(255,255,255,.55)]`}>
            <m.Icon className="h-9 w-9" />
          </motion.span>
          <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-white">{m.title}</h3>
          <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-slate-300">{m.desc}</p>
          <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[.14em] text-slate-400">{m.kind}</p>
          <a href={live ? d.url! : undefined} download={live ? d.file : undefined} onClick={click} aria-disabled={!live} aria-live="polite" data-testid={`dl-${plat}`} data-state={live ? state : 'pending'}
            className={`relative mt-6 inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 font-display text-base font-bold transition-[transform,box-shadow,filter,background-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040a1c] sm:w-auto ${live ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_14px_34px_-10px_rgba(37,99,235,.9)] hover:brightness-110 hover:shadow-[0_18px_44px_-10px_rgba(56,189,248,.8)] active:scale-[.97]' : 'cursor-not-allowed border border-white/15 bg-white/5 text-slate-400'}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={live ? state : 'pending'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="inline-flex items-center gap-2.5">
                {!live ? <><Clock size={18} aria-hidden />Installer coming soon</> : state === 'busy' ? <><Loader2 size={18} className="animate-spin" aria-hidden />Preparing download…</> : state === 'done' ? <><Check size={18} aria-hidden />Download started</> : <><Download size={18} aria-hidden />{m.btn}</>}
              </motion.span>
            </AnimatePresence>
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DownloadSection() {
  const ref = useRef<HTMLElement>(null)
  const [os, setOs] = useState<Plat | null>(null)
  useEffect(() => { const u = navigator.userAgent; setOs(/Windows/i.test(u) ? 'windows' : /Mac/i.test(u) && !/iPhone|iPad/i.test(u) ? 'macos' : null) }, [])
  return (
    <section ref={ref} id="download" aria-labelledby="download-h" className="relative overflow-hidden bg-[#040a1c] px-6 py-20 sm:py-24">
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 0%, rgba(37,99,235,.28), transparent 70%)' }} />
      <div aria-hidden className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'linear-gradient(#8fb4ff 1px,transparent 1px),linear-gradient(90deg,#8fb4ff 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 40%,#000,transparent)' }} />
      <div className="relative mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[.16em] text-sky-200"><Download size={13} aria-hidden />Desktop app</span>
          <h2 id="download-h" className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Take Your Business Intelligence <span className="bg-gradient-to-r from-sky-200 to-blue-500 bg-clip-text text-transparent">Anywhere</span></h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">Download RaapNexus for your desktop and connect your business systems with intelligent financial insights.</p>
        </motion.div>
        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-2 md:gap-7">
          <Card plat="windows" index={0} recommended={os === 'windows'} />
          <Card plat="macos" index={1} recommended={os === 'macos'} />
        </div>
      </div>
    </section>
  )
}
