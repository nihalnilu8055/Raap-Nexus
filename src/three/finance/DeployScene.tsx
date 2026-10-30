import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Core, Env, sprite } from '../parts'
import { canvasTexture, ease, clamp01, rr } from './tex'

/**
 * AI Model Deployment: a central model core joined to three environments (cloud, private infrastructure, local).
 * focusRef: 0 = overview, 1 = cloud, 2 = private, 3 = local. The camera glides between them.
 * A visual concept only; it does not describe what RaapNexus supports today.
 */
export interface DeployProps { focusRef: MutableRefObject<number>; onPick: (i: number) => void; reduced: boolean; mobile: boolean; active: boolean }

const CLOUD = '#38bdf8', PRIV = '#34d399', LOCAL = '#fbbf24'
const COLS = [CLOUD, PRIV, LOCAL]
const ANCHOR = [new THREE.Vector3(-4.3, 1.5, -1), new THREE.Vector3(4.3, 0.5, -1.4), new THREE.Vector3(0, -2.0, 2.2)]
const CAM = [
  { p: [0, 1.0, 14.8], l: [0, -0.9, 0] }, { p: [-1.4, 1.4, 10.8], l: [-3.4, 0.6, -0.8] },
  { p: [1.6, 0.8, 10.8], l: [3.3, -0.1, -1.1] }, { p: [0.3, -0.8, 11.4], l: [0, -2.7, 1.6] },
]

function panelTex() {
  return canvasTexture(512, 320, (g, w, h) => {
    g.fillStyle = 'rgba(7,22,60,.85)'; rr(g, 4, 4, w - 8, h - 8, 28); g.fill(); g.strokeStyle = 'rgba(56,189,248,.7)'; g.lineWidth = 4; g.stroke()
    ;[0.5, 0.8, 0.35, 0.95, 0.62, 0.78].forEach((v, i) => { g.fillStyle = i % 2 ? '#38bdf8' : '#7dd3fc'; g.fillRect(40 + i * 72, h - 40 - v * 200, 44, v * 200) })
  })
}
function rackTex() {
  return canvasTexture(256, 512, (g, w, h) => {
    g.fillStyle = '#060d26'; g.fillRect(0, 0, w, h)
    for (let i = 0; i < 9; i++) { const y = 18 + i * 54; g.fillStyle = '#0f1d4d'; rr(g, 14, y, w - 28, 44, 8); g.fill(); g.strokeStyle = 'rgba(52,211,153,.45)'; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(160,200,255,.35)'; g.fillRect(30, y + 14, 90, 6); g.fillRect(30, y + 26, 54, 5) }
  })
}
function screenTex() {
  return canvasTexture(512, 320, (g, w, h) => {
    g.fillStyle = '#0a1030'; g.fillRect(0, 0, w, h)
    for (let i = 0; i < 9; i++) { g.fillStyle = i % 3 === 0 ? '#fbbf24' : 'rgba(160,200,255,.5)'; g.fillRect(28, 30 + i * 28, 80 + ((i * 53) % 190), 10) }
    g.strokeStyle = '#fbbf24'; g.lineWidth = 5; rr(g, w - 190, 70, 140, 140, 18); g.stroke(); g.fillStyle = 'rgba(251,191,36,.25)'; rr(g, w - 170, 90, 100, 100, 12); g.fill()
  })
}
function lockTex() {
  return canvasTexture(128, 128, (g) => {
    g.strokeStyle = '#6ee7b7'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(64, 54, 22, Math.PI, 0); g.stroke()
    g.fillStyle = '#34d399'; rr(g, 34, 56, 60, 48, 10); g.fill(); g.fillStyle = '#052e22'; g.beginPath(); g.arc(64, 78, 6, 0, 7); g.fill(); g.fillRect(61, 80, 6, 14)
  })
}
function blobTex() {
  return canvasTexture(256, 256, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(2,6,25,.8)'); r.addColorStop(1, 'rgba(2,6,25,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w) })
}

const glass = (c: string, o = 0.35) => <meshPhysicalMaterial color={c} metalness={0.2} roughness={0.2} clearcoat={1} transparent opacity={o} envMapIntensity={1} />
const Edges = ({ size, color, o = 0.7 }: { size: [number, number, number]; color: string; o?: number }) => {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size])
  useEffect(() => () => geo.dispose(), [geo])
  return <lineSegments geometry={geo}><lineBasicMaterial color={color} transparent opacity={o} /></lineSegments>
}
function Platform({ color, r = 1.9, hot }: { color: string; r?: number; hot: MutableRefObject<number> }) {
  const ring = useRef<THREE.Mesh>(null!)
  useFrame(() => { (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + hot.current * 0.65 })
  return (
    <group position={[0, -1.15, 0]}>
      <mesh><cylinderGeometry args={[r, r + 0.08, 0.06, 64]} /><meshPhysicalMaterial color="#0a1438" metalness={0.5} roughness={0.3} clearcoat={1} transparent opacity={0.9} /></mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}><ringGeometry args={[r - 0.05, r, 64]} /><meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  )
}

function CloudEnv({ hot, reduced }: { hot: MutableRefObject<number>; reduced: boolean }) {
  const puffs = useRef<THREE.Group>(null!), pt = useMemo(() => panelTex(), []), orb = useRef<THREE.Group>(null!)
  useEffect(() => () => pt.dispose(), [pt])
  useFrame((s) => { const t = s.clock.elapsedTime; if (!reduced) { puffs.current.position.y = 0.35 + Math.sin(t * 0.8) * 0.08; orb.current.rotation.y = t * 0.3 } })
  return (
    <group>
      <group ref={puffs} position={[0, 0.35, 0]}>
        {([[0, 0, 0, 0.78], [0.9, -0.12, 0.1, 0.58], [-0.88, -0.16, 0, 0.58], [0.42, 0.34, 0.1, 0.52], [-0.38, 0.3, -0.1, 0.46]] as const).map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}><sphereGeometry args={[r, 28, 24]} /><meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.28} roughness={0.55} envMapIntensity={0.9} /></mesh>
        ))}
      </group>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, -0.55 - i * 0.28, 0]}>
          <mesh><boxGeometry args={[1.9, 0.1, 1]} />{glass('#0ea5e9', 0.5)}</mesh><Edges size={[1.9, 0.1, 1]} color={CLOUD} />
          <mesh position={[0.7, 0.06, 0.2]}><boxGeometry args={[0.1, 0.02, 0.1]} /><meshBasicMaterial color="#a5f3fc" /></mesh>
        </group>
      ))}
      <group ref={orb}>
        {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.cos(i * 1.57) * 1.7, 0.4 + (i % 2) * 0.35, Math.sin(i * 1.57) * 1.2]}><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color="#bae6fd" /></mesh>)}
      </group>
      <mesh position={[-1.7, 0.2, 0.6]} rotation={[0, 0.5, 0]}><planeGeometry args={[1.1, 0.7]} /><meshBasicMaterial map={pt} transparent toneMapped={false} /></mesh>
      <mesh position={[1.7, 0.7, 0.4]} rotation={[0, -0.5, 0]}><planeGeometry args={[1.1, 0.7]} /><meshBasicMaterial map={pt} transparent toneMapped={false} /></mesh>
      <Platform color={CLOUD} hot={hot} />
    </group>
  )
}

function PrivateEnv({ hot, reduced }: { hot: MutableRefObject<number>; reduced: boolean }) {
  const rt = useMemo(() => rackTex(), []), lt = useMemo(() => lockTex(), [])
  const leds = useRef<THREE.Mesh[]>([]), lock = useRef<THREE.Mesh>(null!), shell = useRef<THREE.Mesh>(null!)
  useEffect(() => () => { rt.dispose(); lt.dispose() }, [rt, lt])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    leds.current.forEach((m, i) => { if (m) (m.material as THREE.MeshBasicMaterial).color.set(reduced || Math.sin(t * (2 + (i % 5) * 0.6) + i) > -0.2 ? '#34d399' : '#064e3b') })
    lock.current.position.y = 1.55 + (reduced ? 0 : Math.sin(t) * 0.05)
    ;(shell.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + hot.current * 0.1
  })
  return (
    <group>
      {[-0.7, 0.7].map((x, k) => (
        <group key={x} position={[x, 0.0, 0]}>
          <mesh><boxGeometry args={[1, 2.1, 0.9]} /><meshPhysicalMaterial color="#0b1330" metalness={0.7} roughness={0.3} clearcoat={0.6} /></mesh>
          <mesh position={[0, 0, 0.46]}><planeGeometry args={[0.88, 1.96]} /><meshBasicMaterial map={rt} toneMapped={false} /></mesh>
          {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[0.36, 0.9 - i * 0.2, 0.47]} ref={(m) => { if (m) leds.current[k * 9 + i] = m }}><circleGeometry args={[0.03, 10]} /><meshBasicMaterial color="#34d399" /></mesh>)}
        </group>
      ))}
      <mesh ref={shell} position={[0, 0.1, 0]}><boxGeometry args={[3.3, 2.5, 1.7]} /><meshBasicMaterial color={PRIV} transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <group position={[0, 0.1, 0]}><Edges size={[3.3, 2.5, 1.7]} color={PRIV} o={0.55} /></group>
      <mesh ref={lock} position={[0, 1.55, 0]}><planeGeometry args={[0.7, 0.7]} /><meshBasicMaterial map={lt} transparent toneMapped={false} depthWrite={false} /></mesh>
      <Platform color={PRIV} hot={hot} r={2.1} />
    </group>
  )
}

function LocalEnv({ hot, reduced }: { hot: MutableRefObject<number>; reduced: boolean }) {
  const st = useMemo(() => screenTex(), []), chip = useRef<THREE.Group>(null!), gpu = useRef<THREE.Mesh>(null!)
  useEffect(() => () => st.dispose(), [st])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    chip.current.position.y = 1.45 + (reduced ? 0 : Math.sin(t * 1.2) * 0.07); chip.current.rotation.y = reduced ? 0 : t * 0.5
    ;(gpu.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + (reduced ? 0.2 : Math.sin(t * 3) * 0.25)
  })
  return (
    <group>
      <group position={[0, -0.72, 0]}>
      <mesh position={[0, -0.34, 0]}><boxGeometry args={[2.8, 0.1, 1.5]} /><meshPhysicalMaterial color="#1b2552" metalness={0.5} roughness={0.35} clearcoat={0.8} /></mesh>
      <group position={[-0.25, 0.2, 0]}>
        <mesh><boxGeometry args={[1.7, 1.05, 0.07]} /><meshPhysicalMaterial color="#0a1030" metalness={0.8} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 0.04]}><planeGeometry args={[1.58, 0.93]} /><meshBasicMaterial map={st} toneMapped={false} /></mesh>
        <mesh position={[0, -0.7, -0.05]}><boxGeometry args={[0.16, 0.4, 0.1]} /><meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} /></mesh>
      </group>
      <mesh position={[-0.25, -0.27, 0.5]}><boxGeometry args={[1.2, 0.04, 0.35]} /><meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} /></mesh>
      <group position={[1.05, 0.28, -0.1]}>
        <mesh><boxGeometry args={[0.5, 1.2, 0.7]} /><meshPhysicalMaterial color="#0f172a" metalness={0.8} roughness={0.25} clearcoat={0.7} /></mesh>
        <mesh ref={gpu} position={[0, 0.1, 0.36]}><planeGeometry args={[0.36, 0.1]} /><meshBasicMaterial color={LOCAL} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <mesh position={[0, -0.2, 0.36]}><circleGeometry args={[0.1, 20]} /><meshBasicMaterial color="#fde68a" /></mesh>
      </group>
      <group ref={chip} position={[-0.25, 1.45, 0]}>
        <mesh><boxGeometry args={[0.48, 0.07, 0.48]} /><meshPhysicalMaterial color="#1a1f3a" metalness={0.9} roughness={0.2} emissive={LOCAL} emissiveIntensity={0.35} /></mesh>
        <mesh position={[0, 0.045, 0]}><boxGeometry args={[0.26, 0.02, 0.26]} /><meshBasicMaterial color={LOCAL} /></mesh>
      </group>
      </group>
      <Platform color={LOCAL} hot={hot} r={2.0} />
    </group>
  )
}

function Stage({ focusRef, onPick, reduced, mobile }: Omit<DeployProps, 'active'>) {
  const { camera, gl } = useThree()
  const spr = useMemo(() => sprite(), [])
  const blob = useMemo(() => blobTex(), [])
  const hover = useRef(-1), hot = useRef([0, 0, 0]), hotRefs = useMemo(() => [0, 1, 2].map((i) => ({ get current() { return hot.current[i] }, set current(v: number) { hot.current[i] = v } })), [])
  const envs = useRef<THREE.Group[]>([]), core = useRef<THREE.Group>(null!)
  const look = useRef(new THREE.Vector3(0, 0.1, 0)), intro = useRef(reduced ? 3 : 0)
  const NP = mobile ? 3 : 6
  const paths = useMemo(() => ANCHOR.map((a, i) => {
    const mid = a.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.9 + (i === 2 ? 0.3 : 0), 0.8))
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), mid, a.clone().add(new THREE.Vector3(0, 0.3, 0)))
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))
    return { curve, line: new THREE.Line(geo, new THREE.LineBasicMaterial({ color: COLS[i], transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })) }
  }), [])
  const pg = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * NP * 3), 3)); const c = new Float32Array(3 * NP * 3); for (let i = 0; i < 3; i++) for (let q = 0; q < NP; q++) new THREE.Color(COLS[i]).toArray(c, (i * NP + q) * 3); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g }, [NP])
  useEffect(() => () => { blob.dispose(); pg.dispose(); paths.forEach((p) => { p.line.geometry.dispose(); (p.line.material as THREE.Material).dispose() }); gl.domElement.style.cursor = '' }, [blob, pg, paths, gl])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    intro.current = Math.min(3, intro.current + dt * 0.6)
    const f = focusRef.current, k = ease(clamp01(intro.current * 0.9))
    core.current.scale.setScalar(0.4 + 0.6 * k * (mobile ? 0.85 : 1)); core.current.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.08
    const pp = pg.attributes.position.array as Float32Array
    for (let i = 0; i < 3; i++) {
      const on = f === i + 1 || hover.current === i
      hot.current[i] += ((on ? 1 : 0) - hot.current[i]) * Math.min(1, dt * 4)
      const e = envs.current[i]
      if (e) {
        const vis = ease(clamp01(intro.current * 0.9 - 0.5 - i * 0.35))
        e.scale.setScalar((0.55 + 0.45 * vis) * (1 + hot.current[i] * 0.06) * (mobile ? 0.9 : 1)); e.visible = vis > 0.01
        e.position.copy(ANCHOR[i]); e.position.y += reduced ? 0 : Math.sin(t * 0.6 + i * 2) * 0.1
        e.rotation.y = (i === 0 ? 0.35 : i === 1 ? -0.4 : 0) + (reduced ? 0 : Math.sin(t * 0.3 + i) * 0.05)
      }
      const m = paths[i].line.material as THREE.LineBasicMaterial
      m.opacity = (0.18 + hot.current[i] * 0.75) * (f === 0 ? 1.5 : 1) * Math.min(1, intro.current - 0.6 - i * 0.3 > 0 ? 1 : 0)
      for (let q = 0; q < NP; q++) {
        const u = ((q / NP) + t * (0.12 + hot.current[i] * 0.22)) % 1
        paths[i].curve.getPoint(u, new THREE.Vector3()).toArray(pp, (i * NP + q) * 3)
      }
    }
    pg.attributes.position.needsUpdate = true
    const c = CAM[f] ?? CAM[0], zoff = mobile ? 3.5 : 0
    camera.position.x += (c.p[0] - camera.position.x) * 0.045 + (reduced ? 0 : s.pointer.x * 0.01)
    camera.position.y += (c.p[1] - camera.position.y) * 0.045
    camera.position.z += (c.p[2] + zoff - camera.position.z) * 0.045
    look.current.x += (c.l[0] - look.current.x) * 0.05; look.current.y += (c.l[1] - look.current.y) * 0.05; look.current.z += (c.l[2] - look.current.z) * 0.05
    camera.lookAt(look.current)
  })

  const ev = (i: number) => ({
    onPointerOver: (e: { stopPropagation: () => void }) => { e.stopPropagation(); hover.current = i; gl.domElement.style.cursor = 'pointer' },
    onPointerOut: () => { hover.current = -1; gl.domElement.style.cursor = '' },
    onClick: (e: { stopPropagation: () => void }) => { e.stopPropagation(); onPick(i + 1) },
  })
  const wrap = (i: number, children: ReactNode) => <group key={i} ref={(o) => { if (o) envs.current[i] = o }} {...ev(i)}>{children}</group>

  return (
    <>
      <Env />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 5]} intensity={2} color="#dbe7ff" />
      <pointLight position={[-6, 3, 2]} intensity={30} color={CLOUD} />
      <pointLight position={[6, 2, 2]} intensity={30} color={PRIV} />
      <pointLight position={[0, -2, 5]} intensity={26} color={LOCAL} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.45, 0]}><planeGeometry args={[22, 14]} /><meshBasicMaterial map={blob} transparent depthWrite={false} /></mesh>
      <gridHelper args={[30, 40, '#3b3fc0', '#1c1f6e']} position={[0, -3.46, 0]}><lineBasicMaterial attach="material" vertexColors transparent opacity={0.2} depthWrite={false} /></gridHelper>

      <group ref={core}><Core speed={1.1} glow={1.1} tint="#4338ca" heart="#c4b5fd" halo="#7c6bff" lattice="#a5b4fc" /></group>
      <sprite scale={[5, 5, 1]}><spriteMaterial map={spr} color="#7c6bff" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>

      {paths.map((p, i) => <primitive key={i} object={p.line} />)}
      <points geometry={pg} frustumCulled={false}><pointsMaterial map={spr} size={0.3} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
      {wrap(0, <CloudEnv hot={hotRefs[0]} reduced={reduced} />)}
      {wrap(1, <PrivateEnv hot={hotRefs[1]} reduced={reduced} />)}
      {wrap(2, <LocalEnv hot={hotRefs[2]} reduced={reduced} />)}
    </>
  )
}

export default function DeployScene({ active, ...p }: DeployProps) {
  return (
    <Canvas dpr={[1, p.mobile ? 1.5 : 1.75]} camera={{ position: [0, 1.4, 13], fov: 38 }} gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }} frameloop={active ? 'always' : 'never'} aria-hidden>
      <Stage {...p} />
    </Canvas>
  )
}
