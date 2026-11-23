// PRICING-PAGE (removable): part of the self-contained Pricing feature, see README-REMOVE.md
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Env } from '../three/parts'

/** The satellites of the RaapNexus core. Shared with the DOM legend so the 3D scene and the page text always agree. */
export const HUB_ITEMS = [
  { id: 'erp', name: 'ERP systems', text: 'Odoo, SAP, Dynamics, Tally and more.' },
  { id: 'db', name: 'Business databases', text: 'SQL Server, PostgreSQL, MySQL and others.' },
  { id: 'ai', name: 'AI agents', text: 'Assistants that read your connected data.' },
  { id: 'dash', name: 'Financial dashboards', text: 'Live views of the numbers that matter.' },
  { id: 'bi', name: 'Business intelligence', text: 'Analysis across every connected source.' },
  { id: 'src', name: 'Connected data sources', text: 'MCP servers, files and APIs.' },
  { id: 'flow', name: 'Workflow automation', text: 'Repeatable processes, automated.' },
] as const
export type HubId = (typeof HUB_ITEMS)[number]['id']
export const STAGES = ['Connect', 'Analyse', 'Expand'] as const

const C = { blue: '#2f6bff', cyan: '#22d3ee', ice: '#bfe8ff', navy: '#0a1d52' }
// three tilted orbit rings: [radius, tilt, items on it]
const RINGS: { r: number; tilt: [number, number]; speed: number; items: HubId[] }[] = [
  { r: 2.35, tilt: [0.35, 0], speed: 0.22, items: ['erp', 'ai', 'flow'] },
  { r: 3.15, tilt: [-0.3, 0.5], speed: -0.15, items: ['db', 'dash'] },
  { r: 3.85, tilt: [0.15, -0.6], speed: 0.1, items: ['bi', 'src'] },
]

const mat = (color: string, emissive = 0.25, metal = 0.7, rough = 0.25) => <meshStandardMaterial color={color} metalness={metal} roughness={rough} emissive={color} emissiveIntensity={emissive} />

function Shape({ id, lite }: { id: HubId; lite: boolean }) {
  const s = lite ? 1 : 1
  switch (id) {
    case 'erp': return <group scale={s}><mesh><boxGeometry args={[0.46, 0.46, 0.46]} />{mat('#2563eb', 0.3)}</mesh><mesh scale={1.06}><boxGeometry args={[0.46, 0.46, 0.46]} /><meshBasicMaterial color={C.ice} wireframe transparent opacity={0.45} /></mesh></group>
    case 'db': return <group>{[-0.2, 0, 0.2].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.28, 0.28, 0.13, lite ? 20 : 36]} />{mat(y === 0 ? '#22d3ee' : '#2563eb', 0.3)}</mesh>)}</group>
    case 'ai': return <group><mesh><octahedronGeometry args={[0.3, 0]} />{mat('#8b7bff', 0.5, 0.5, 0.2)}</mesh><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.42, 0.012, 8, 48]} /><meshBasicMaterial color={C.ice} /></mesh></group>
    case 'dash': return <group rotation={[0, 0.25, 0]}><mesh><boxGeometry args={[0.7, 0.44, 0.04]} />{mat('#0f2a6b', 0.2, 0.6, 0.3)}</mesh>{[-0.2, -0.07, 0.06, 0.19].map((x, i) => <mesh key={x} position={[x, -0.08 + (0.05 * (i + 1)) / 2, 0.03]}><boxGeometry args={[0.08, 0.05 * (i + 1) + 0.06, 0.02]} /><meshBasicMaterial color={i % 2 ? C.cyan : '#60a5fa'} /></mesh>)}</group>
    case 'bi': return <group>{[-0.17, 0, 0.17].map((x, i) => <mesh key={x} position={[x, -0.18 + (0.2 + i * 0.14) / 2, 0]}><boxGeometry args={[0.12, 0.2 + i * 0.14, 0.12]} />{mat(['#60a5fa', '#38bdf8', '#22d3ee'][i], 0.4)}</mesh>)}</group>
    case 'src': return <group>{[[0, 0, 0, 0.17], [0.26, 0.16, 0.05, 0.1], [-0.24, 0.12, -0.04, 0.09], [0.04, -0.27, 0.06, 0.1], [-0.16, -0.18, 0.1, 0.07]].map((p, i) => <mesh key={i} position={[p[0], p[1], p[2]]}><sphereGeometry args={[p[3], lite ? 12 : 20, lite ? 12 : 20]} />{mat(i ? '#38bdf8' : '#3b82f6', 0.45)}</mesh>)}</group>
    default: return <mesh><torusKnotGeometry args={[0.2, 0.065, lite ? 48 : 96, 10, 2, 3]} />{mat('#34d399', 0.35, 0.6, 0.25)}</mesh>
  }
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
      const R = RINGS[it.ring], ang = it.phase, rr = R.r * radius.current
      g.position.set(Math.cos(ang) * rr, 0, Math.sin(ang) * rr)
      g.rotation.y += dt * 0.6; g.rotation.x += dt * 0.2
      const hv = a.hover === it.id, tgt = hv ? 1.35 : 1
      g.scale.setScalar(g.scale.x + (tgt - g.scale.x) * k)
      // satellite world position → line to core (in root space)
      g.getWorldPosition(tmp); root.current.worldToLocal(tmp)
      pos.setXYZ(i * 2, 0, 0, 0); pos.setXYZ(i * 2 + 1, tmp.x, tmp.y, tmp.z)
    })
    pos.needsUpdate = true
    ;(lines.current.material as THREE.LineBasicMaterial).opacity = (a.stage === 0 ? 0.75 : 0.4) + Math.sin(t * 2) * 0.1
  })
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
            {items.filter((x) => x.ring === i).map((it) => (
              <group key={it.id} ref={(el) => { itemRefs.current[it.id] = el }}
                onPointerOver={(e) => { e.stopPropagation(); onHover(it.id) }} onPointerOut={() => onHover(null)}>
                <Shape id={it.id} lite={lite} />
                <mesh visible={false}><sphereGeometry args={[0.55, 8, 8]} /></mesh>
              </group>
            ))}
          </group>
        </group>
      ))}
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
        <Env />
        <Scene api={api} lite={lite} onHover={onHover} />
      </Canvas>
    </div>
  )
}
export type { Api }
