/** Shared orbit model for the hero: ONE source of truth for the DOM labels and the WebGL scene. Pure functions, no DOM. */

export interface OrbitWord { name: string; ring: 0 | 1; idx: number; n: number }
export interface OrbitLayout {
  compact: boolean
  /** label font size, px */
  f: number
  R1: number; R2: number
  /** phase offset of the outer ring (rad) */
  off: number
  /** sphere radius, px */
  sphere: number
  words: OrbitWord[]
}

const INNER_FULL = ['SAP', 'Oracle', 'Odoo', 'Microsoft Dynamics 365', 'NetSuite', 'Sage']
const OUTER_FULL = ['Unit4', 'Infor', 'Epicor', 'Tally', 'Zoho Books', 'Acumatica', 'IFS', 'QuickBooks', 'Focus ERP', 'Workday']
// compact (phones / small tablets): the widest label moves to the outer ring and wraps to three lines so that every word fits without touching its neighbours
const INNER_COMPACT = ['SAP', 'Oracle', 'Odoo', 'NetSuite', 'Sage']
const OUTER_COMPACT = ['Unit4', 'Infor', 'Epicor', 'Tally', 'Zoho Books', 'Acumatica', 'IFS', 'Microsoft Dynamics 365', 'QuickBooks', 'Focus ERP', 'Workday']

export const COMPACT_BELOW = 600
export const ALL_WORDS = [...INNER_FULL, ...OUTER_FULL]

/** geometry for an orbit box of side W (px). Validated offline and in the browser for W = 320…1400 over a full rotation. */
export function layout(W: number): OrbitLayout {
  const compact = W < COMPACT_BELOW
  const inner = compact ? INNER_COMPACT : INNER_FULL, outer = compact ? OUTER_COMPACT : OUTER_FULL
  const f = Math.min(13, Math.max(9, W * 0.0256))
  const words: OrbitWord[] = [
    ...inner.map((name, idx) => ({ name, ring: 0 as const, idx, n: inner.length })),
    ...outer.map((name, idx) => ({ name, ring: 1 as const, idx, n: outer.length })),
  ]
  return compact
    ? { compact, f, R1: W * 0.21, R2: W * 0.39, off: (36 * Math.PI) / 180, sphere: W * 0.1, words }
    : { compact, f, R1: W * 0.24, R2: W * 0.425, off: (16 * Math.PI) / 180, sphere: W * 0.11, words }
}

export interface Pos { x: number; y: number; a: number }
/** position of a word on its ring for rotation `rho` (rad, clockwise from the top). y grows downward (screen space). */
export function place(L: OrbitLayout, w: OrbitWord, rho: number): Pos {
  const R = w.ring === 0 ? L.R1 : L.R2
  const a = rho + (w.ring === 1 ? L.off : 0) + (2 * Math.PI * w.idx) / w.n
  return { x: R * Math.sin(a), y: -R * Math.cos(a), a }
}

/** where a click on a word leads: an existing section of the page (ERP names have no page of their own) */
export const WORD_TARGET: Record<string, string> = {}
export const DEFAULT_TARGET = 'platform'

/** live values shared with the WebGL scene (written by the DOM master loop, read in the scene's frame callback) */
export const orbitState = { rho: 0, speed: 1, hover: -1, px: 0, py: 0, scroll: 0, W: 600, ready: false, pos: [] as Pos[] }
