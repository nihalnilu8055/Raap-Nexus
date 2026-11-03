import { useEffect, useRef, useState } from 'react'

/**
 * Premium cursor layer (desktop mouse only; the native cursor is never hidden, so text selection, forms and clicking are untouched).
 *  - a soft trailing ring that follows the pointer with easing
 *  - the ring expands + glows over links/buttons/tabs/options  (data-cursor not needed)
 *  - over interactive 3D visuals ([data-cursor="visual"]) it becomes a larger, thinner "orbit" ring
 *  - it fades out over text fields so the caret stays unobstructed
 *  - cards marked [data-spotlight] get a soft light that follows the pointer (CSS vars --mx/--my)
 * One passive delegated listener set + one rAF loop that sleeps when the ring has settled. Transforms/opacity only: no layout work.
 */
type Mode = 'idle' | 'link' | 'visual' | 'text'
const SCALE: Record<Mode, number> = { idle: 0.8, link: 1.75, visual: 2.3, text: 0.8 }
const TEXT = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),textarea,select,[contenteditable="true"]'
const LINK = 'a[href],button,[role=button],[role=tab],[role=option],summary,label[for],input[type=checkbox],input[type=radio]'

export default function CursorFX() {
  const [on, setOn] = useState(false)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = matchMedia('(hover: hover) and (pointer: fine)'), calm = matchMedia('(prefers-reduced-motion: reduce)')
    const upd = () => setOn(fine.matches && !calm.matches)
    upd(); fine.addEventListener('change', upd); calm.addEventListener('change', upd)
    return () => { fine.removeEventListener('change', upd); calm.removeEventListener('change', upd) }
  }, [])

  useEffect(() => {
    if (!on) return
    const el = ring.current!
    const s = { x: -100, y: -100, cx: -100, cy: -100, sc: 0.8, tsc: 0.8, op: 0, top: 0, mode: 'idle' as Mode, down: false, raf: 0, seen: false }
    const frame = () => {
      s.cx += (s.x - s.cx) * 0.2; s.cy += (s.y - s.cy) * 0.2
      s.sc += (s.tsc * (s.down ? 0.85 : 1) - s.sc) * 0.18; s.op += (s.top - s.op) * 0.2
      el.style.transform = `translate3d(${s.cx - 16}px,${s.cy - 16}px,0) scale(${s.sc})`
      el.style.opacity = String(s.op)
      const settled = Math.abs(s.x - s.cx) < 0.1 && Math.abs(s.y - s.cy) < 0.1 && Math.abs(s.tsc - s.sc) < 0.005 && Math.abs(s.top - s.op) < 0.01
      s.raf = settled ? 0 : requestAnimationFrame(frame)
    }
    const wake = () => { if (!s.raf) s.raf = requestAnimationFrame(frame) }
    const setMode = (m: Mode) => { s.mode = m; s.tsc = SCALE[m]; s.top = m === 'text' ? 0 : m === 'idle' ? 0.55 : 1; el.dataset.mode = m }
    const over = (t: EventTarget | null) => {
      const n = t as Element | null
      if (!n || !n.closest) return
      if (n.closest(TEXT)) return setMode('text')
      if (n.closest(LINK)) return setMode('link')
      if (n.closest('[data-cursor="visual"]')) return setMode('visual')
      // the hero visual sits underneath the text layout wrapper, so also test its rect (only over empty layout areas, never over copy)
      if (!n.closest('h1,h2,h3,p,span,li')) {
        for (const v of document.querySelectorAll('[data-cursor="visual"]')) {
          const r = v.getBoundingClientRect()
          if (s.x >= r.left && s.x <= r.right && s.y >= r.top && s.y <= r.bottom) return setMode('visual')
        }
      }
      setMode('idle')
    }
    let lastTest = 0
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      s.x = e.clientX; s.y = e.clientY
      if (!s.seen) { s.seen = true; s.cx = s.x; s.cy = s.y; over(e.target) }
      const sp = (e.target as Element | null)?.closest?.('[data-spotlight]') as HTMLElement | null
      if (sp) { const r = sp.getBoundingClientRect(); sp.style.setProperty('--mx', `${e.clientX - r.left}px`); sp.style.setProperty('--my', `${e.clientY - r.top}px`) }
      // idle <-> visual can change without the target changing (visual sits under a wrapper), so re-test at most every 90ms
      if ((s.mode === 'idle' || s.mode === 'visual') && e.timeStamp - lastTest > 90) { lastTest = e.timeStamp; over(e.target) }
      wake()
    }
    const ov = (e: PointerEvent) => { if (e.pointerType === 'mouse') { s.x = e.clientX; s.y = e.clientY; over(e.target); wake() } }
    const leave = (e: MouseEvent) => { if (!e.relatedTarget) { s.top = 0; wake() } }
    const enter = () => { if (s.seen) { setMode(s.mode); wake() } }
    const dn = () => { s.down = true; wake() }, up = () => { s.down = false; wake() }
    document.addEventListener('pointermove', move, { passive: true }); document.addEventListener('pointerover', ov, { passive: true })
    document.addEventListener('mouseout', leave); document.addEventListener('mouseover', enter)
    document.addEventListener('pointerdown', dn, { passive: true }); document.addEventListener('pointerup', up, { passive: true })
    return () => {
      cancelAnimationFrame(s.raf)
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerover', ov)
      document.removeEventListener('mouseout', leave); document.removeEventListener('mouseover', enter)
      document.removeEventListener('pointerdown', dn); document.removeEventListener('pointerup', up)
    }
  }, [on])

  if (!on) return null
  return <div ref={ring} aria-hidden data-mode="idle" className="cursor-ring pointer-events-none fixed left-0 top-0 z-[90] h-8 w-8 rounded-full opacity-0 will-change-transform" />
}
