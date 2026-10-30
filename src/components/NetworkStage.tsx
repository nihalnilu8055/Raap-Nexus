import { lazy, Suspense, useEffect, useRef, useState, type MutableRefObject } from 'react'
import type { LucideIcon } from 'lucide-react'
import Fallback3D from './ui/Fallback3D'
import { Boundary, isMobile, webglSupported } from '../lib/webgl'

const Scene = lazy(() => import('../three/NetworkScene'))

export interface StageItem { id: string; short: string; color: string; Icon: LucideIcon }

interface Props {
  items: StageItem[]
  variant: 'platform' | 'ai'
  routeRef: MutableRefObject<number[]>
  selected: number[]
  onSelect: (i: number) => void
  reduced: boolean
  className?: string
  tone?: 'blue' | 'violet'
}

/** Lazy-mounted 3D constellation with accessible HTML labels. Falls back to SVG + chips. */
export default function NetworkStage({ items, variant, routeRef, selected, onSelect, reduced, className = '', tone = 'blue' }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const labels = useRef<(HTMLElement | null)[]>([])
  const [webgl] = useState(webglSupported)
  const [mobile] = useState(isMobile)
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = box.current!
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '700px 0px' })
    const b = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [])

  const live = webgl && near
  const ring = tone === 'violet' ? 'border-violet-300 bg-violet-400/25' : 'border-sky-300 bg-sky-400/25'
  return (
    <div ref={box} className={`relative ${className}`}>
      {live ? (
        <Boundary fallback={<Fallback3D className="h-full w-full" />}>
          <Suspense fallback={<Fallback3D className="h-full w-full opacity-40" />}>
            <Scene colors={items.map((i) => i.color)} variant={variant} routeRef={routeRef} onSelect={onSelect} labels={labels} reduced={reduced} mobile={mobile} active={inView} />
          </Suspense>
        </Boundary>
      ) : (
        <Fallback3D className="h-full w-full opacity-60" />
      )}
      {live && (
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
          {items.map((it, i) => (
            <button key={it.id} type="button" ref={(el) => { labels.current[i] = el }} onClick={() => onSelect(i)} onFocus={() => onSelect(i)} aria-pressed={selected.includes(i)}
              className={`pointer-events-auto absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-display text-[13px] font-bold backdrop-blur transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${selected.includes(i) ? `${ring} text-white` : 'border-white/15 bg-white/5 text-slate-300 hover:text-white'}`} style={{ opacity: 0 }}>
              <it.Icon size={14} style={{ color: it.color }} aria-hidden />{it.short}
            </button>
          ))}
        </div>
      )}
      {/* chips: the selector on phones and whenever WebGL is unavailable */}
      <div className={`absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-1.5 ${live ? 'sm:hidden' : ''}`} role="group" aria-label="Select">
        {items.map((it, i) => (
          <button key={it.id} type="button" onClick={() => onSelect(i)} aria-pressed={selected.includes(i)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-display text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${selected.includes(i) ? `${ring} text-white` : 'border-white/15 bg-[#040a1c]/70 text-slate-300'}`}>
            <it.Icon size={13} style={{ color: it.color }} aria-hidden />{it.short}
          </button>
        ))}
      </div>
    </div>
  )
}
