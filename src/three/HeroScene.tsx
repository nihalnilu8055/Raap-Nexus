import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Core, Dust, Env, Flow, NODE_GEOS, Rings } from './parts'
import { scrollState } from '../lib/motion'

const BASE: [number, number, number][] = [
  [3.1, 1.0, 0.4], [-3.0, 1.3, -0.6], [1.9, -1.8, 1.2], [-2.2, -1.5, 0.9],
  [0.4, 2.7, -1.0], [-0.5, -2.8, -0.8], [3.6, -0.4, -1.6], [-3.7, -0.2, -1.4],
]
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)
const back = (x: number) => { const c = 1.9; const t = Math.min(1, Math.max(0, x)) - 1; return 1 + (c + 1) * t * t * t + c * t * t }

function Stage({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const count = mobile ? 5 : 8
  const base = useMemo(() => BASE.slice(0, count).map((b) => new THREE.Vector3(...b)), [count])
  const live = useMemo(() => base.map((b) => b.clone()), [base])
  const group = useRef<THREE.Group>(null!)
  const meshes = useRef<THREE.Mesh[]>([])
  const intro = useRef(reduced ? 1 : 0)
  const rings = useRef(reduced ? 1 : 0)
  const flow = useRef(reduced ? 1 : 0)
  const { camera, size } = useThree()

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (!reduced) intro.current = Math.min(1, intro.current + dt / 2.8)
    const I = intro.current
    rings.current = ease((I - 0.25) / 0.45)
    flow.current = ease((I - 0.55) / 0.4)
    const aspect = size.width / size.height
    const wide = aspect > 1.05
    const p = scrollState.hero
    // layout: core sits right of the headline on wide screens, above it on narrow ones
    const gx = wide ? Math.min(2.6, aspect * 1.05) : 0
    const gy = wide ? 0 : 1.15
    group.current.position.set(gx, gy + p * 0.4, 0)
    group.current.scale.setScalar((wide ? 1 : 0.68) * (0.4 + 0.6 * ease(I * 1.6)))
    base.forEach((b, i) => {
      const e = back((I - 0.18 - i * 0.045) / 0.5)
      const f = reduced ? 0 : 1
      live[i].set(
        b.x * (1 + (1 - Math.min(e, 1)) * 2.4) + Math.sin(t * 0.5 + i) * 0.12 * f,
        b.y * (1 + (1 - Math.min(e, 1)) * 2.4) + Math.cos(t * 0.6 + i * 1.7) * 0.15 * f,
        b.z + Math.sin(t * 0.4 + i * 2) * 0.1 * f,
      )
      const m = meshes.current[i]
      if (m) {
        m.position.copy(live[i])
        m.scale.setScalar(Math.max(0.001, e) * 0.2)
        m.rotation.x += dt * 0.4 * (reduced ? 0 : 1)
        m.rotation.y += dt * 0.5 * (reduced ? 0 : 1)
      }
    })
    // camera: pointer parallax + scroll dolly
    const px = reduced ? 0 : s.pointer.x
    const py = reduced ? 0 : s.pointer.y
    const z0 = wide ? 10 : 12.5
    camera.position.x += (px * 0.7 - camera.position.x) * 0.04
    camera.position.y += (py * 0.4 + p * 0.8 - camera.position.y) * 0.04
    camera.position.z += (z0 - p * 5.5 - (1 - ease(I)) * -2.5 - camera.position.z) * 0.06
    camera.lookAt(gx * 0.5, gy * 0.5, 0)
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={1.6} color="#cfe3ff" />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#2f7bff" />
      <pointLight position={[0, 0, 0]} intensity={14} color="#6fd0ff" distance={7} />
      <Dust count={mobile ? 120 : 320} />
      <group ref={group}>
        <Core speed={reduced ? 0 : 1} />
        <Rings speed={reduced ? 0 : 1} reveal={rings} />
        <Flow nodes={live} perEdge={mobile ? 5 : 9} reveal={flow} speed={reduced ? 0 : 1} />
        {base.map((_, i) => {
          const G = NODE_GEOS[i]
          return (
            <mesh key={i} ref={(m) => { if (m) meshes.current[i] = m }}>
              {G === 'octahedron' ? <octahedronGeometry args={[1, 0]} /> : G === 'dodecahedron' ? <dodecahedronGeometry args={[1, 0]} /> : <icosahedronGeometry args={[1, 0]} />}
              <meshPhysicalMaterial color="#dbe9ff" metalness={0.55} roughness={0.12} clearcoat={1} emissive="#2f6bff" emissiveIntensity={0.35} />
            </mesh>
          )
        })}
      </group>
    </>
  )
}

export default function HeroScene({ reduced, mobile, active }: { reduced: boolean; mobile: boolean; active: boolean }) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ position: [0, 0, 12], fov: 38 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      aria-hidden
    >
      <Stage reduced={reduced} mobile={mobile} />
    </Canvas>
  )
}
