import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sprite } from './parts'

/**
 * Ambient WebGL layer behind the "Coming soon" video screen: a slow cloud of data-like points, two hair-thin orbit rings with a soft light arc
 * travelling along them, and one small wireframe crystal. Everything is slow, additive and low-contrast. Mounted only while the section is on
 * screen (see ComingSoon.tsx) – R3F disposes geometry, materials and the GL context when it unmounts.
 */
const CAM_Z = 9

function Dust({ lite }: { lite: boolean }) {
  const ref = useRef<THREE.Points>(null!)
  const tex = useMemo(() => sprite(), [])
  const pos = useMemo(() => {
    const n = lite ? 36 : 80, a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 3.1 + Math.random() * 2.6
      a[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.55
      a[i * 3 + 1] = Math.cos(ph) * r * 0.85
      a[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r * 0.6 - 1
    }
    return a
  }, [lite])
  useFrame((s) => { const t = s.clock.elapsedTime; ref.current.rotation.y = t * 0.035; ref.current.rotation.x = Math.sin(t * 0.07) * 0.06 })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial map={tex} size={0.2} sizeAttenuation transparent opacity={0.7} color="#8cc8ff" depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Ring({ r, tilt, speed, lite }: { r: number; tilt: [number, number, number]; speed: number; lite: boolean }) {
  const arc = useRef<THREE.Mesh>(null!)
  useFrame((s) => { arc.current.rotation.z = s.clock.elapsedTime * speed })
  const seg = lite ? 96 : 180
  return (
    <group rotation={tilt} scale={[1.55, 1, 1]}>
      <mesh><torusGeometry args={[r, 0.006, 6, seg]} /><meshBasicMaterial color="#4f8dff" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh ref={arc}><torusGeometry args={[r, 0.016, 6, seg, Math.PI * 0.42]} /><meshBasicMaterial color="#9fe0ff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    </group>
  )
}

function Crystal() {
  const ref = useRef<THREE.Group>(null!)
  useFrame((s) => {
    const t = s.clock.elapsedTime
    ref.current.rotation.y = t * 0.28; ref.current.rotation.x = t * 0.17
    ref.current.position.y = 2.15 + Math.sin(t * 0.6) * 0.12
  })
  return (
    <group ref={ref} position={[4.6, 2.15, -0.6]}>
      <mesh><octahedronGeometry args={[0.42, 0]} /><meshBasicMaterial color="#1b4fd6" transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <lineSegments><edgesGeometry args={[new THREE.OctahedronGeometry(0.42, 0)]} /><lineBasicMaterial color="#a5d8ff" transparent opacity={0.8} /></lineSegments>
    </group>
  )
}

export default function ComingSoonScene({ active, lite }: { active: boolean; lite: boolean }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, lite ? 1.25 : 1.6]} camera={{ position: [0, 0, CAM_Z], fov: 42, near: 1, far: 40 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }} style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}>
      <Dust lite={lite} />
      <Ring r={3.5} tilt={[1.18, 0.1, 0.18]} speed={0.22} lite={lite} />
      <Ring r={4.3} tilt={[1.05, -0.12, -0.3]} speed={-0.14} lite={lite} />
      {!lite && <Crystal />}
    </Canvas>
  )
}
