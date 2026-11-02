import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/motion'
import { canvasTexture, clamp01, ease, rr } from './finance/tex'

/**
 * Real-3D depth stage that sits BEHIND the layered hero artwork: translucent report panels (no text),
 * a faint data network with travelling pulses, and a reflective floor grid. The camera dollies/orbits with hero scroll
 * progress (scrollState.hero) and eases toward the pointer. Rendered only where it pays off (desktop/tablet, motion allowed).
 */
type Kind = 'bars' | 'line' | 'ring'

function tex(kind: Kind) {
  return canvasTexture(512, 320, (g, w, h) => {
    g.fillStyle = 'rgba(12,28,78,.78)'; rr(g, 4, 4, w - 8, h - 8, 26); g.fill()
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(150,200,255,.75)'); gr.addColorStop(1, 'rgba(90,120,255,.25)')
    g.strokeStyle = gr; g.lineWidth = 3; g.stroke()
    g.fillStyle = 'rgba(190,215,255,.35)'; rr(g, 34, 34, 120, 14, 7); g.fill()
    g.strokeStyle = 'rgba(140,180,255,.14)'; g.lineWidth = 1
    for (let r = 0; r < 4; r++) { g.beginPath(); g.moveTo(34, 100 + r * 46); g.lineTo(w - 34, 100 + r * 46); g.stroke() }
    if (kind === 'bars') {
      [0.35, 0.5, 0.42, 0.66, 0.6, 0.82, 0.95].forEach((v, i) => {
        const x = 40 + i * 62, bh = v * 170
        const f = g.createLinearGradient(0, 270 - bh, 0, 270); f.addColorStop(0, '#60a5fa'); f.addColorStop(1, '#2563eb')
        g.fillStyle = f; rr(g, x, 270 - bh, 36, bh, 8); g.fill()
      })
    } else if (kind === 'line') {
      const pts = [0.45, 0.4, 0.58, 0.52, 0.72, 0.66, 0.9]
      g.beginPath(); pts.forEach((v, i) => { const x = 40 + (i / 6) * (w - 80), y = 270 - v * 170; i ? g.lineTo(x, y) : g.moveTo(x, y) })
      g.strokeStyle = '#38bdf8'; g.lineWidth = 6; g.lineJoin = 'round'; g.stroke()
      g.lineTo(w - 40, 270); g.lineTo(40, 270); g.closePath(); g.fillStyle = 'rgba(56,189,248,.16)'; g.fill()
    } else {
      g.lineWidth = 26; g.lineCap = 'round'
      g.strokeStyle = 'rgba(120,150,255,.2)'; g.beginPath(); g.arc(w / 2, 190, 74, 0, Math.PI * 2); g.stroke()
      g.strokeStyle = '#38bdf8'; g.beginPath(); g.arc(w / 2, 190, 74, -Math.PI / 2, Math.PI * 0.9); g.stroke()
      g.strokeStyle = '#818cf8'; g.beginPath(); g.arc(w / 2, 190, 74, Math.PI * 1, Math.PI * 1.3); g.stroke()
    }
  })
}

const PANELS: { k: Kind; p: [number, number, number]; r: [number, number, number]; s: number; dz: number; dy: number; ph: number }[] = [
  { k: 'bars', p: [-1.9, 1.5, -2.4], r: [0.05, 0.42, 0.05], s: 0.95, dz: 1.9, dy: 0.5, ph: 0 },
  { k: 'line', p: [2.05, 1.35, -2.6], r: [0.04, -0.4, -0.04], s: 0.9, dz: 2.6, dy: 0.9, ph: 1.7 },
  { k: 'ring', p: [2.0, -1.7, -2.0], r: [-0.04, -0.36, 0.05], s: 0.8, dz: 1.5, dy: -0.4, ph: 3.1 },
]

function Panels({ lite }: { lite: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  const t0 = useRef(-1)
  const maps = useMemo(() => PANELS.map((x) => tex(x.k)), [])
  const list = lite ? PANELS.slice(0, 2) : PANELS
  useFrame(({ clock }) => {
    const t = clock.elapsedTime; if (t0.current < 0) t0.current = t
    const h = scrollState.hero
    list.forEach((d, i) => {
      const g = refs.current[i]; if (!g) return
      const e = ease(clamp01((t - t0.current - 0.35 - i * 0.22) / 1.5))
      g.position.set(d.p[0] * (0.7 + 0.3 * e), d.p[1] + Math.sin(t * 0.6 + d.ph) * 0.07 + d.dy * h * 1.2 - (1 - e) * 0.8, d.p[2] - (1 - e) * 3.2 + h * d.dz)
      g.rotation.set(d.r[0] + Math.sin(t * 0.5 + d.ph) * 0.03, d.r[1] - h * 0.5 * Math.sign(d.p[0]) + (1 - e) * 0.8 * Math.sign(d.p[0]), d.r[2])
      g.scale.setScalar(d.s * (0.85 + 0.15 * e))
      const m = (g.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial
      m.opacity = e * 0.8 * (1 - clamp01((h - 0.55) / 0.4))
    })
  })
  return <>{list.map((d, i) => (
    <group key={d.k} ref={(el) => { refs.current[i] = el }}>
      <mesh><planeGeometry args={[1.6, 1]} /><meshBasicMaterial map={maps[i]} transparent opacity={0} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  ))}</>
}

function Network({ lite }: { lite: boolean }) {
  const N = lite ? 14 : 22
  const { geo, nodes, links } = useMemo(() => {
    const nodes: THREE.Vector3[] = []
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    for (let i = 0; i < N; i++) {
      const a = rnd() * Math.PI * 2, r = 1.7 + rnd() * 1.6
      nodes.push(new THREE.Vector3(Math.max(-0.6, Math.cos(a) * r * 1.2), Math.sin(a) * r * 0.85, -2 - rnd() * 3))
    }
    const links: [number, number][] = []
    nodes.forEach((n, i) => { let best = -1, bd = 9; nodes.forEach((m, j) => { if (j !== i) { const d = n.distanceTo(m); if (d < bd && d > 0.4) { bd = d; best = j } } }); if (best >= 0 && !links.some(([a, b]) => a === best && b === i)) links.push([i, best]) })
    const pos = new Float32Array(links.length * 6)
    links.forEach(([a, b], i) => { nodes[a].toArray(pos, i * 6); nodes[b].toArray(pos, i * 6 + 3) })
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo, nodes, links }
  }, [N])
  const group = useRef<THREE.Group>(null), pulses = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, h = scrollState.hero
    if (group.current) { group.current.rotation.y = Math.sin(t * 0.1) * 0.12 - h * 0.35; group.current.position.z = h * 1.4 }
    const m = pulses.current; if (!m || lite) return
    links.forEach(([a, b], i) => {
      const f = (t * 0.22 + i * 0.37) % 1
      dummy.position.lerpVectors(nodes[a], nodes[b], f); dummy.scale.setScalar(0.9 + Math.sin(f * Math.PI) * 0.6); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={group}>
      <lineSegments geometry={geo}><lineBasicMaterial color="#6aa8ff" transparent opacity={0.22} depthWrite={false} /></lineSegments>
      {nodes.map((n, i) => <mesh key={i} position={n}><sphereGeometry args={[0.018, 10, 10]} /><meshBasicMaterial color="#9cc6ff" transparent opacity={0.65} /></mesh>)}
      {!lite && <instancedMesh ref={pulses} args={[undefined, undefined, links.length]} frustumCulled={false}><sphereGeometry args={[0.022, 10, 10]} /><meshBasicMaterial color="#e6f1ff" transparent opacity={0.9} /></instancedMesh>}
    </group>
  )
}

function Floor() {
  const map = useMemo(() => canvasTexture(512, 512, (g, w, h) => {
    g.strokeStyle = 'rgba(130,175,255,.55)'; g.lineWidth = 1.5
    for (let i = 0; i <= 16; i++) { const p = (i / 16) * w; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, h); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(w, p); g.stroke() }
    const m = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)')
    g.globalCompositeOperation = 'destination-in'; g.fillStyle = m; g.fillRect(0, 0, w, h)
  }), [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => { if (ref.current) { const h = scrollState.hero; (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - clamp01((h - 0.4) / 0.4)); ref.current.position.y = -2.6 - h * 0.6 } })
  return <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, -2.6, -1.5]}><planeGeometry args={[11, 11]} /><meshBasicMaterial map={map} transparent opacity={0.3} depthWrite={false} toneMapped={false} /></mesh>
}

function Rig() {
  useFrame(({ camera }) => {
    const h = scrollState.hero
    const tx = h * 1.1 + scrollState.px * 0.35, ty = -h * 0.45 + scrollState.py * 0.2, tz = 9 - h * 1.3
    camera.position.x += (tx - camera.position.x) * 0.06; camera.position.y += (ty - camera.position.y) * 0.06; camera.position.z += (tz - camera.position.z) * 0.06
    camera.lookAt(h * 0.5, -h * 0.15, 0)
  })
  return null
}

export default function HeroDepthScene({ lite, active }: { lite: boolean; active: boolean }) {
  return (
    <Canvas dpr={[1, lite ? 1 : 1.5]} frameloop={active ? 'always' : 'never'} camera={{ fov: 35, position: [0, 0, 9] }} gl={{ alpha: true, antialias: !lite, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)} style={{ pointerEvents: 'none' }}>
      <Rig /><Floor /><Network lite={lite} /><Panels lite={lite} />
    </Canvas>
  )
}
