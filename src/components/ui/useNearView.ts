import { useEffect, useRef, useState } from 'react'

/** `near` flips on once the element is within `margin` of the viewport (mount heavy scenes late); `inView` tracks live visibility (pause rendering off-screen). */
export function useNearView<T extends HTMLElement>(margin = '700px 0px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // `near` mounts the scene early and unmounts it again once the section is far away (≈3× the margin), so only the scenes around the viewport hold a WebGL context
    const far = `${Math.round(parseFloat(margin) * 3) || 2100}px 0px`
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin })
    const c = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setNear(false) }, { rootMargin: far })
    const b = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    a.observe(el); b.observe(el); c.observe(el)
    return () => { a.disconnect(); b.disconnect(); c.disconnect() }
  }, [margin])
  return { ref, near, inView }
}
