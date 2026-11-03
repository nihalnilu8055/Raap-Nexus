import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Env, sprite } from '../parts'
import { canvasTexture, rr } from './tex'

/**
 * Financial Intelligence Core: a glass-and-metal core joined to six nodes.
 * 'flow'    -> five stages arranged on an arch (Transactions → Financial Data → Analysis → Auditing → Insights); a beam from the core follows the active stage.
 * 'modules' -> six ERP modules on a ring; the selected module lights its connections.
 * Nodes glide between the two layouts. Illustrative visualisation only: no real data.
 */
export type FlowMode = 'flow' | 'modules'
interface Props {
  modeRef: MutableRefObject<FlowMode>; selRef: MutableRefObject<number>; progressRef: MutableRefObject<number>
  labels: { flow: string[]; modules: string[] }; onPick: (i: number) => void
  reduced: boolean; mobile: boolean; active: boolean
}

const HUES = ['#38bdf8', '#60a5fa', '#818cf8', '#22d3ee', '#a5b4fc', '#7dd3fc']
const MODULE_DEG = [90, 150, 330, 210, 270, 30] // Finance, Sales, Purchase, Inventory, HR, Reporting (adjacent: Sales–Inventory, Inventory–Purchase…)
const NODES = 6
type Edge = [number, number] // -1 = core
const FLOW_EDGES: Edge[] = [[0, 1], [1, 2], [2, 3], [3, 4]]
// peer links between modules (illustrative): Finance–Sales, Sales–Inventory, Purchase–Finance, Reporting–Finance
const MOD_PEERS: Edge[] = [[0, 1], [1, 3], [2, 0], [5, 0]]
const MAXE = 10

function layout(mode: FlowMode, i: number, mobile: boolean, out: THREE.Vector3): number {
  if (mode === 'flow') {
    if (i >= 5) { out.set(0, 0.2, 0); return 0 }
    const th = Math.PI * (0.86 - 0.72 * (i / 4)), rx = mobile ? 2.7 : 4.7, ry = mobile ? 2.2 : 2.1
    out.set(rx * Math.cos(th), 0.2 + ry * Math.sin(th) - (i === 2 ? 0 : 0.15), -0.3 * Math.sin(th))
    return 1
  }
  const a = (MODULE_DEG[i] * Math.PI) / 180, rx = mobile ? 2.7 : 4.1, ry = mobile ? 2.2 : 1.8
  out.set(rx * Math.cos(a), 0.2 + ry * Math.sin(a), -0.9 * Math.sin(a))
  return 1
}

function labelTex(text: string) {
  return canvasTexture(384, 96, (g, w, h) => {
    g.fillStyle = 'rgba(8,20,58,.86)'; rr(g, 4, 4, w - 8, h - 8, 44); g.fill()
    g.strokeStyle = 'rgba(140,190,255,.75)'; g.lineWidth = 3; g.stroke()
    g.fillStyle = '#e8f1ff'; g.font = '700 34px Manrope, Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(text, w / 2, h / 2 + 2, w - 48)
  })
}

function Stage({ modeRef, selRef, progressRef, labels, onPick, reduced, mobile }: Props) {
  const { gl, invalidate } = useThree()
  const spr = useMemo(() => sprite(), [])
  const core = useRef<THREE.Group>(null!), inner = useRef<THREE.Mesh>(null!), rings = useRef<THREE.Group>(null!)
  const nodeRefs = useRef<THREE.Group[]>([]), meshRefs = useRef<THREE.Mesh[]>([]), haloRefs = useRef<THREE.Sprite[]>([]), labelRefs = useRef<THREE.Sprite[]>([])
  const pos = useRef(Array.from({ length: NODES }, () => new THREE.Vector3())), tmp = useMemo(() => new THREE.Vector3(), [])
  const sc = useRef(new Float32Array(NODES).fill(0.01)), hover = useRef(-1)
  const bright = useRef(new Float32Array(MAXE).fill(0.15))
  const slots = useRef<{ key: string; list: number[] }>({ key: '', list: [] })
  const camP = useRef(new THREE.Vector3(0, 1.6, 11))

  const NP = mobile ? 90 : 230
  const links = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAXE * 6), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAXE * 6), 3))
    return g
  }, [])
  const parts = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NP * 3), 3))
    return g
  }, [NP])
  const flowTex = useMemo(() => labels.flow.map(labelTex), [labels.flow.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  const modTex = useMemo(() => labels.modules.map(labelTex), [labels.modules.join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { links.dispose(); parts.dispose() }, [links, parts])
  useEffect(() => () => { flowTex.forEach((t) => t.dispose()) }, [flowTex])
  useEffect(() => () => { modTex.forEach((t) => t.dispose()) }, [modTex])
  useEffect(() => () => { gl.domElement.style.cursor = '' }, [gl])

  const colA = useMemo(() => new THREE.Color(), []), colB = useMemo(() => new THREE.Color(), []), tint = useMemo(() => new THREE.Color('#2563eb'), [])
  // reduced motion renders on demand: repaint only when the selection / mode changes
  useEffect(() => {
    if (!reduced) return
    let last = ''
    const id = window.setInterval(() => { const k = modeRef.current + selRef.current; if (k !== last) { last = k; invalidate() } }, 120)
    return () => window.clearInterval(id)
  }, [reduced, invalidate, modeRef, selRef])

  useFrame((s, dt) => {
    const mode = modeRef.current, sel = selRef.current, t = reduced ? 0 : s.clock.elapsedTime
    const asp = s.size.width / Math.max(1, s.size.height), compact = mobile || asp < 1.35 // narrow canvases get a tighter layout, a farther camera and selected-only labels
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3.4)
    const P = progressRef.current
    // nodes glide between layouts
    for (let i = 0; i < NODES; i++) {
      const vis = layout(mode, i, compact, tmp)
      pos.current[i].lerp(tmp, k)
      const want = vis * (i === sel ? 1.3 : hover.current === i ? 1.18 : 1)
      sc.current[i] += (want - sc.current[i]) * k
      const g = nodeRefs.current[i]; if (!g) continue
      g.position.copy(pos.current[i]); g.position.y += reduced ? 0 : Math.sin(t * 1 + i * 1.3) * 0.06
      g.scale.setScalar(Math.max(0.001, sc.current[i])); g.visible = sc.current[i] > 0.02
      const isSel = i === sel, hue = HUES[i]
      const m = meshRefs.current[i].material as THREE.MeshPhysicalMaterial
      m.emissive.set(hue); m.emissiveIntensity += ((isSel ? 1.1 : hover.current === i ? 0.7 : 0.22) - m.emissiveIntensity) * k
      meshRefs.current[i].rotation.y = t * 0.6 + i; meshRefs.current[i].rotation.x = t * 0.3
      const hm = haloRefs.current[i].material as THREE.SpriteMaterial; hm.color.set(hue); hm.opacity += ((isSel ? 0.95 : 0.35) - hm.opacity) * k
      const ls = labelRefs.current[i]; ls.position.y += ((pos.current[i].y > 0.6 ? 0.72 : -0.72) - ls.position.y) * k
      const lm = ls.material as THREE.SpriteMaterial
      lm.opacity += ((compact ? (isSel ? 1 : 0) : isSel ? 1 : hover.current === i ? 0.95 : 0.62) - lm.opacity) * k
      const tx = (mode === 'flow' ? flowTex : modTex)[i]; if (tx && lm.map !== tx) { lm.map = tx; lm.needsUpdate = true }
    }
    // edges
    const edges: Edge[] = mode === 'flow' ? [...FLOW_EDGES, [-1, Math.min(sel, 4)]] : [...Array.from({ length: 6 }, (_, i): Edge => [-1, i]), ...MOD_PEERS]
    const target = (e: number): number => {
      const [a, b] = edges[e]
      if (mode === 'flow') return e === 4 ? 1 : e < sel ? 0.95 : e === sel ? 0.5 : 0.16
      return a === -1 ? (b === sel ? 1 : 0.2) : a === sel || b === sel ? 0.95 : 0.1
    }
    const lp = links.attributes.position as THREE.BufferAttribute, lc = links.attributes.color as THREE.BufferAttribute
    for (let e = 0; e < MAXE; e++) {
      if (e >= edges.length) { for (let v = 0; v < 2; v++) { lp.setXYZ(e * 2 + v, 0, 0, 0); lc.setXYZ(e * 2 + v, 0, 0, 0) } continue }
      bright.current[e] += (target(e) - bright.current[e]) * k
      const [a, b] = edges[e]
      const A = a < 0 ? tmp.set(0, 0.2, 0) : pos.current[a]; lp.setXYZ(e * 2, A.x, A.y, A.z)
      const B = pos.current[b]; lp.setXYZ(e * 2 + 1, B.x, B.y, B.z)
      colA.set(HUES[Math.max(a, 0)]).multiplyScalar(bright.current[e]); colB.set(HUES[b]).multiplyScalar(bright.current[e])
      lc.setXYZ(e * 2, colA.r, colA.g, colA.b); lc.setXYZ(e * 2 + 1, colB.r, colB.g, colB.b)
    }
    links.setDrawRange(0, edges.length * 2); lp.needsUpdate = true; lc.needsUpdate = true
    // particles travel along the edges; lit edges get more of them
    const key = mode + sel
    if (slots.current.key !== key) {
      const list: number[] = []
      edges.forEach((_, e) => { const n = target(e) > 0.45 ? 5 : 1; for (let q = 0; q < n; q++) list.push(e) })
      slots.current = { key, list }
    }
    const L = slots.current.list, pp = parts.attributes.position as THREE.BufferAttribute, pc = parts.attributes.color as THREE.BufferAttribute
    for (let j = 0; j < NP; j++) {
      const e = L[j % L.length], [a, b] = edges[e] ?? edges[0], br = bright.current[e] ?? 0.2
      const u = (j * 0.6180339 + t * (0.1 + br * 0.22)) % 1
      const A = a < 0 ? tmp.set(0, 0.2, 0) : pos.current[a], B = pos.current[b]
      const lift = Math.sin(Math.PI * u) * 0.16
      pp.setXYZ(j, A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u + lift, A.z + (B.z - A.z) * u)
      colA.set(HUES[b]).multiplyScalar(0.25 + br * 0.9); pc.setXYZ(j, colA.r, colA.g, colA.b)
    }
    pp.needsUpdate = true; pc.needsUpdate = true

    // core: tint follows the selection, slow rotation, layered rings
    tint.lerp(colB.set(HUES[sel % HUES.length]), k * 0.6)
    const im = inner.current.material as THREE.MeshPhysicalMaterial; im.emissive.copy(tint)
    core.current.rotation.y = t * 0.14 + (reduced ? 0 : s.pointer.x * 0.35); core.current.rotation.x = reduced ? 0 : -s.pointer.y * 0.18
    inner.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03)
    rings.current.rotation.y = t * 0.25; rings.current.rotation.z = Math.sin(t * 0.2) * 0.15

    // camera: pointer parallax + scroll orbit
    const a = reduced ? 0 : (P - 0.5) * 0.5 + s.pointer.x * 0.16, R = Math.max(compact ? 11 : 9.3, ((compact ? 2.7 : 4.7) + 1.4) / (0.344 * asp))
    camP.current.set(Math.sin(a) * R, 1.5 + (reduced ? 0 : s.pointer.y * 0.55 - (P - 0.5) * 0.7), Math.cos(a) * R)
    s.camera.position.lerp(camP.current, reduced ? 1 : 0.06); s.camera.lookAt(0, 0.6, 0)
  })

  const onOver = (i: number) => (e: { stopPropagation: () => void }) => { e.stopPropagation(); hover.current = i; gl.domElement.style.cursor = 'pointer'; invalidate() }
  const onOut = () => { hover.current = -1; gl.domElement.style.cursor = ''; invalidate() }
  return (
    <>
      <Env />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 6, 5]} intensity={1.3} color="#d6e6ff" />
      <pointLight position={[-5, 2, 3]} intensity={22} color="#2f7bff" />
      <pointLight position={[4, -2, 2]} intensity={10} color="#22d3ee" />
      <group ref={core} position={[0, 0.2, 0]}>
        <mesh ref={inner}><icosahedronGeometry args={[0.62, 1]} /><meshPhysicalMaterial color="#1d4ed8" metalness={0.65} roughness={0.18} emissive="#2563eb" emissiveIntensity={0.7} flatShading /></mesh>
        <mesh><icosahedronGeometry args={[1.02, 1]} /><meshPhysicalMaterial color="#9cc4ff" transparent opacity={0.22} roughness={0.05} metalness={0.1} clearcoat={1} envMapIntensity={1.4} depthWrite={false} flatShading /></mesh>
        <mesh><icosahedronGeometry args={[1.22, 1]} /><meshBasicMaterial color="#7cc0ff" wireframe transparent opacity={0.28} /></mesh>
        <group ref={rings}>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[Math.PI / 2 + (i - 1) * 0.42, 0, i * 0.7]}>
              <mesh><torusGeometry args={[1.55 + i * 0.28, 0.011, 8, mobile ? 72 : 120]} /><meshBasicMaterial color="#9fd0ff" transparent opacity={0.5 - i * 0.1} /></mesh>
              <mesh><circleGeometry args={[1.55 + i * 0.28, 48]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} /></mesh>
            </group>
          ))}
        </group>
        <sprite scale={[5, 5, 1]}><spriteMaterial map={spr} color="#2f6bff" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      </group>
      <lineSegments geometry={links} frustumCulled={false}><lineBasicMaterial vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>
      <points geometry={parts} frustumCulled={false}><pointsMaterial map={spr} size={mobile ? 0.2 : 0.17} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      {Array.from({ length: NODES }, (_, i) => (
        <group key={i} ref={(g) => { if (g) nodeRefs.current[i] = g }} onPointerOver={onOver(i)} onPointerOut={onOut} onClick={(e) => { e.stopPropagation(); onPick(i) }}>
          <mesh ref={(m) => { if (m) meshRefs.current[i] = m }}><octahedronGeometry args={[0.3, 0]} /><meshPhysicalMaterial color="#cfe3ff" metalness={0.35} roughness={0.14} clearcoat={1} emissive={HUES[i]} emissiveIntensity={0.25} /></mesh>
          <sprite ref={(m) => { if (m) haloRefs.current[i] = m }} scale={[1.5, 1.5, 1]}><spriteMaterial map={spr} color={HUES[i]} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
          <sprite ref={(m) => { if (m) labelRefs.current[i] = m }} position={[0, -0.72, 0]} scale={mobile ? [2.2, 0.55, 1] : [2.25, 0.56, 1]}><spriteMaterial transparent opacity={0} depthWrite={false} depthTest={false} toneMapped={false} /></sprite>
          <mesh><sphereGeometry args={[0.62, 12, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
        </group>
      ))}
    </>
  )
}

export default function FlowCoreScene({ active, ...p }: Props) {
  return (
    <Canvas dpr={[1, p.mobile ? 1.5 : 1.75]} camera={{ position: [0, 1.5, 9.3], fov: 38 }} gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={p.reduced ? 'demand' : active ? 'always' : 'never'} aria-hidden>
      <Stage {...p} active={active} />
    </Canvas>
  )
}
