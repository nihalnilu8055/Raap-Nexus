import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Env, sprite } from '../parts'
import { scrollState } from '../../lib/motion'
import { canvasTexture, ease } from './tex'

/** Hero: a stack of glass ledger layers, a chart that draws itself, rising bars and a transaction path. */
const LAYERS = 4
const REV = [0.15, 0.35, 0.28, 0.62, 0.52, 0.95, 1.3]
const EXP = [0.1, 0.18, 0.3, 0.27, 0.4, 0.43, 0.58]
const BARS = [0.35, 0.6, 0.5, 0.85, 0.75, 1.1, 1.45]

function ledgerTex() {
  return canvasTexture(512, 352, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.strokeStyle = 'rgba(140,190,255,.55)'
    g.lineWidth = 2
    for (let r = 0; r < 9; r++) {
      const y = 40 + r * 34
      g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke()
      g.fillStyle = 'rgba(170,210,255,.5)'
      g.fillRect(40, y - 18, 40 + ((r * 53) % 90), 6)
      g.fillStyle = r % 3 === 0 ? 'rgba(120,230,255,.8)' : 'rgba(170,210,255,.35)'
      g.fillRect(w - 140, y - 18, 90, 6)
    }
    g.beginPath(); g.moveTo(w - 160, 30); g.lineTo(w - 160, h - 20); g.stroke()
  })
}

function Stage({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const layerRefs = useRef<THREE.Group[]>([])
  const barRefs = useRef<THREE.Mesh[]>([])
  const dotRefs = useRef<THREE.Mesh[]>([])
  const intro = useRef(reduced ? 1 : 0)
  const { camera, size } = useThree()

  const tex = useMemo(() => ledgerTex(), [])
  const spr = useMemo(() => sprite(), [])
  const yTop = ((LAYERS - 1) - 1.5) * 0.62 + 0.05
  const curve = (vals: number[], z: number) => new THREE.CatmullRomCurve3(vals.map((v, k) => new THREE.Vector3(-1.5 + k * 0.5, yTop + 0.2 + v, z)))
  const revCurve = useMemo(() => curve(REV, -0.45), [])
  const expCurve = useMemo(() => curve(EXP, -0.45), [])
  const revGeo = useMemo(() => new THREE.TubeGeometry(revCurve, 140, 0.024, 6, false), [revCurve])
  const expGeo = useMemo(() => new THREE.TubeGeometry(expCurve, 140, 0.016, 6, false), [expCurve])
  const droplines = useMemo(() => {
    const a: number[] = []
    REV.forEach((v, k) => a.push(-1.5 + k * 0.5, yTop + 0.2 + v, -0.45, -1.5 + k * 0.5, yTop, -0.45))
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); return g
  }, [yTop])
  const edge = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(3.6, 0.09, 2.4)), [])
  const pathCurve = useMemo(() => {
    const ys = [0, 1, 2, 3].map((i) => (i - 1.5) * 0.62)
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.7, ys[3] + 0.3, 0.9), new THREE.Vector3(0.7, ys[2], -0.7), new THREE.Vector3(-1.3, ys[1], 0.8),
      new THREE.Vector3(0.9, ys[0], -0.5), new THREE.Vector3(-0.4, ys[0] - 0.55, 0.6),
    ])
  }, [])
  const pathLine = useMemo(() => new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(80)), [pathCurve])
  const pathObj = useMemo(() => new THREE.Line(pathLine, new THREE.LineBasicMaterial({ color: '#6db5ff', transparent: true, opacity: 0.5 })), [pathLine])
  const NP = mobile ? 10 : 22
  const partGeo = useMemo(() => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 3), 3)); return g
  }, [NP])
  useEffect(() => () => { revGeo.dispose(); expGeo.dispose(); droplines.dispose(); edge.dispose(); pathLine.dispose(); partGeo.dispose(); tex.dispose() }, [revGeo, expGeo, droplines, edge, pathLine, partGeo, tex])

  const revCount = (revGeo.index as THREE.BufferAttribute).count
  const expCount = (expGeo.index as THREE.BufferAttribute).count

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (!reduced) intro.current = Math.min(1, intro.current + dt / 3.2)
    const I = intro.current
    const spread = 0.62 + (1 - ease(I / 0.5)) * 1.1
    layerRefs.current.forEach((l, i) => { if (l) { l.position.y = (i - 1.5) * spread; l.rotation.y = i * 0.05 * (1 - ease(I / 0.6)); l.scale.setScalar(0.85 + 0.15 * ease(I / 0.4)) } })
    revGeo.setDrawRange(0, Math.floor((revCount * ease((I - 0.38) / 0.45)) / 3) * 3)
    expGeo.setDrawRange(0, Math.floor((expCount * ease((I - 0.45) / 0.45)) / 3) * 3)
    barRefs.current.forEach((b, k) => { if (b) { const h = Math.max(0.001, BARS[k] * ease((I - 0.5 - k * 0.03) / 0.35)); b.scale.y = h; b.position.y = yTop + h / 2 } })
    dotRefs.current.forEach((d, k) => { if (d) d.scale.setScalar(ease((I - 0.55 - k * 0.04) / 0.2) * (1 + (reduced ? 0 : Math.sin(t * 2 + k) * 0.12))) })
    const pp = partGeo.attributes.position.array as Float32Array
    const pv = ease((I - 0.7) / 0.3)
    for (let i = 0; i < NP; i++) {
      const u = ((i / NP) + t * 0.07 * (reduced ? 0 : 1)) % 1
      const p = pathCurve.getPoint(u)
      pp[i * 3] = p.x * pv; pp[i * 3 + 1] = p.y; pp[i * 3 + 2] = p.z * pv
    }
    partGeo.attributes.position.needsUpdate = true

    const aspect = size.width / size.height
    const wide = aspect > 1.05
    const p = scrollState.hero
    const gx = wide ? Math.min(3.4, aspect * 1.9) : 0
    const gy = wide ? 0.1 : 1.2
    group.current.position.set(gx, gy + p * 0.5, 0)
    group.current.scale.setScalar((wide ? 1 : 0.62) * (0.7 + 0.3 * ease(I * 1.5)))
    const px = reduced ? 0 : s.pointer.x, py = reduced ? 0 : s.pointer.y
    group.current.rotation.y = -0.6 + Math.sin(t * 0.25) * (reduced ? 0 : 0.1) + px * 0.18 + p * 0.9
    group.current.rotation.x = 0.28 + py * -0.06 + p * 0.25
    camera.position.z += ((wide ? 10 : 12.5) - p * 3.5 - camera.position.z) * 0.06
    camera.position.y += (1.4 - camera.position.y) * 0.05
    camera.lookAt(gx * 0.4, gy * 0.6, 0)
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 7, 5]} intensity={1.6} color="#d6e6ff" />
      <pointLight position={[-4, 1, 3]} intensity={28} color="#2f7bff" />
      <pointLight position={[2, 3, -2]} intensity={14} color="#5ec8ff" />
      <group ref={group}>
        {Array.from({ length: LAYERS }, (_, i) => (
          <group key={i} ref={(g) => { if (g) layerRefs.current[i] = g }}>
            <mesh>
              <boxGeometry args={[3.6, 0.09, 2.4]} />
              <meshPhysicalMaterial color="#2d63e0" transparent opacity={0.3 + i * 0.04} roughness={0.12} metalness={0.25} clearcoat={1} depthWrite={false} />
            </mesh>
            <lineSegments geometry={edge}><lineBasicMaterial color="#8cc4ff" transparent opacity={0.75} /></lineSegments>
            <mesh position={[0, 0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.5, 2.3]} />
              <meshBasicMaterial map={tex} transparent opacity={0.9} depthWrite={false} />
            </mesh>
          </group>
        ))}
        {/* chart standing on the top layer */}
        <mesh geometry={revGeo}><meshBasicMaterial color="#7dd3fc" /></mesh>
        <mesh geometry={expGeo}><meshBasicMaterial color="#a5b4fc" transparent opacity={0.85} /></mesh>
        <lineSegments geometry={droplines}><lineBasicMaterial color="#7dd3fc" transparent opacity={0.28} /></lineSegments>
        {REV.map((v, k) => (
          <mesh key={k} ref={(m) => { if (m) dotRefs.current[k] = m }} position={[-1.5 + k * 0.5, yTop + 0.2 + v, -0.45]}>
            <sphereGeometry args={[0.065, 16, 16]} /><meshBasicMaterial color="#e6f6ff" />
          </mesh>
        ))}
        {BARS.map((_, k) => (
          <mesh key={k} ref={(m) => { if (m) barRefs.current[k] = m }} position={[-1.35 + k * 0.45, yTop, 0.6]}>
            <boxGeometry args={[0.22, 1, 0.22]} />
            <meshPhysicalMaterial color={new THREE.Color('#2563eb').lerp(new THREE.Color('#38bdf8'), k / 6)} metalness={0.55} roughness={0.2} emissive="#1d4ed8" emissiveIntensity={0.35} clearcoat={1} />
          </mesh>
        ))}
        {/* transaction path */}
        <primitive object={pathObj} />
        <points geometry={partGeo} frustumCulled={false}>
          <pointsMaterial map={spr} size={0.2} color="#bfe8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
    </>
  )
}

export default function HeroFinance({ reduced, mobile, active }: { reduced: boolean; mobile: boolean; active: boolean }) {
  return (
    <Canvas dpr={[1, mobile ? 1.5 : 1.75]} camera={{ position: [0, 1.4, 10], fov: 38 }} gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'} aria-hidden>
      <Stage reduced={reduced} mobile={mobile} />
    </Canvas>
  )
}
