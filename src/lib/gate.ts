import { useEffect, useState } from 'react'

export interface GlInfo { ok: boolean; /** the browser is rasterising WebGL on the CPU (SwiftShader / llvmpipe / "software") */ software: boolean; renderer: string }
let info: GlInfo | null = null

/** ONE throw-away WebGL probe per page (previously every caller created its own context). Reads the renderer name and releases the context. */
export function glInfo(): GlInfo {
  if (info) return info
  info = { ok: false, software: false, renderer: '' }
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const r = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || '')
      info = { ok: true, software: /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(r), renderer: r }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch { /* no WebGL */ }
  return info
}

const INTERACTION = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'wheel', 'scroll'] as const

/**
 * Decides WHEN a heavy 3D scene may start. It never starts before the page has finished loading, so the hero text, header and DOM
 * visuals are painted and interactive first.
 *  - GPU-accelerated browsers: right after load, on an idle callback (same experience as before, minus the contention with load).
 *  - CPU-rasterised WebGL (no usable GPU): a frame costs hundreds of ms and would freeze the page, so the scene starts on the first
 *    real user interaction (scroll, touch, pointer, key) instead. The DOM version of the hero model is fully visible until then.
 */
export function useSceneGate(): boolean {
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (go) return
    let done = false, idleId = 0, t = 0
    const fire = () => { if (done) return; done = true; cleanup(); setGo(true) }
    const cleanup = () => { INTERACTION.forEach((e) => window.removeEventListener(e, fire)); window.removeEventListener('load', afterLoad); if (idleId && 'cancelIdleCallback' in window) (window as Window & { cancelIdleCallback: (n: number) => void }).cancelIdleCallback(idleId); clearTimeout(t) }
    const afterLoad = () => {
      if (glInfo().software) return // wait for a real interaction (listeners below)
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(fire, { timeout: 2000 }); else t = window.setTimeout(fire, 1500)
    }
    INTERACTION.forEach((e) => window.addEventListener(e, fire, { passive: true, once: true }))
    // an interaction before `load` must not start a scene while the page is still loading
    const guarded = () => { if (document.readyState === 'complete') return; INTERACTION.forEach((e) => window.removeEventListener(e, fire)); window.addEventListener('load', () => { INTERACTION.forEach((e) => window.addEventListener(e, fire, { passive: true, once: true })); afterLoad() }, { once: true }) }
    if (document.readyState === 'complete') afterLoad(); else guarded()
    return cleanup
  }, [go])
  return go
}
