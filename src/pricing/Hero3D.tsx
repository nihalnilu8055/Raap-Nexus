// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Env } from '../three/parts'

/** Eight holographic glass currency tokens orbit the core. Shared with the DOM legend so the 3D scene and the page text always agree. */
export const HUB_ITEMS = [
  { id: 'usd', name: 'USD', text: 'US Dollar · $', sym: '$', code: 'USD', finish: 'gold', size: 1.15, spin: 0.9 },
  { id: 'inr', name: 'INR', text: 'Indian Rupee · ₹', sym: '₹', code: 'INR', finish: 'cyan', size: 0.95, spin: -0.7 },
  { id: 'eur', name: 'EUR', text: 'Euro · €', sym: '€', code: 'EUR', finish: 'blue', size: 1.3, spin: 0.6 },
  { id: 'gbp', name: 'GBP', text: 'British Pound · £', sym: '£', code: 'GBP', finish: 'silver', size: 1.0, spin: -1.0 },
  { id: 'jpy', name: 'JPY', text: 'Japanese Yen · ¥', sym: '¥', code: 'JPY', finish: 'gold', size: 0.88, spin: 0.8 },
  { id: 'aed', name: 'AED', text: 'UAE Dirham · د.إ', sym: 'د.إ', code: 'AED', finish: 'silver', size: 1.2, spin: -0.55 },
  { id: 'sar', name: 'SAR', text: 'Saudi Riyal · ر.س', sym: 'ر.س', code: 'SAR', finish: 'cyan', size: 0.82, spin: 1.05 },
  { id: 'kwd', name: 'KWD', text: 'Kuwaiti Dinar · د.ك', sym: 'د.ك', code: 'KWD', finish: 'blue', size: 1.05, spin: -0.85 },
] as const
export type HubId = (typeof HUB_ITEMS)[number]['id']
export const STAGES = ['Connect', 'Analyse', 'Expand'] as const

const C = { blue: '#2f6bff', cyan: '#22d3ee', ice: '#bfe8ff', navy: '#0a1d52' }
// three tilted orbit rings: [radius, tilt, items on it]
const RINGS: { r: number; tilt: [number, number]; speed: number; items: HubId[] }[] = [
  { r: 2.35, tilt: [0.35, 0], speed: 0.22, items: ['usd', 'eur', 'jpy'] },
  { r: 3.15, tilt: [-0.3, 0.5], speed: -0.15, items: ['inr', 'aed', 'kwd'] },
  { r: 3.85, tilt: [0.15, -0.6], speed: 0.1, items: ['gbp', 'sar'] },
]

const FINISH = {
  gold: { a: '#fff1b8', b: '#d9a62b', c: '#8a5a0c', ink: '#6b4208', metal: 1, rough: 0.28, glow: '#b8860b' },
  silver: { a: '#ffffff', b: '#c9d3e0', c: '#7d8aa0', ink: '#3b475c', metal: 1, rough: 0.26, glow: '#8aa0c0' },
  cyan: { a: '#c9fbff', b: '#22d3ee', c: '#0b6f86', ink: '#064a5c', metal: 0.95, rough: 0.3, glow: '#0891b2' },
  blue: { a: '#cfe0ff', b: '#3b7bff', c: '#12307f', ink: '#0b1f5c', metal: 0.95, rough: 0.3, glow: '#1d4ed8' },
} as const

/** The glowing artwork of one token face (ring, inner ring, symbol and ISO code, white on black). It is used as the face's alpha map. */
function glowTexture(it: (typeof HUB_ITEMS)[number], lite: boolean) {
  const N = lite ? 512 : 1024, u = N / 512, C = N / 2
  const e = document.createElement('canvas'); e.width = e.height = N
  const y = e.getContext('2d')!; y.fillStyle = '#000'; y.fillRect(0, 0, N, N)
  y.shadowColor = '#fff'; y.shadowBlur = 22 * u; y.strokeStyle = '#fff'
  y.lineWidth = 6 * u; y.beginPath(); y.arc(C, C, N * 0.4, 0, 7); y.stroke()
  y.lineWidth = 3 * u; y.beginPath(); y.arc(C, C, N * 0.34, 0, 7); y.stroke()
  const fam = "'Segoe UI','Arial','Noto Sans','DejaVu Sans',sans-serif", rtl = /[\u0600-\u06FF]/.test(it.sym), big = (it.sym.length > 2 ? 150 : 250) * u
  y.textAlign = 'center'; y.textBaseline = 'middle'; y.fillStyle = '#fff'
  y.direction = rtl ? 'rtl' : 'ltr'; y.font = `800 ${big}px ${fam}`; y.fillText(it.sym, C, N * 0.45)
  y.direction = 'ltr'; y.font = `700 ${54 * u}px ${fam}`; y.fillText(it.code, C, N * 0.78)
  const t = new THREE.CanvasTexture(e); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  return t
}

function Coin({ id, lite }: { id: HubId; lite: boolean }) {
  const it = HUB_ITEMS.find((h) => h.id === id)!, f = FINISH[it.finish]
  const glowMap = useMemo(() => glowTexture(it, lite), [it, lite])
  const T = 0.12, R = 0.5, seg = lite ? 48 : 96
  // beveled rim profile (revolved), axis turned to Z so the token faces the viewer
  const rim = useMemo(() => new THREE.LatheGeometry([[R - 0.09, -T / 2], [R - 0.03, -T / 2], [R, -T / 2 + 0.03], [R, T / 2 - 0.03], [R - 0.03, T / 2], [R - 0.09, T / 2]].map(([x, y]) => new THREE.Vector2(x, y)), seg), [seg])
  const face = <meshBasicMaterial alphaMap={glowMap} color={f.a} transparent opacity={1} depthWrite={false} toneMapped={false} />
  return (
    <group scale={it.size * 0.74}>
      <mesh geometry={rim} rotation={[Math.PI / 2, 0, 0]}><meshPhysicalMaterial color={f.b} transparent opacity={0.55} roughness={0.08} metalness={0.3} clearcoat={1} emissive={f.glow} emissiveIntensity={0.9} envMapIntensity={2.4} /></mesh>
      <mesh position={[0, 0, T / 2 - 0.02]}><circleGeometry args={[R - 0.085, seg]} />{face}</mesh>
      <mesh position={[0, 0, -T / 2 + 0.02]} rotation={[0, Math.PI, 0]}><circleGeometry args={[R - 0.085, seg]} />{face}</mesh>
      <mesh><circleGeometry args={[R - 0.09, seg]} /><meshBasicMaterial color={f.b} transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh><torusGeometry args={[R - 0.005, 0.016, 8, seg]} /><meshBasicMaterial color={f.a} /></mesh>
    </group>
  )
}

/** Twinkling dust that drifts around the core, for depth. */
function Sparkles({ count, reduced }: { count: number; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null!)
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { const r = 1.8 + Math.random() * 3.2, a = Math.random() * 6.283, y = (Math.random() - 0.5) * 3.2; p.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g
  }, [count])
  useFrame((s) => { if (reduced) return; ref.current.rotation.y = s.clock.elapsedTime * 0.04; ;(ref.current.material as THREE.PointsMaterial).opacity = 0.55 + Math.sin(s.clock.elapsedTime * 1.7) * 0.2 })
  return <points ref={ref} geometry={geo}><pointsMaterial color="#cfeaff" size={0.045} sizeAttenuation transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
}

interface Api { hover: HubId | null; stage: number; px: number; py: number; reduced: boolean }

function Scene({ api, lite, onHover }: { api: React.MutableRefObject<Api>; lite: boolean; onHover: (id: HubId | null) => void }) {
  const root = useRef<THREE.Group>(null!), core = useRef<THREE.Group>(null!), shell = useRef<THREE.Mesh>(null!)
  const ringRefs = useRef<(THREE.Group | null)[]>([]), itemRefs = useRef<Record<string, THREE.Group | null>>({})
  const radius = useRef(1), glow = useRef(1)
  const items = useMemo(() => RINGS.flatMap((r, ri) => r.items.map((id, i) => ({ id, ring: ri, phase: (i / r.items.length) * Math.PI * 2 + ri }))), [])
  const lines = useRef<THREE.LineSegments>(null!)
  const lineGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(items.length * 6), 3)); return g }, [items.length])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((s, dt) => {
    const t = api.current.reduced ? 0 : s.clock.elapsedTime, k = 1 - Math.exp(-dt * 3), a = api.current
    const sy = typeof window !== 'undefined' ? Math.min(1, window.scrollY / 700) : 0
    root.current.rotation.y += (a.px * 0.5 - root.current.rotation.y) * k
    root.current.rotation.x += (a.py * 0.3 + sy * 0.25 - root.current.rotation.x) * k
    root.current.position.y += (sy * 0.9 - root.current.position.y) * k
    // stage: 0 Connect (compact, lines draw), 1 Analyse (core glows, rings speed up), 2 Expand (orbits widen)
    const tr = a.stage === 2 ? 1.07 : a.stage === 0 ? 0.9 : 0.98
    radius.current += (tr - radius.current) * k * 0.8
    glow.current += ((a.stage === 1 ? 1.9 : 1) - glow.current) * k
    core.current.rotation.y = t * 0.25; core.current.rotation.x = Math.sin(t * 0.3) * 0.15
    shell.current.rotation.y = -t * 0.18; shell.current.rotation.z = t * 0.1
    ;(shell.current.material as THREE.MeshBasicMaterial).opacity = 0.18 * glow.current
    const sp = a.stage === 1 ? 1.8 : 1
    RINGS.forEach((r, i) => { const g = ringRefs.current[i]; if (g) g.rotation.y = t * r.speed * sp })
    const pos = lineGeo.attributes.position as THREE.BufferAttribute
    items.forEach((it, i) => {
      const g = itemRefs.current[it.id]; if (!g) return
      const sd = HUB_ITEMS.find((h) => h.id === it.id)!.spin
      const R = RINGS[it.ring], ang = it.phase, rr = R.r * radius.current
      g.position.set(Math.cos(ang) * rr, 0, Math.sin(ang) * rr)
      g.rotation.y += dt * sd * 1.7; g.rotation.x = Math.sin(t * 0.6 + it.phase * 2) * 0.3; g.rotation.z = Math.sin(t * 0.45 + it.phase) * 0.18; g.position.y = Math.sin(t * 1.1 + it.phase * 3) * 0.16
      const intro = a.reduced ? 1 : Math.min(1, Math.max(0, (t - i * 0.14) / 1.0)), ease = 1 - Math.pow(1 - intro, 3), hv = a.hover === it.id, tgt = (hv ? 1.4 : 1) * ease
      g.scale.setScalar(g.scale.x + (tgt - g.scale.x) * k)
      // satellite world position → line to core (in root space)
      g.getWorldPosition(tmp); root.current.worldToLocal(tmp)
      pos.setXYZ(i * 2, 0, 0, 0); pos.setXYZ(i * 2 + 1, tmp.x, tmp.y, tmp.z)
    })
    pos.needsUpdate = true
    ;(lines.current.material as THREE.LineBasicMaterial).opacity = (a.stage === 0 ? 0.75 : 0.4) + Math.sin(t * 2) * 0.1
  })
  const renderItem = (it: (typeof items)[number]) => (
    <group key={it.id} scale={0.001} ref={(el) => { itemRefs.current[it.id] = el }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(it.id) }} onPointerOut={() => onHover(null)}>
      <Coin id={it.id} lite={lite} />
      <mesh visible={false}><sphereGeometry args={[0.6, 8, 8]} /></mesh>
    </group>
  )
  return (
    <group ref={root}>
      <group ref={core}>
        <mesh><icosahedronGeometry args={[0.95, lite ? 2 : 3]} /><meshPhysicalMaterial color="#0b2468" metalness={0.6} roughness={0.14} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.2} emissive="#1a4bd8" emissiveIntensity={0.35} /></mesh>
        <mesh scale={0.55}><icosahedronGeometry args={[0.95, 1]} /><meshBasicMaterial color={C.cyan} transparent opacity={0.9} /></mesh>
      </group>
      <mesh ref={shell} scale={1.42}><icosahedronGeometry args={[0.95, 1]} /><meshBasicMaterial color={C.ice} wireframe transparent opacity={0.18} depthWrite={false} /></mesh>
      <mesh rotation={[Math.PI / 2.4, 0.3, 0]}><torusGeometry args={[1.35, 0.016, 10, 120]} /><meshStandardMaterial color="#9fd0ff" metalness={1} roughness={0.2} emissive={C.blue} emissiveIntensity={0.5} /></mesh>
      {RINGS.map((r, i) => (
        <group key={i} rotation={[r.tilt[0], r.tilt[1], 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={1}><torusGeometry args={[r.r, 0.006, 6, 160]} /><meshBasicMaterial color={i === 0 ? C.cyan : C.blue} transparent opacity={0.28} /></mesh>
          <group ref={(el) => { ringRefs.current[i] = el }}>
            {items.filter((x) => x.ring === i).map(renderItem)}
          </group>
        </group>
      ))}
      <Sparkles count={lite ? 40 : 110} reduced={api.current.reduced} />
      <lineSegments ref={lines} geometry={lineGeo}><lineBasicMaterial color={C.ice} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} /></lineSegments>
    </group>
  )
}

/** Lazy-loaded WebGL half of the pricing hero. State comes in through `api` (a ref), so React never re-renders per frame. */
export default function Hero3D({ api, lite, onHover }: { api: React.MutableRefObject<Api>; lite: boolean; onHover: (id: HubId | null) => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = wrap.current; if (!el) return
    const mv = (e: PointerEvent) => { const r = el.getBoundingClientRect(); api.current.px = ((e.clientX - r.left) / r.width - 0.5) * 2; api.current.py = ((e.clientY - r.top) / r.height - 0.5) * 2 }
    const lv = () => { api.current.px = 0; api.current.py = 0 }
    el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv)
    return () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv) }
  }, [api])
  return (
    <div ref={wrap} className="absolute inset-y-0 -inset-x-[14%]">
      <Canvas dpr={lite ? 1 : [1, 1.75]} camera={{ position: [0, 1.0, 9.8], fov: 36 }} gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }} frameloop={api.current.reduced ? 'demand' : 'always'} style={{ touchAction: 'pan-y' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 4, 6]} intensity={80} color="#6ea8ff" />
        <pointLight position={[-6, -3, 4]} intensity={50} color="#22d3ee" />
        <directionalLight position={[3, 5, 7]} intensity={2.2} color="#fff4dc" />
        <pointLight position={[0, 6, -6]} intensity={40} color="#9fd0ff" />
        <Env />
        <Scene api={api} lite={lite} onHover={onHover} />
      </Canvas>
    </div>
  )
}
export type { Api }
