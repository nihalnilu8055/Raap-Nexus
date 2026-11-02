import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Env, sprite } from '../parts'
import { canvasTexture, clamp01, ease, rr } from './tex'

/**
 * AI Intelligence Engine: Financial Data -> AI Processing -> Financial Insights.
 * Documents and ledger fragments stream into a layered, transforming core; insight particles leave it and
 * resolve into holographic charts. Abstract on purpose (no readable small text) and illustrative only.
 */
export interface EngineProps { progressRef: MutableRefObject<number>; onPhase: (i: number) => void; reduced: boolean; mobile: boolean; active: boolean }

const DATA = '#38bdf8', CORE = '#8b7bff', OUT = '#34d399', GOLD = '#fbbf24'
const CYCLE = 10.5
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

const docTex = () => canvasTexture(256, 340, (g, w, h) => {
  g.fillStyle = 'rgba(8,22,60,.88)'; rr(g, 6, 6, w - 12, h - 12, 22); g.fill(); g.strokeStyle = 'rgba(56,189,248,.85)'; g.lineWidth = 5; g.stroke()
  g.fillStyle = 'rgba(125,211,252,.95)'; rr(g, 30, 34, 90, 16, 8); g.fill()
  for (let i = 0; i < 7; i++) { g.fillStyle = `rgba(160,200,255,${i % 3 === 0 ? 0.85 : 0.4})`; rr(g, 30, 82 + i * 34, 120 + ((i * 47) % 80), 12, 6); g.fill() }
  g.fillStyle = 'rgba(52,211,153,.9)'; rr(g, w - 90, h - 56, 60, 22, 10); g.fill()
})
const barsTex = () => canvasTexture(512, 360, (g, w, h) => {
  g.fillStyle = 'rgba(6,28,34,.82)'; rr(g, 6, 6, w - 12, h - 12, 30); g.fill(); g.strokeStyle = 'rgba(52,211,153,.9)'; g.lineWidth = 5; g.stroke()
  ;[0.32, 0.5, 0.42, 0.68, 0.58, 0.82, 0.95].forEach((v, i) => { const x = 50 + i * 60, bh = v * 220; const gr = g.createLinearGradient(0, h - 50 - bh, 0, h - 50); gr.addColorStop(0, '#6ee7b7'); gr.addColorStop(1, '#0d9488'); g.fillStyle = gr; rr(g, x, h - 50 - bh, 38, bh, 8); g.fill() })
  g.strokeStyle = 'rgba(253,230,138,.95)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); [0.3, 0.46, 0.4, 0.62, 0.55, 0.78, 0.9].forEach((v, i) => { const x = 69 + i * 60, y = h - 50 - v * 230; i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.stroke()
})
const ringTex = () => canvasTexture(400, 400, (g, w) => {
  g.fillStyle = 'rgba(14,12,52,.84)'; rr(g, 6, 6, w - 12, w - 12, 36); g.fill(); g.strokeStyle = 'rgba(167,139,250,.95)'; g.lineWidth = 5; g.stroke()
  const seg = [[0.42, '#a78bfa'], [0.27, '#38bdf8'], [0.19, '#34d399'], [0.12, '#fbbf24']] as const
  let a = -Math.PI / 2
  seg.forEach(([f, c]) => { g.strokeStyle = c; g.lineWidth = 34; g.beginPath(); g.arc(w / 2, w / 2, 106, a, a + f * Math.PI * 2 - 0.06); g.stroke(); a += f * Math.PI * 2 })
  g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, w / 2 - 44, w / 2 - 9, 88, 18, 9); g.fill()
})
const lineTex = () => canvasTexture(512, 300, (g, w, h) => {
  g.fillStyle = 'rgba(7,24,60,.84)'; rr(g, 6, 6, w - 12, h - 12, 30); g.fill(); g.strokeStyle = 'rgba(56,189,248,.9)'; g.lineWidth = 5; g.stroke()
  const gr = g.createLinearGradient(0, 60, 0, h); gr.addColorStop(0, 'rgba(56,189,248,.5)'); gr.addColorStop(1, 'rgba(56,189,248,0)')
  const pts = [0.2, 0.34, 0.28, 0.5, 0.42, 0.66, 0.6, 0.88]
  g.beginPath(); pts.forEach((v, i) => { const x = 40 + i * 62, y = h - 48 - v * 180; i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.lineTo(40 + 7 * 62, h - 48); g.lineTo(40, h - 48); g.closePath(); g.fillStyle = gr; g.fill()
  g.strokeStyle = '#7dd3fc'; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); pts.forEach((v, i) => { const x = 40 + i * 62, y = h - 48 - v * 180; i ? g.lineTo(x, y) : g.moveTo(x, y) }); g.stroke()
  g.fillStyle = '#fff'; g.beginPath(); g.arc(40 + 7 * 62, h - 48 - 0.88 * 180, 10, 0, 7); g.fill()
})

const IN = [
  new THREE.CubicBezierCurve3(V(-7.4, 2.4, -1.2), V(-5, 3.2, -0.4), V(-2.6, 1.4, 0.2), V(-0.9, 0.35, 0)),
  new THREE.CubicBezierCurve3(V(-7.6, 0, 0.6), V(-5, 0.4, 1), V(-2.6, 0.1, 0.4), V(-1, 0, 0.1)),
  new THREE.CubicBezierCurve3(V(-7.2, -2.4, -0.8), V(-5, -3.2, -0.2), V(-2.6, -1.6, 0.3), V(-0.9, -0.35, 0)),
]
const PANELS = [
  { p: V(5.6, 2.1, -0.6), tex: barsTex, size: [3.5, 2.45] as const, ry: -0.38 },
  { p: V(5.9, -0.9, 0.5), tex: ringTex, size: [2.5, 2.5] as const, ry: -0.3 },
  { p: V(3.6, -3.0, 1.2), tex: lineTex, size: [3.2, 1.9] as const, ry: -0.22 },
]
const OUTC = PANELS.map((pn, i) => new THREE.CubicBezierCurve3(V(0.9, 0, 0), V(2.1, i === 1 ? 0.2 : 1 - i * 0.9, 0.6), V(pn.p.x - 1.9, pn.p.y * 0.8, pn.p.z), pn.p.clone().add(V(-1.4, 0, 0))))

function Engine({ progressRef, onPhase, reduced, mobile }: Omit<EngineProps, 'active'>) {
  const { camera, size, gl } = useThree()
  const spr = useMemo(() => sprite(), [])
  const dtex = useMemo(() => docTex(), [])
  const ptex = useMemo(() => PANELS.map((p) => p.tex()), [])
  const g1 = useRef<THREE.Mesh>(null!), g2 = useRef<THREE.Mesh>(null!), g3 = useRef<THREE.Mesh>(null!)
  const r1 = useRef<THREE.Mesh>(null!), r2 = useRef<THREE.Mesh>(null!), r3 = useRef<THREE.Mesh>(null!)
  const coreG = useRef<THREE.Group>(null!), heart = useRef<THREE.Mesh>(null!), halo = useRef<THREE.Sprite>(null!)
  const docs = useRef<THREE.Mesh[]>([]), panels = useRef<THREE.Group[]>([])
  const phase = useRef(-1), look = useRef(V(0, 0, 0))
  const ND = mobile ? 5 : 8, NI = mobile ? 10 : 18, NO = mobile ? 8 : 14

  const lines = useMemo(() => [...IN.map((c) => ({ c, color: DATA })), ...OUTC.map((c) => ({ c, color: OUT }))].map(({ c, color }) =>
    new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(64)), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }))), [])
  const pts = useMemo(() => {
    const n = 3 * NI + 3 * NO
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    const col = new Float32Array(n * 3), a = new THREE.Color(DATA), b = new THREE.Color(OUT), y = new THREE.Color(GOLD)
    for (let i = 0; i < n; i++) { const c = i < 3 * NI ? a : (i % 5 === 0 ? y : b); col.set([c.r, c.g, c.b], i * 3) }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g
  }, [NI, NO])
  const dust = useMemo(() => {
    const n = mobile ? 90 : 220, a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 24; a[i * 3 + 1] = (Math.random() - 0.5) * 12; a[i * 3 + 2] = -1 - Math.random() * 9 }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g
  }, [mobile])
  useEffect(() => () => { dtex.dispose(); ptex.forEach((t) => t.dispose()); pts.dispose(); dust.dispose(); lines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose() }) }, [dtex, ptex, pts, dust, lines])
  useEffect(() => { gl.domElement.style.cursor = '' }, [gl])

  useFrame((s, dt) => {
    const t = reduced ? 8.2 : s.clock.elapsedTime
    const cy = t % CYCLE, ph = cy < 3.5 ? 0 : cy < 7 ? 1 : 2
    if (ph !== phase.current) { phase.current = ph; onPhase(ph) }
    const proc = ph === 1 ? 1 : ph === 0 ? clamp01(cy - 2.5) : clamp01(1 - (cy - 7) / 1.2)         // processing intensity
    const emerge = ph === 2 ? ease(clamp01((cy - 7) / 1.4)) : ph === 0 ? 0.28 : 0.28 + 0.15 * ease(clamp01((cy - 5.5) / 1.5))
    const k = ease(clamp01(t / 1.4))

    // layered core: counter-rotating shells that tighten and spin up while processing
    const sp = 0.25 + proc * 1.1
    g1.current.rotation.x += dt * sp * 0.6; g1.current.rotation.y += dt * sp
    g2.current.rotation.x -= dt * sp * 0.9; g2.current.rotation.z += dt * sp * 0.7
    g3.current.rotation.y -= dt * sp * 1.3; g3.current.rotation.z -= dt * sp * 0.4
    r1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.2; r1.current.rotation.z += dt * (0.4 + proc)
    r2.current.rotation.y += dt * (0.5 + proc * 1.2); r2.current.rotation.x = 0.9
    r3.current.rotation.z -= dt * (0.6 + proc); r3.current.rotation.x = -0.6
    const sc = (0.9 + proc * 0.18 + Math.sin(t * 2.2) * 0.02 * proc) * (0.4 + 0.6 * k)
    coreG.current.scale.setScalar(sc * (mobile ? 0.9 : 1)); coreG.current.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.08
    ;(heart.current.material as THREE.MeshBasicMaterial).opacity = 0.7 + proc * 0.3
    halo.current.scale.setScalar(5.2 + proc * 2.2); (halo.current.material as THREE.SpriteMaterial).opacity = 0.28 + proc * 0.35

    // streams
    const pp = pts.attributes.position.array as Float32Array
    const tmp = V(0, 0, 0)
    for (let i = 0; i < 3; i++) for (let q = 0; q < NI; q++) {
      const u = (q / NI + t * (0.1 + (ph === 0 ? 0.08 : 0.02)) + i * 0.13) % 1
      IN[i].getPoint(u, tmp); tmp.toArray(pp, (i * NI + q) * 3)
    }
    const o0 = 3 * NI * 3
    for (let i = 0; i < 3; i++) for (let q = 0; q < NO; q++) {
      const u = (q / NO + t * (0.07 + emerge * 0.13) + i * 0.21) % 1
      OUTC[i].getPoint(u, tmp); tmp.toArray(pp, o0 + (i * NO + q) * 3)
    }
    pts.attributes.position.needsUpdate = true
    ;(lines[0].material as THREE.LineBasicMaterial).opacity = 0.22 + (ph === 0 ? 0.25 : 0)
    lines.forEach((l, i) => { (l.material as THREE.LineBasicMaterial).opacity = (i < 3 ? 0.22 + (ph === 0 ? 0.25 : 0) : 0.1 + emerge * 0.35) * k })

    // document fragments fly into the core, shrinking and tumbling
    for (let i = 0; i < ND; i++) {
      const d = docs.current[i]; if (!d) continue
      const lane = i % 3, u = (i / ND + t * 0.075) % 1
      IN[lane].getPoint(u, d.position)
      const e = Math.pow(u, 2.6)
      d.scale.setScalar(Math.max(0.02, (1 - e * 0.95) * 0.62 * k))
      d.rotation.set(u * 2.2 + i, u * 5.5, Math.sin(t + i) * 0.4)
      ;(d.material as THREE.MeshBasicMaterial).opacity = (1 - e) * 0.95 * Math.min(1, u * 8)
    }
    // holographic result panels resolve out of the core
    PANELS.forEach((pn, i) => {
      const g = panels.current[i]; if (!g) return
      const e = ease(clamp01(emerge * 1.15 - i * 0.12)) * k
      g.visible = e > 0.01
      g.scale.setScalar((0.25 + 0.75 * e) * (mobile ? 0.9 : 1))
      g.position.set(pn.p.x, pn.p.y + (reduced ? 0 : Math.sin(t * 0.8 + i * 1.7) * 0.14), pn.p.z)
      g.rotation.y = pn.ry + (reduced ? 0 : Math.sin(t * 0.4 + i) * 0.05)
      const m = (g.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial; m.opacity = 0.25 + e * 0.75
      const glow = g.children[1] as THREE.Sprite; (glow.material as THREE.SpriteMaterial).opacity = 0.35 * e
    })

    // camera: wide shot that drifts with scroll and pointer; framed by viewport aspect so nothing is cropped
    const asp = size.width / Math.max(1, size.height), fov = (camera as THREE.PerspectiveCamera).fov
    const dist = Math.max(12, 7.7 / (Math.tan((fov * Math.PI) / 360) * Math.min(asp, 1.7)))
    const pr = progressRef.current - 0.5
    const tx = (reduced ? 0 : s.pointer.x * 0.9) + pr * 1.8, ty = 0.7 + (reduced ? 0 : s.pointer.y * 0.4) - pr * 0.8
    camera.position.x += (tx - camera.position.x) * 0.05
    camera.position.y += (ty - camera.position.y) * 0.05
    camera.position.z += (dist * (1 - pr * 0.1) - camera.position.z) * 0.05
    look.current.x += (0.4 - look.current.x) * 0.05; look.current.y += (-0.15 - look.current.y) * 0.05
    camera.lookAt(look.current)
  })

  const shell = (c: string, o: number) => <meshBasicMaterial color={c} wireframe transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} />
  return (
    <>
      <Env />
      <ambientLight intensity={0.5} />
      <pointLight position={[-6, 3, 4]} intensity={26} color={DATA} />
      <pointLight position={[6, 1, 4]} intensity={26} color={OUT} />
      <pointLight position={[0, 4, 5]} intensity={30} color={CORE} />
      <points geometry={dust} frustumCulled={false}><pointsMaterial map={spr} size={0.1} color="#8ab8ff" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      <gridHelper args={[22, 22, '#3b3fc0', '#1c1f6e']} position={[0, -4.4, -1]}><lineBasicMaterial attach="material" transparent opacity={0.1} depthWrite={false} /></gridHelper>

      <group ref={coreG}>
        <mesh ref={g1}><icosahedronGeometry args={[1.55, 1]} />{shell('#a5b4fc', 0.55)}</mesh>
        <mesh ref={g2}><octahedronGeometry args={[1.12, 0]} />{shell('#38bdf8', 0.7)}</mesh>
        <mesh ref={g3}><dodecahedronGeometry args={[0.72, 0]} /><meshPhysicalMaterial color="#6d5cff" metalness={0.5} roughness={0.15} clearcoat={1} emissive="#4f46e5" emissiveIntensity={0.9} /></mesh>
        <mesh ref={heart}><sphereGeometry args={[0.38, 24, 24]} /><meshBasicMaterial color="#ede9fe" transparent opacity={0.9} /></mesh>
        <mesh ref={r1}><torusGeometry args={[2.05, 0.022, 8, 96]} /><meshBasicMaterial color="#c4b5fd" transparent opacity={0.85} blending={THREE.AdditiveBlending} /></mesh>
        <mesh ref={r2}><torusGeometry args={[2.4, 0.018, 8, 96]} /><meshBasicMaterial color={DATA} transparent opacity={0.75} blending={THREE.AdditiveBlending} /></mesh>
        <mesh ref={r3}><torusGeometry args={[2.75, 0.016, 8, 96]} /><meshBasicMaterial color={OUT} transparent opacity={0.6} blending={THREE.AdditiveBlending} /></mesh>
      </group>
      <sprite ref={halo}><spriteMaterial map={spr} color={CORE} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>

      {lines.map((l, i) => <primitive key={i} object={l} />)}
      <points geometry={pts} frustumCulled={false}><pointsMaterial map={spr} size={mobile ? 0.34 : 0.3} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      {Array.from({ length: ND }, (_, i) => (
        <mesh key={i} ref={(o) => { if (o) docs.current[i] = o }}><planeGeometry args={[0.95, 1.26]} /><meshBasicMaterial map={dtex} transparent side={THREE.DoubleSide} depthWrite={false} /></mesh>
      ))}
      {PANELS.map((pn, i) => (
        <group key={i} ref={(o) => { if (o) panels.current[i] = o }}>
          <mesh><planeGeometry args={[pn.size[0], pn.size[1]]} /><meshBasicMaterial map={ptex[i]} transparent depthWrite={false} /></mesh>
          <sprite scale={[pn.size[0] * 1.9, pn.size[1] * 1.9, 1]}><spriteMaterial map={spr} color={i === 1 ? CORE : OUT} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        </group>
      ))}
    </>
  )
}

export default function EngineScene({ active, ...p }: EngineProps) {
  return (
    <Canvas dpr={[1, p.mobile ? 1.5 : 1.75]} camera={{ position: [0, 0.7, 18], fov: 38 }} gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }} frameloop={active ? (p.reduced ? 'demand' : 'always') : 'never'} aria-hidden>
      <Engine {...p} />
    </Canvas>
  )
}
