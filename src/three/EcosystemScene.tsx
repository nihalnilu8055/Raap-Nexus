import { useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Core, Dust, Env, Flow, NODE_GEOS, Rings } from './parts'

interface Props {
  count: number
  activeRef: MutableRefObject<number>
  onSelect: (i: number) => void
  labels: MutableRefObject<(HTMLElement | null)[]>
  reduced: boolean
  mobile: boolean
  active: boolean
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)

function Stage({ count, activeRef, onSelect, labels, reduced, mobile }: Omit<Props, 'active'>) {
  const base = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
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
  const { camera, size } = useThree()
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (!reduced) intro.current = Math.min(1, intro.current + dt / 1.6)
    reveal.current = ease(intro.current)
    const act = activeRef.current
    const aspect = size.width / size.height
    const z = aspect < 0.9 ? 15 : aspect < 1.3 ? 12.5 : 10.5
    camera.position.x += ((reduced ? 0 : s.pointer.x * 0.9) - camera.position.x) * 0.04
    camera.position.y += ((reduced ? 0 : s.pointer.y * 0.5) + 1.3 - camera.position.y) * 0.04
    camera.position.z += (z - camera.position.z) * 0.08
    camera.lookAt(0, 0, 0)
    hubRef.current.scale.setScalar(0.85 + 0.15 * reveal.current)
    base.forEach((b, i) => {
      const f = reduced ? 0 : 1
      live[i].set(b.x, b.y + Math.sin(t * 0.7 + i * 1.3) * 0.1 * f, b.z)
      const m = meshes.current[i]
      if (!m) return
      m.position.copy(live[i])
      const on = i === act
      const target = (on ? 0.36 : 0.26) * reveal.current
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * 0.12)
      m.rotation.y += dt * (on ? 1.2 : 0.35) * (reduced ? 0 : 1)
      m.rotation.x += dt * 0.25 * (reduced ? 0 : 1)
      const mat = m.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity += ((on ? 1.4 : 0.25) - mat.emissiveIntensity) * 0.15
      const el = labels.current[i]
      if (el) {
        tmp.copy(live[i]).project(camera)
        const x = (tmp.x * 0.5 + 0.5) * size.width
        const y = (-tmp.y * 0.5 + 0.5) * size.height
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, 30px)`
        el.style.opacity = String(reveal.current)
      }
    })
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} color="#cfe3ff" />
      <pointLight position={[-5, -2, 4]} intensity={25} color="#2f7bff" />
      <pointLight position={[0, 0, 0]} intensity={12} color="#6fd0ff" distance={8} />
      <Dust count={mobile ? 100 : 240} />
      <group ref={hubRef}>
        <group scale={1.15}>
          <Core speed={reduced ? 0 : 1} />
          <Rings speed={reduced ? 0 : 1} reveal={rings} />
        </group>
        <Flow nodes={live} perEdge={mobile ? 5 : 9} activeRef={activeRef} reveal={reveal} speed={reduced ? 0 : 1} />
        {base.map((_, i) => {
          const G = NODE_GEOS[i]
          return (
            <mesh
              key={i}
              ref={(m) => { if (m) meshes.current[i] = m }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; onSelect(i) }}
              onPointerOut={() => { document.body.style.cursor = '' }}
              onClick={(e) => { e.stopPropagation(); onSelect(i) }}
            >
              {G === 'octahedron' ? <octahedronGeometry args={[1, 0]} /> : G === 'dodecahedron' ? <dodecahedronGeometry args={[1, 0]} /> : <icosahedronGeometry args={[1, 0]} />}
              <meshPhysicalMaterial color="#dbe9ff" metalness={0.5} roughness={0.12} clearcoat={1} emissive="#3b82f6" emissiveIntensity={0.25} />
            </mesh>
          )
        })}
      </group>
    </>
  )
}

export default function EcosystemScene({ active, ...p }: Props) {
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
