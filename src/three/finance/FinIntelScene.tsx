import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Env, sprite } from '../parts'
import { canvasTexture, ease, rr } from './tex'

/**
 * Visual A: Financial Intelligence.
 * A performance landscape (instanced columns that morph per metric) surrounded by floating report panels.

 */
export type Metric = 'revenue' | 'expenses' | 'cashflow' | 'balance'
export const METRICS: Metric[] = ['revenue', 'expenses', 'cashflow', 'balance']
const COLS = 12
const ROWS = 7
const HUE: Record<Metric, string> = { revenue: '#38bdf8', expenses: '#a78bfa', cashflow: '#2dd4bf', balance: '#60a5fa' }

function target(m: Metric, i: number, j: number, t: number) {
  const x = i / (COLS - 1), z = j / (ROWS - 1)
  switch (m) {
    case 'revenue': return 0.25 + x * 1.5 + Math.sin(z * 3 + t * 0.9) * 0.18 * (0.4 + x)
    case 'expenses': return 0.5 + Math.abs(Math.sin(x * 5 + z * 1.5)) * 0.9 + Math.sin(t * 0.8 + x * 6) * 0.08
    case 'cashflow': return 0.9 + Math.sin(x * 7 + t * 0.9) * 0.55 * (0.6 + z * 0.6)
    default: return 0.4 + (i % 4 < 2 ? 0.95 : 0.55) + Math.sin(z * 2.5 + t) * 0.1 + (j > 3 ? 0.3 : 0)
  }
}

const bars = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number[], b: number[]) => {
  const n = a.length, step = w / n
  a.forEach((v, i) => {
    g.fillStyle = '#38bdf8'; g.fillRect(x + i * step + 4, y + h - v * h, step * 0.36, v * h)
    g.fillStyle = '#a78bfa'; g.fillRect(x + i * step + 4 + step * 0.4, y + h - b[i] * h, step * 0.36, b[i] * h)
  })
}
function panel(kind: 'rev' | 'cash' | 'bal') {
  return canvasTexture(512, 300, (g, w, h) => {
    g.fillStyle = 'rgba(9,22,64,.88)'; rr(g, 4, 4, w - 8, h - 8, 22); g.fill()
    g.strokeStyle = 'rgba(130,185,255,.7)'; g.lineWidth = 3; g.stroke()
    g.fillStyle = '#cfe1ff'; g.font = '600 22px Inter, sans-serif'
    g.fillText(kind === 'rev' ? 'Revenue vs expenses' : kind === 'cash' ? 'Cash flow' : 'Balance sheet', 30, 52)
    g.fillStyle = 'rgba(160,190,255,.55)'; g.font = '16px Inter, sans-serif'; 
    g.strokeStyle = 'rgba(140,180,255,.18)'; g.lineWidth = 1
    for (let r = 0; r < 4; r++) { g.beginPath(); g.moveTo(30, 90 + r * 46); g.lineTo(w - 30, 90 + r * 46); g.stroke() }
    if (kind === 'rev') bars(g, 30, 80, w - 60, 170, [0.4, 0.5, 0.45, 0.65, 0.6, 0.8, 0.95], [0.3, 0.32, 0.4, 0.38, 0.5, 0.52, 0.58])
    if (kind === 'cash') {
      const pts = [0.5, 0.42, 0.6, 0.55, 0.78, 0.7, 0.92]
      g.beginPath(); pts.forEach((v, i) => { const x = 30 + (i / 6) * (w - 60), y = 250 - v * 160; i ? g.lineTo(x, y) : g.moveTo(x, y) })
      g.strokeStyle = '#2dd4bf'; g.lineWidth = 5; g.stroke()
      g.lineTo(w - 30, 250); g.lineTo(30, 250); g.closePath(); g.fillStyle = 'rgba(45,212,191,.16)'; g.fill()
    }
    if (kind === 'bal') {
      const col = (x: number, parts: [number, string][]) => { let y = 250; parts.forEach(([v, c]) => { const hh = v * 160; g.fillStyle = c; g.fillRect(x, y - hh, 90, hh - 3); y -= hh }) }
      col(90, [[0.55, '#2563eb'], [0.4, '#38bdf8']]); col(250, [[0.3, '#a78bfa'], [0.45, '#6366f1'], [0.2, '#60a5fa']])
      g.fillStyle = '#cfe1ff'; g.font = '16px Inter, sans-serif'; g.fillText('Assets', 105, 280); g.fillText('Liabilities + equity', 215, 280)
    }
  })
}

interface Props { metricRef: MutableRefObject<Metric>; reduced: boolean; mobile: boolean; active: boolean }

function Stage({ metricRef, reduced, mobile }: Omit<Props, 'active'>) {
  const inst = useRef<THREE.InstancedMesh>(null!)
  const panels = useRef<THREE.Mesh[]>([])
  const heights = useRef(new Float32Array(COLS * ROWS).fill(0.1))
  const intro = useRef(reduced ? 1 : 0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const hue = useRef(new THREE.Color(HUE.revenue))
  const { camera } = useThree()
  const texs = useMemo(() => [panel('rev'), panel('cash'), panel('bal')], [])
  const spr = useMemo(() => sprite(), [])
  const anchors = useMemo(() => [new THREE.Vector3(-2.6, 1.7, -1.6), new THREE.Vector3(2.9, 1.9, -1.2), new THREE.Vector3(0.3, 2.9, 0.4)], [])
  const links = useMemo(() => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 2 * 3), 3)); return g
  }, [])
  const NP = mobile ? 3 : 6
  const partGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * NP * 3), 3)); return g }, [NP])
  useEffect(() => () => { texs.forEach((t) => t.dispose()); links.dispose(); partGeo.dispose() }, [texs, links, partGeo])
  const home = useMemo(() => new THREE.Vector3(0, 0.2, 0), [])

  useFrame((s, dt) => {
    const t = reduced ? 1.5 : s.clock.elapsedTime
    if (!reduced) intro.current = Math.min(1, intro.current + dt / 2)
    const I = ease(intro.current)
    const m = metricRef.current
    hue.current.lerp(new THREE.Color(HUE[m]), 0.08)
    const H = heights.current
    let k = 0
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++, k++) {
      H[k] += (target(m, i, j, t) - H[k]) * 0.07
      const h = Math.max(0.02, H[k] * I)
      dummy.position.set((i - (COLS - 1) / 2) * 0.34, h / 2 - 0.9, (j - (ROWS - 1) / 2) * 0.34 + 0.5)
      dummy.scale.set(0.25, h, 0.25)
      dummy.updateMatrix()
      inst.current.setMatrixAt(k, dummy.matrix)
      col.copy(hue.current).multiplyScalar(0.45 + Math.min(1, H[k] / 2) * 0.75)
      inst.current.setColorAt(k, col)
    }
    inst.current.instanceMatrix.needsUpdate = true
    if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true

    const focus = m === 'cashflow' ? 1 : m === 'balance' ? 2 : 0
    panels.current.forEach((p, i) => {
      if (!p) return
      const a = anchors[i]
      p.position.set(a.x, a.y + (reduced ? 0 : Math.sin(t * 0.6 + i * 2) * 0.08), a.z)
      const sc = (i === focus ? 1.08 : 0.92) * ease(I * 1.2)
      p.scale.setScalar(p.scale.x + (sc - p.scale.x) * 0.1)
      ;(p.material as THREE.MeshBasicMaterial).opacity += ((i === focus ? 1 : 0.55) - (p.material as THREE.MeshBasicMaterial).opacity) * 0.1
      p.lookAt(camera.position.x * 0.5, p.position.y, camera.position.z)
    })
    // links from panels down to the landscape + particles
    const la = links.attributes.position.array as Float32Array
    const pp = partGeo.attributes.position.array as Float32Array
    anchors.forEach((a, i) => {
      const bx = (i - 1) * 1.6, bz = 0.5
      la.set([a.x, a.y - 0.5, a.z, bx, 0.6, bz], i * 6)
      for (let q = 0; q < NP; q++) {
        const u = ((q / NP) + t * 0.18 + i * 0.3) % 1
        pp.set([a.x + (bx - a.x) * u, a.y - 0.5 + (0.6 - a.y + 0.5) * u, a.z + (bz - a.z) * u], (i * NP + q) * 3)
      }
    })
    links.attributes.position.needsUpdate = true
    partGeo.attributes.position.needsUpdate = true

    camera.position.x += ((reduced ? 0 : s.pointer.x * 1.2) - camera.position.x) * 0.04
    camera.position.y += ((reduced ? 0 : s.pointer.y * 0.5) + 2.2 - camera.position.y) * 0.04
    camera.position.z += ((mobile ? 11.5 : 9) - camera.position.z) * 0.06
    camera.lookAt(0, 0.7, 0)
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 7, 5]} intensity={1.4} color="#d6e6ff" />
      <pointLight position={[-4, 2, 3]} intensity={25} color="#2f7bff" />
      <instancedMesh ref={inst} args={[undefined, undefined, COLS * ROWS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial metalness={0.5} roughness={0.25} clearcoat={0.8} />
      </instancedMesh>
      {texs.map((tx, i) => (
        <mesh key={i} ref={(m) => { if (m) panels.current[i] = m }}>
          <planeGeometry args={[2.6, 1.52]} />
          <meshBasicMaterial map={tx} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      ))}
      <lineSegments geometry={links}><lineBasicMaterial color="#7cb8ff" transparent opacity={0.3} /></lineSegments>
      <points geometry={partGeo} frustumCulled={false}><pointsMaterial map={spr} size={0.18} color="#bfe8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      <mesh position={home} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.001, 0.001]} /><meshBasicMaterial visible={false} /></mesh>
    </>
  )
}

export default function FinIntelScene({ active, ...p }: Props) {
  return (
    <Canvas dpr={[1, p.mobile ? 1.5 : 1.75]} camera={{ position: [0, 2.2, 9], fov: 38 }} gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'} aria-hidden>
      <Stage {...p} />
    </Canvas>
  )
}
