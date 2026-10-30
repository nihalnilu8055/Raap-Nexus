import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Env, sprite } from '../parts'
import { canvasTexture, rr } from './tex'

/**
 * Visual B: Audit & Verification.
 * Source documents -> ledger -> bank lanes. An audit pass sweeps the rows and reveals each record's state.
 * States are illustrative demonstration data, not live application results.
 */
export type AuditState = 'verified' | 'reconciled' | 'review' | 'attention'
export const STATES: AuditState[] = ['verified', 'reconciled', 'review', 'attention']
export const STATE_COLOR: Record<AuditState, string> = { verified: '#34d399', reconciled: '#60a5fa', review: '#fbbf24', attention: '#f87171' }
const ROW_STATE: AuditState[] = ['verified', 'reconciled', 'verified', 'review', 'reconciled', 'attention']
const LX = [-3.3, 0, 3.3]
const RY = (r: number) => 1.95 - r * 0.78

function laneTex(title: string) {
  return canvasTexture(384, 120, (g, w, h) => {
    g.fillStyle = 'rgba(10,26,70,.9)'; rr(g, 3, 3, w - 6, h - 6, 16); g.fill()
    g.strokeStyle = 'rgba(130,185,255,.6)'; g.lineWidth = 3; g.stroke()
    g.fillStyle = '#cfe1ff'; g.font = '700 24px Inter, sans-serif'; g.fillText(title, 24, 46)
    g.fillStyle = 'rgba(160,195,255,.4)'; g.fillRect(24, 66, 190, 8); g.fillRect(24, 86, 120, 8)
    g.fillStyle = 'rgba(160,195,255,.55)'; g.fillRect(w - 110, 66, 80, 8)
  })
}

interface Props { filterRef: MutableRefObject<AuditState | null>; reduced: boolean; mobile: boolean; active: boolean }

function Stage({ filterRef, reduced, mobile }: Omit<Props, 'active'>) {
  const { camera } = useThree()
  const sweep = useRef<THREE.Mesh>(null!)
  const slabs = useRef<THREE.Mesh[][]>([[], [], []])
  const dots = useRef<THREE.Mesh[]>([])
  const revealed = useRef<number[]>(ROW_STATE.map(() => (reduced ? 1 : 0)))
  const texs = useMemo(() => [laneTex('SOURCE DOCUMENT'), laneTex('LEDGER ENTRY'), laneTex('BANK RECORD')], [])
  const spr = useMemo(() => sprite(), [])
  const curves = useMemo(() => ROW_STATE.map((st, r) => {
    const y = RY(r)
    const end = st === 'attention' ? 0.55 : 1
    const pts = [new THREE.Vector3(LX[0] + 1.15, y, 0), new THREE.Vector3((LX[0] + LX[1]) / 2, y + 0.18, 0.5), new THREE.Vector3(LX[1] - 1.15, y, 0)]
    const pts2 = [new THREE.Vector3(LX[1] + 1.15, y, 0), new THREE.Vector3((LX[1] + LX[2]) / 2, y - 0.18, 0.5), new THREE.Vector3(LX[2] - 1.15, y, 0)]
    return { a: new THREE.CatmullRomCurve3(pts), b: new THREE.CatmullRomCurve3(pts2), end }
  }), [])
  const lineObjs = useMemo(() => curves.flatMap((c, r) => {
    const st = ROW_STATE[r]
    const mk = (cv: THREE.CatmullRomCurve3, frac: number) => {
      const g = new THREE.BufferGeometry().setFromPoints(cv.getPoints(40).slice(0, Math.max(2, Math.floor(41 * frac))))
      const m = st === 'review' ? new THREE.LineDashedMaterial({ color: STATE_COLOR[st], dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.2 }) : new THREE.LineBasicMaterial({ color: STATE_COLOR[st], transparent: true, opacity: 0.2 })
      const l = new THREE.Line(g, m); if (st === 'review') l.computeLineDistances(); return l
    }
    return [mk(c.a, 1), mk(c.b, c.end)]
  }), [curves])
  const NP = mobile ? 1 : 2
  const partGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ROW_STATE.length * NP * 3), 3)); return g }, [NP])
  useEffect(() => () => { texs.forEach((t) => t.dispose()); lineObjs.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose() }); partGeo.dispose() }, [texs, lineObjs, partGeo])

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const flt = filterRef.current
    const cycle = reduced ? 0 : (t % 9) / 9 // 0..1
    const sy = 2.6 - cycle * 5.6
    sweep.current.position.y = sy
    ;(sweep.current.material as THREE.MeshBasicMaterial).opacity = reduced ? 0 : 0.5 * (1 - Math.abs(cycle - 0.5) * 0.6) * (cycle < 0.92 ? 1 : (1 - cycle) * 12)
    const pp = partGeo.attributes.position.array as Float32Array
    ROW_STATE.forEach((st, r) => {
      const y = RY(r)
      const rv = reduced ? 1 : cycle > 0.94 ? Math.max(0, revealed.current[r] - 0.06) : y > sy ? revealed.current[r] : Math.min(1, revealed.current[r] + 0.08)
      revealed.current[r] = rv
      const dim = flt && flt !== st ? 0.25 : 1
      for (let lane = 0; lane < 3; lane++) {
        const m = slabs.current[lane][r]; if (!m) continue
        const mat = m.material as THREE.MeshBasicMaterial
        const missing = lane === 2 && st === 'attention'
        mat.opacity += ((missing ? 0.18 : 1) * (dim < 1 ? 0.3 : 1) * (0.55 + 0.45 * rv) - mat.opacity) * 0.15
        m.scale.setScalar(1 + (flt === st ? 0.04 : 0))
      }
      const d = dots.current[r]
      if (d) {
        const c = new THREE.Color('#64748b').lerp(new THREE.Color(STATE_COLOR[st]), rv)
        ;(d.material as THREE.MeshBasicMaterial).color.copy(c)
        ;(d.material as THREE.MeshBasicMaterial).opacity = dim
        d.scale.setScalar(0.8 + rv * 0.4 + (st !== 'verified' && !reduced ? Math.sin(t * 3 + r) * 0.1 * rv : 0))
      }
      const lm = [lineObjs[r * 2].material, lineObjs[r * 2 + 1].material] as THREE.LineBasicMaterial[]
      lm.forEach((mm) => { mm.opacity += ((0.15 + 0.75 * rv) * dim - mm.opacity) * 0.15 })
      // particles flow on matched paths
      for (let q = 0; q < NP; q++) {
        const u = ((q / NP) + t * 0.2 + r * 0.17) % 1
        const flow = rv > 0.6 && st !== 'attention' ? 1 : 0
        const cv = u < 0.5 ? curves[r].a.getPoint(u * 2) : curves[r].b.getPoint((u - 0.5) * 2)
        pp.set([cv.x, flow ? cv.y : 99, cv.z], (r * NP + q) * 3)
      }
    })
    partGeo.attributes.position.needsUpdate = true
    camera.position.x += ((reduced ? 0 : s.pointer.x * 1.0) - camera.position.x) * 0.04
    camera.position.y += ((reduced ? 0 : s.pointer.y * 0.5) + 0.3 - camera.position.y) * 0.04
    camera.position.z += ((mobile ? 12.5 : 10.2) - camera.position.z) * 0.06
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 5]} intensity={20} color="#7cc0ff" />
      <group rotation={[0, -0.22, 0]}>
        {[0, 1, 2].map((lane) => ROW_STATE.map((_, r) => (
          <mesh key={`${lane}${r}`} ref={(m) => { if (m) slabs.current[lane][r] = m }} position={[LX[lane], RY(r), 0]}>
            <planeGeometry args={[2.3, 0.72]} />
            <meshBasicMaterial map={texs[lane]} transparent opacity={0.6} toneMapped={false} depthWrite={false} />
          </mesh>
        )))}
        {ROW_STATE.map((_, r) => (
          <mesh key={`d${r}`} ref={(m) => { if (m) dots.current[r] = m }} position={[LX[1] + 1.0, RY(r) + 0.24, 0.05]}>
            <circleGeometry args={[0.1, 20]} />
            <meshBasicMaterial color="#64748b" transparent />
          </mesh>
        ))}
        {lineObjs.map((l, i) => <primitive key={i} object={l} />)}
        <points geometry={partGeo} frustumCulled={false}><pointsMaterial map={spr} size={0.2} color="#d9f3ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
        <mesh ref={sweep} position={[0, 2.6, 0.2]}>
          <planeGeometry args={[10.5, 0.1]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </>
  )
}

export default function AuditScene({ active, ...p }: Props) {
  return (
    <Canvas dpr={[1, p.mobile ? 1.5 : 1.75]} camera={{ position: [0, 0.3, 10.2], fov: 38 }} gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'} aria-hidden>
      <Stage {...p} />
    </Canvas>
  )
}
