import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** One easing curve + durations shared by GSAP, Motion and CSS so everything feels the same. */
export const EASE = [0.22, 1, 0.36, 1] as const
export const GSAP_EASE = 'expo.out'
export const DUR = { fast: 0.25, base: 0.6, slow: 1.1 }

/** Shared, mutable scroll state read by WebGL frame loops (no React re-renders). */
export const scrollState = { hero: 0 }

export { gsap, ScrollTrigger }
