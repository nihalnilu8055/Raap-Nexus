import { useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Core, Dust, Env, Flow, Neural, NODE_GEOS, Rings } from './parts'

export interface NetworkProps {
  colors: string[]
  variant: 'platform' | 'ai'
  routeRef: MutableRefObject<number[]>
  onSelect: (i: number) => void
  labels: MutableRefObject<(HTMLElement | null)[]>
  reduced: boolean
  mobile: boolean
  active: boolean
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)
const AI = { tint: '#4a3fd6', heart: '#d9d4ff', halo: '#6d5cff', lattice: '#b4a8ff', hot: '#e0dcff' }

function Stage({ colors, variant, routeRef, onSelect, labels, reduced, mobile }: Omit<NetworkProps, 'active'>) {
  const count = colors.length
  const ai = variant === 'ai'
  const base = useMemo(
    () => Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2
      return new THREE.Vector3(Math.cos(a) * 3.5, Math.sin(a) * 2.0, Math.cos(a * 2) * 0.7)
    }),
    [count],
  )
  const live = useMemo(() => base.map((b) => b.clone()), [base])
  const meshes = useRef<THREE.Mesh[]>([])
  const hubRef = useRef<THREE.Group>(null!)
  const intro = useRef(reduced ? 1 : 0)
  const reveal = useRef(reduced ? 1 : 0)
  const rings = useRef(1)
  const pulse = useRef(0)
  const last = useRef('')
  const { camera, size } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const cols = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (!reduced) intro.current = Math.min(1, intro.current + dt / 1.6)
    reveal.current = ease(intro.current)
    const route = routeRef.current
    const key = route.join(',')
    if (key !== last.current) { last.current = key; pulse.current = 1 }
    pulse.current = Math.max(0, pulse.current - dt * 1.8)
    const aspect = size.width / size.height
    const z = aspect < 0.9 ? 15 : aspect < 1.3 ? 12.5 : 10.5
    camera.position.x += ((reduced ? 0 : s.pointer.x * 0.9) - camera.position.x) * 0.04
    camera.position.y += ((reduced ? 0 : s.pointer.y * 0.5) + 1.3 - camera.position.y) * 0.04
    camera.position.z += (z - camera.position.z) * 0.08
    camera.lookAt(0, 0, 0)
    hubRef.current.scale.setScalar((0.85 + 0.15 * reveal.current) * (1 + pulse.current * 0.07))
    // gentle orbital sway of the whole constellation
    const th = reduced ? 0 : Math.sin(t * 0.22) * 0.28
    const c = Math.cos(th), sn = Math.sin(th)
    base.forEach((b, i) => {
      const f = reduced ? 0 : 1
      live[i].set(b.x * c + b.z * sn, b.y + Math.sin(t * 0.7 + i * 1.3) * 0.1 * f, -b.x * sn + b.z * c)
      const m = meshes.current[i]
      if (!m) return
      m.position.copy(live[i])
      const on = route.includes(i)
      const target = (on ? 0.36 : 0.26) * reveal.current * (on && !reduced ? 1 + Math.sin(t * 3) * 0.04 : 1)
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * 0.12)
      m.rotation.y += dt * (on ? 1.2 : 0.35) * (reduced ? 0 : 1)
      m.rotation.x += dt * 0.25 * (reduced ? 0 : 1)
      const mat = m.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity += ((on ? 1.5 : 0.3) - mat.emissiveIntensity) * 0.15
      const el = labels.current[i]
      if (el) {
        tmp.copy(live[i]).project(camera)
        el.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * size.width}px, ${(-tmp.y * 0.5 + 0.5) * size.height}px) translate(-50%, 30px)`
        el.style.opacity = String(reveal.current)
      }
    })
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} color="#cfe3ff" />
      <pointLight position={[-5, -2, 4]} intensity={25} color={ai ? '#7c6bff' : '#2f7bff'} />
      <pointLight position={[0, 0, 0]} intensity={12} color={ai ? '#b9aaff' : '#6fd0ff'} distance={8} />
      <Dust count={mobile ? 100 : 240} />
      <group ref={hubRef}>
        <group scale={1.15}>
          <Core speed={reduced ? 0 : 1} {...(ai ? AI : {})} />
          <Rings speed={reduced ? 0 : 1} reveal={rings} />
        </group>
        <Flow nodes={live} perEdge={mobile ? 5 : 9} routeRef={routeRef} reveal={reveal} speed={reduced ? 0 : 1} hotColor={ai ? AI.hot : undefined} />
        {ai && <Neural nodes={live} speed={reduced ? 0 : 1} />}
        {base.map((_, i) => {
          const G = NODE_GEOS[i % NODE_GEOS.length]
          return (
            <mesh
              key={i}
              ref={(m) => { if (m) meshes.current[i] = m }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onSelect(i) }}
              onPointerOut={() => { document.body.style.cursor = '' }}
              onClick={(e) => { e.stopPropagation(); onSelect(i) }}
            >
              {G === 'octahedron' ? <octahedronGeometry args={[1, 0]} /> : G === 'dodecahedron' ? <dodecahedronGeometry args={[1, 0]} /> : <icosahedronGeometry args={[1, 0]} />}
              <meshPhysicalMaterial color="#e4ecff" metalness={0.5} roughness={0.12} clearcoat={1} emissive={cols[i]} emissiveIntensity={0.3} />
            </mesh>
          )
        })}
      </group>
    </>
  )
}

export default function NetworkScene({ active, ...p }: NetworkProps) {
  return (
    <Canvas
      dpr={[1, p.mobile ? 1.5 : 1.75]}
      camera={{ position: [0, 1.3, 11], fov: 38 }}
      gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      aria-hidden
    >
      <Stage {...p} />
    </Canvas>
  )
}
