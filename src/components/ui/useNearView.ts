import { useEffect, useRef, useState } from 'react'

/** `near` flips on once the element is within `margin` of the viewport (mount heavy scenes late); `inView` tracks live visibility (pause rendering off-screen). */
export function useNearView<T extends HTMLElement>(margin = '700px 0px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current!
    const a = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: margin })
    const b = new IntersectionObserver(([e]) => setInView(e.isIntersecting))
    a.observe(el); b.observe(el)
    return () => { a.disconnect(); b.disconnect() }
  }, [margin])
  return { ref, near, inView }
}
