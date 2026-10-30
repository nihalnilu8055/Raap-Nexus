import { useState } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'

/** Four distinct animated SVG scenes, one per service. Remounted (via key) on selection so each replays. */
type P = { reduced: boolean }
const draw = (d: number, delay = 0, reduced = false) => ({ initial: reduced ? false : { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: d, delay, ease: EASE } }) as const
const Dot = ({ d, dur = 2.4, begin = 0, c = '#fff' }: { d: string; dur?: number; begin?: number; c?: string }) => (
  <circle r="4" fill={c} style={{ filter: `drop-shadow(0 0 6px ${c})` }}><animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={d} /></circle>
)

export function TaxScene({ reduced }: P) {
  const paths = ['M232 138 C 330 138, 330 150, 420 150', 'M232 196 C 330 196, 330 196, 420 196', 'M232 254 C 330 254, 330 242, 420 242']
  const widths = [110, 80, 130, 96, 120, 70]
  return (
    <svg viewBox="0 0 640 380" className="h-full w-full" role="img" aria-label="Tax documents flowing into a VAT calculation">
      <defs>
        <linearGradient id="tx-p" x1="0" x2="1"><stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
        <linearGradient id="tx-bar" x1="0" x2="1"><stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
      </defs>
      <motion.g initial={reduced ? false : { opacity: 0, x: -30, rotate: -4 }} animate={{ opacity: 1, x: 0, rotate: -1.5 }} transition={{ duration: 0.9, ease: EASE }} style={{ transformOrigin: '135px 175px' }}>
        <rect x="40" y="54" width="192" height="256" rx="14" fill="#f8fafc" />
        <rect x="40" y="54" width="192" height="42" rx="14" fill="#fde68a" />
        <rect x="40" y="82" width="192" height="14" fill="#fde68a" />
        <text x="58" y="81" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="13" fill="#92400e">VAT RETURN</text>
        {widths.map((w, i) => (
          <g key={i}>
            <motion.rect x="58" y={118 + i * 30} height="9" rx="4.5" fill={i === 1 || i === 4 ? '#f59e0b' : '#cbd5e1'} initial={reduced ? false : { width: 0 }} animate={{ width: w }} transition={{ duration: 0.7, delay: 0.5 + i * 0.12, ease: EASE }} />
            <motion.rect x="186" y={118 + i * 30} width="30" height="9" rx="4.5" fill="#94a3b8" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.12 }} />
          </g>
        ))}
      </motion.g>
      {paths.map((d, i) => <motion.path key={i} d={d} fill="none" stroke="url(#tx-p)" strokeWidth="2" strokeLinecap="round" {...draw(1, 0.9 + i * 0.15, reduced)} />)}
      {!reduced && paths.map((d, i) => <Dot key={i} d={d} begin={1.6 + i * 0.5} c="#fcd34d" />)}
      <motion.g initial={reduced ? false : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }}>
        <rect x="420" y="44" width="190" height="266" rx="20" fill="#0b1230" stroke="#f59e0b" strokeOpacity=".7" />
        <rect x="436" y="60" width="158" height="62" rx="10" fill="#131f52" />
        <text x="448" y="80" fontSize="10" fontFamily="Inter, sans-serif" fill="#fcd34d" letterSpacing="1.5">NET VAT</text>
        <motion.text x="448" y="108" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="24" fill="#fff" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>AED 0.15M</motion.text>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={438 + (i % 3) * 54} y={140 + Math.floor(i / 3) * 40} width="46" height="30" rx="8" fill={i === 11 ? '#f59e0b' : '#1b2a6b'} style={reduced ? undefined : { animation: `keyPulse 3s ${i * 0.18}s ease-in-out infinite` }} />
        ))}
      </motion.g>
      {[{ y: 334, w: 300, t: 'Output VAT  AED 0.76M', c: 'url(#tx-bar)' }, { y: 354, w: 240, t: 'Input VAT  AED 0.61M', c: '#60a5fa' }].map((b, i) => (
        <g key={b.t}>
          <motion.rect x="40" y={b.y} height="10" rx="5" fill={b.c} initial={reduced ? false : { width: 0 }} animate={{ width: b.w }} transition={{ duration: 1.1, delay: 1.2 + i * 0.2, ease: EASE }} />
          <text x={b.w + 54} y={b.y + 9} fontSize="12" fontFamily="Inter, sans-serif" fill="#cbd5e1">{b.t}</text>
        </g>
      ))}
    </svg>
  )
}

const ROWS: { c: string; dash?: boolean }[] = [{ c: '#34d399' }, { c: '#34d399' }, { c: '#60a5fa' }, { c: '#fbbf24', dash: true }, { c: '#34d399' }]
export function AuditScene({ reduced }: P) {
  return (
    <svg viewBox="0 0 640 380" className="h-full w-full" role="img" aria-label="Ledger entries matched to bank records">
      <text x="40" y="38" fontSize="11" letterSpacing="2" fontFamily="Inter, sans-serif" fill="#6ee7b7">LEDGER</text>
      <text x="600" y="38" textAnchor="end" fontSize="11" letterSpacing="2" fontFamily="Inter, sans-serif" fill="#6ee7b7">BANK</text>
      {ROWS.map((r, i) => {
        const y = 54 + i * 62, d = `M196 ${y + 24} C 290 ${y + 24}, 350 ${y + 24}, 444 ${y + 24}`
        return (
          <g key={i}>
            <motion.g initial={reduced ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}>
              <rect x="40" y={y} width="156" height="48" rx="12" fill="#0d1b4a" stroke="#34d399" strokeOpacity=".35" />
              <rect x="56" y={y + 14} width={70 + (i % 3) * 14} height="7" rx="3.5" fill="#475a9c" /><rect x="56" y={y + 28} width="44" height="6" rx="3" fill="#2b3b78" />
            </motion.g>
            <motion.g initial={reduced ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}>
              <rect x="444" y={y} width="156" height="48" rx="12" fill="#0d1b4a" stroke="#34d399" strokeOpacity=".35" />
              <rect x="460" y={y + 14} width={64 + ((i + 1) % 3) * 16} height="7" rx="3.5" fill="#475a9c" /><rect x="460" y={y + 28} width="44" height="6" rx="3" fill="#2b3b78" />
            </motion.g>
            <motion.path d={d} fill="none" stroke={r.c} strokeWidth="2" strokeLinecap="round" strokeDasharray={r.dash ? '6 6' : undefined} {...draw(0.9, 0.6 + i * 0.18, reduced)} />
            {!reduced && !r.dash && <Dot d={d} dur={2.2} begin={1.5 + i * 0.4} c={r.c} />}
            <motion.g initial={reduced ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 + i * 0.18, type: 'spring', stiffness: 260, damping: 14 }} style={{ transformOrigin: `580px ${y + 24}px` }}>
              <circle cx="580" cy={y + 24} r="11" fill={r.c} />
              {r.dash ? <path d={`M580 ${y + 18} V${y + 25} M580 ${y + 29.5} v.5`} stroke="#0b1230" strokeWidth="2.4" strokeLinecap="round" /> : <path d={`M574.5 ${y + 24.5} l4 4 7-8`} stroke="#0b1230" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            </motion.g>
          </g>
        )
      })}
      <g>
        <circle cx="320" cy="178" r="50" fill="#06231f" stroke="#34d399" strokeOpacity=".6" />
        <circle cx="320" cy="178" r="62" fill="none" stroke="#34d399" strokeOpacity=".35" strokeDasharray="4 8" style={reduced ? undefined : { transformOrigin: '320px 178px', animation: 'spinSlow 20s linear infinite' }} />
        <path d="M320 148 l28 10 v20 c0 16-12 26-28 33 c-16-7-28-17-28-33 v-20z" fill="#34d399" fillOpacity=".15" stroke="#34d399" strokeWidth="2" strokeLinejoin="round" />
        <motion.path d="M306 180 l10 10 20-22" fill="none" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" {...draw(0.7, 1.2, reduced)} />
      </g>
      {!reduced && <rect x="30" width="580" height="3" rx="1.5" fill="#6ee7b7" opacity=".55"><animate attributeName="y" values="46;346;46" dur="5.5s" repeatCount="indefinite" /></rect>}
    </svg>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const REV = [96, 112, 104, 138, 128, 162, 150, 186, 210]
const EXP = [74, 82, 80, 94, 92, 104, 100, 118, 126]
export function AnalysisScene({ reduced }: P) {
  const [hi, setHi] = useState<number | null>(null)
  const base = 318, x0 = 52, step = 60
  const cash = REV.map((r, i) => [x0 + 20 + i * step, 120 - (r - EXP[i]) * 0.42 - i * 3] as const)
  const line = cash.map(([x, y], i) => (i ? `L${x} ${y}` : `M${x} ${y}`)).join(' ')
  const smooth = cash.reduce((a, [x, y], i, arr) => { if (!i) return `M${x} ${y}`; const [px, py] = arr[i - 1]; const cx = (px + x) / 2; return `${a} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}` }, '')
  void line
  return (
    <svg viewBox="0 0 640 380" className="h-full w-full" role="img" aria-label="Animated revenue, expense and cash flow chart"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 640; setHi(Math.max(0, Math.min(8, Math.round((x - x0 - 20) / step)))) }} onPointerLeave={() => setHi(null)}>
      <defs>
        <linearGradient id="an-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
        <linearGradient id="an-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a5b4fc" /><stop offset="1" stopColor="#4f46e5" /></linearGradient>
        <linearGradient id="an-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22d3ee" stopOpacity=".4" /><stop offset="1" stopColor="#22d3ee" stopOpacity="0" /></linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => <line key={i} x1="40" x2="610" y1={base - i * 62} y2={base - i * 62} stroke="#6b84d8" strokeOpacity=".15" />)}
      {hi !== null && <rect x={x0 + 20 + hi * step - 28} y="40" width="56" height={base - 40} rx="14" fill="#fff" opacity=".06" />}
      {REV.map((r, i) => {
        const x = x0 + 20 + i * step, dim = hi !== null && hi !== i ? 0.45 : 1
        return (
          <g key={i} opacity={dim} style={{ transition: 'opacity .25s' }}>
            <motion.rect x={x - 22} width="20" rx="5" fill="url(#an-r)" initial={reduced ? false : { y: base, height: 0 }} animate={{ y: base - r, height: r }} transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: EASE }} />
            <motion.rect x={x + 2} width="20" rx="5" fill="url(#an-e)" initial={reduced ? false : { y: base, height: 0 }} animate={{ y: base - EXP[i], height: EXP[i] }} transition={{ duration: 0.9, delay: 0.18 + i * 0.07, ease: EASE }} />
            <text x={x} y={base + 22} textAnchor="middle" fontSize="11" fontFamily="Inter, sans-serif" fill={hi === i ? '#fff' : '#8ea2d9'}>{MONTHS[i]}</text>
          </g>
        )
      })}
      <motion.path d={`${smooth} L${cash[8][0]} 190 L${cash[0][0]} 190 Z`} fill="url(#an-a)" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} />
      <motion.path d={smooth} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" {...draw(1.6, 0.5, reduced)} />
      {cash.map(([x, y], i) => <motion.circle key={i} cx={x} cy={y} r={hi === i ? 6 : 3.5} fill="#fff" stroke="#22d3ee" strokeWidth="2" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.12 }} />)}
      <g fontSize="11" fontFamily="Inter, sans-serif" fill="#cbd5e1">
        <rect x="46" y="22" width="10" height="10" rx="3" fill="#38bdf8" /><text x="62" y="31">Revenue</text>
        <rect x="126" y="22" width="10" height="10" rx="3" fill="#818cf8" /><text x="142" y="31">Expenses</text>
        <rect x="216" y="22" width="10" height="10" rx="5" fill="#22d3ee" /><text x="232" y="31">Cash flow</text>
      </g>
    </svg>
  )
}

export function BusinessScene({ reduced }: P) {
  const C = 2 * Math.PI * 64, curve = 'M270 300 C 340 290, 380 250, 430 210 S 540 120, 604 70'
  const nodes = [{ x: 380, y: 96, t: 'Sales', c: '#c4b5fd' }, { x: 300, y: 196, t: 'Cost', c: '#f9a8d4' }, { x: 470, y: 300, t: 'Cash', c: '#67e8f9' }]
  return (
    <svg viewBox="0 0 640 380" className="h-full w-full" role="img" aria-label="Margin gauge, growth curve and connected business metrics">
      <defs>
        <linearGradient id="bz-g" x1="0" x2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#ec4899" /></linearGradient>
        <linearGradient id="bz-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a78bfa" stopOpacity=".45" /><stop offset="1" stopColor="#a78bfa" stopOpacity="0" /></linearGradient>
      </defs>
      <motion.path d={`${curve} L604 330 L270 330 Z`} fill="url(#bz-a)" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} />
      <motion.path d={curve} fill="none" stroke="url(#bz-g)" strokeWidth="4" strokeLinecap="round" {...draw(1.6, 0.4, reduced)} />
      <motion.g initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} style={{ transformOrigin: '150px 190px' }}>
        <circle cx="150" cy="190" r="64" fill="none" stroke="#2a2f6b" strokeWidth="14" />
        <motion.circle cx="150" cy="190" r="64" fill="none" stroke="url(#bz-g)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} transform="rotate(-90 150 190)" initial={reduced ? false : { strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - 0.447) }} transition={{ duration: 1.6, delay: 0.3, ease: EASE }} />
        <text x="150" y="190" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="30" fill="#fff">44.7%</text>
        <text x="150" y="212" textAnchor="middle" fontSize="11" fontFamily="Inter, sans-serif" fill="#c4b5fd">Gross margin</text>
      </motion.g>
      {nodes.map((n, i) => {
        const d = `M150 190 L${n.x} ${n.y}`
        return (
          <g key={n.t}>
            <motion.path d={d} stroke={n.c} strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="4 6" fill="none" {...draw(0.8, 0.9 + i * 0.2, reduced)} />
            {!reduced && <Dot d={d} dur={2.6} begin={1.6 + i * 0.6} c={n.c} />}
            <motion.g initial={reduced ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 + i * 0.2, type: 'spring', stiffness: 200, damping: 16 }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
              <rect x={n.x - 34} y={n.y - 15} width="68" height="30" rx="15" fill="#13164a" stroke={n.c} strokeOpacity=".8" />
              <text x={n.x} y={n.y + 4.5} textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="12" fill="#fff">{n.t}</text>
            </motion.g>
          </g>
        )
      })}
      <g>
        <circle cx="604" cy="70" r="7" fill="#fff" /><circle cx="604" cy="70" r="7" fill="none" stroke="#f9a8d4" strokeWidth="2" style={reduced ? undefined : { transformOrigin: '604px 70px', animation: 'ringPing 2s ease-out infinite' }} />
        <text x="596" y="50" textAnchor="end" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="20" fill="#fff">+14.1%</text>
        <text x="596" y="66" textAnchor="end" fontSize="11" fontFamily="Inter, sans-serif" fill="#e9d5ff">Sales growth</text>
      </g>
    </svg>
  )
}
