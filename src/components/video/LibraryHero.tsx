import { useEffect, useRef } from 'react'
import { useI18n } from '../../i18n'

/** Compact animated hero for /:lang/videos: headline reveal, aurora, and a CSS-3D stack of glass dashboard panels (no WebGL).
 *  Cursor parallax is mouse-only and runs only while the pointer is moving; `lite` renders the flat static fallback. Styles: library.css (lh-*). */
export default function LibraryHero({ lite }: { lite: boolean }) {
  const { t } = useI18n()
  const root = useRef<HTMLDivElement>(null)
  const rig = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current, rg = rig.current
    if (!el || !rg) return
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    el.classList.toggle('lh-coarse', !fine)
    // Pause the looping animations while the hero is scrolled out of view.
    const io = new IntersectionObserver(([e]) => el.classList.toggle('lh-paused', !e.isIntersecting))
    io.observe(el)
    if (lite) return () => io.disconnect()

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, sraf = 0
    const tick = () => {
      cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09
      rg.style.setProperty('--ry', `${cx.toFixed(2)}deg`); rg.style.setProperty('--rx', `${cy.toFixed(2)}deg`)
      el.style.setProperty('--sheen', `${(cx * 3).toFixed(1)}%`)
      raf = Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02 ? requestAnimationFrame(tick) : 0
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !fine) return
      const r = el.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * 11; ty = (0.5 - (e.clientY - r.top) / r.height) * 2 * 6
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick) }
    const scroll = () => {
      if (sraf) return
      sraf = requestAnimationFrame(() => {
        sraf = 0
        const r = el.getBoundingClientRect()
        el.style.setProperty('--hp', Math.min(1, Math.max(0, -r.top / (r.height * 0.9))).toFixed(3))
      })
    }
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    addEventListener('scroll', scroll, { passive: true })
    return () => {
      io.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(sraf)
      el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); removeEventListener('scroll', scroll)
    }
  }, [lite])

  const words = t('videos.libTitle').split(/\s+/).filter(Boolean)
  return (
    <div ref={root} className={`lh lh-intro${lite ? ' lh-lite' : ''}`}>
      <div className="lh-bg" aria-hidden><div className="lh-aurora"><i /><i /><i /></div><div className="lh-gridfloor" /><div className="lh-sweep" /></div>
      <div className="lh-row">
        <div className="lh-copy">
          <h1 className="lh-h1">
            {words.map((w, i) => (
              <span key={i}><span className="lh-w" style={{ ['--i' as string]: i }}><span className={w === 'RaapNexus' ? 'lh-grad' : undefined}>{w}</span></span>{i < words.length - 1 ? ' ' : ''}</span>
            ))}
          </h1>
          <p className="lh-sub">{t('videos.libText')}</p>
          <div className="lh-rule" aria-hidden />
        </div>
        <div className="lh-sb" aria-hidden>
          <div className="lh-scene"><div ref={rig} className="lh-rig">
            <div className="lh-halo" />
            <div className="lh-orbit lh-o2"><i className="lh-n" /><i className="lh-n" /></div>
            <div className="lh-orbit"><i className="lh-n" /><i className="lh-n" /><i className="lh-n" /></div>
            <div className="lh-panel lh-p2"><div className="lh-float"><div className="lh-glass">
              <svg viewBox="0 0 84 84"><circle className="lh-ring-bg" cx="42" cy="42" r="32" fill="none" strokeWidth="9" /><circle className="lh-ring-a" cx="42" cy="42" r="32" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray="120 201" /><circle className="lh-ring-b" cx="42" cy="42" r="32" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray="46 201" strokeDashoffset="-128" /></svg>
              <div className="lh-ln" style={{ width: '70%' }} /><div className="lh-ln lh-s" style={{ width: '46%', marginTop: 6 }} />
            </div></div></div>
            <div className="lh-panel lh-p1"><div className="lh-float"><div className="lh-glass">
              <div className="lh-dots"><i /><i /><i /></div><div className="lh-ln" style={{ width: '46%' }} /><div className="lh-ln lh-s" style={{ width: '28%', marginTop: 6 }} />
              <svg viewBox="0 0 300 96" preserveAspectRatio="none"><defs><linearGradient id="lh-fa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" stopOpacity=".45" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 80 C30 70 44 60 70 64 S116 36 146 42 S196 22 226 28 S272 8 300 12 V96 H0Z" fill="url(#lh-fa)" />
                <path className="lh-area" d="M0 80 C30 70 44 60 70 64 S116 36 146 42 S196 22 226 28 S272 8 300 12" fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" /><circle cx="300" cy="12" r="4.5" fill="#bae6fd" /></svg>
              <div className="lh-kpis"><div><b /><i className="lh-ln lh-s" /></div><div><b /><i className="lh-ln lh-s" /></div><div><b /><i className="lh-ln lh-s" /></div></div>
            </div></div></div>
            <div className="lh-panel lh-p3"><div className="lh-float"><div className="lh-glass"><span className="lh-ai">AI</span><div className="lh-ln" style={{ width: '44%' }} /><div className="lh-bars"><i /><i /><i /><i /><i /></div></div></div></div>
          </div></div>
        </div>
      </div>
    </div>
  )
}
