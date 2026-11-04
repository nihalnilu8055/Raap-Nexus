import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Env, sprite } from './parts'
import { canvasTexture } from './finance/tex'
import { layout, orbitState } from '../lib/orbit'

/**
 * WebGL half of the hero model. World units: the orbit box is 10 units wide (1 unit = W/10 px) and the canvas overhangs it by 4 % per side,
 * the camera is set so that plane z = 0 maps 1:1 onto the DOM labels. Rotation / hover / pointer all come from `orbitState`
 * (written by the DOM loop) – so the trails and the words can never drift apart.
 */
const CAM_Z = 16, VIS = 10.8 // visible world height at z = 0
const FOV = (2 * Math.atan(VIS / 2 / CAM_Z) * 180) / Math.PI

function useIcon() {
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load('/assets/r-icon.png')
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t
  }, [])
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function Core({ lite }: { lite: boolean }) {
  const g = useRef<THREE.Group>(null!), r = useRef<THREE.Group>(null!), band = useRef<THREE.Mesh>(null!)
  const icon = useIcon()
  const halo = useMemo(() => sprite(), [])
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime, k = 1 - Math.exp(-dt * 3)
    const px = orbitState.px, py = orbitState.py
    g.current.rotation.y += (px * 0.35 + Math.sin(t * 0.35) * 0.12 - g.current.rotation.y) * k
    g.current.rotation.x += (py * 0.25 + Math.sin(t * 0.27) * 0.05 - g.current.rotation.x) * k
    r.current.rotation.y = g.current.rotation.y * 0.55; r.current.rotation.x = g.current.rotation.x * 0.55
    band.current.rotation.z = t * 0.25
    const sc = layout(orbitState.W).sphere / (orbitState.W / 10)
    g.current.scale.setScalar(sc / 1.1)
  })
  const seg = lite ? 40 : 72
  return (
    <group ref={g}>
      {/* glass-metal sphere */}
      <mesh>
        <sphereGeometry args={[1.1, seg, seg]} />
        <meshPhysicalMaterial color="#0b2468" metalness={0.55} roughness={0.16} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={1.15} reflectivity={0.8} />
      </mesh>
      {/* inner glow shell + soft halo */}
      <mesh scale={1.012}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#3a8dff" transparent opacity={0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <sprite scale={[5.6, 5.6, 1]} position={[0, 0, -0.4]}><spriteMaterial map={halo} color="#2f6bff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      {/* machined band around the sphere */}
      <mesh ref={band} rotation={[1.15, 0.25, 0]}>
        <torusGeometry args={[1.32, 0.018, 12, 120]} />
        <meshStandardMaterial color="#9fd0ff" metalness={1} roughness={0.22} emissive="#2a6dff" emissiveIntensity={0.35} />
      </mesh>
      {/* the capital R: the supplied icon, flat, undistorted */}
      <group ref={r}>
        <mesh position={[0.03, -0.04, 1.08]}>
          <planeGeometry args={[1.16 * 1.0, 1.3 * 1.0]} />
          <meshBasicMaterial map={icon} color="#04112e" transparent opacity={0.5} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, 1.14]}>
          <planeGeometry args={[1.16, 1.3]} />
          <meshBasicMaterial map={icon} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

/** light trails riding both orbit rings, plus a tilted pathway with travelling nodes */
function Trails({ lite }: { lite: boolean }) {
  const fade = useMemo(() => canvasTexture(256, 4, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(190,230,255,1)'); gr.addColorStop(0.35, 'rgba(90,170,255,.45)'); gr.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h) }), [])
  useEffect(() => () => fade.dispose(), [fade])
  const halo = useMemo(() => sprite(), [])
  const arcs = useRef<(THREE.Group | null)[]>([])
  const path = useRef<THREE.Group>(null!), nodes = useRef<(THREE.Sprite | null)[]>([])
  const defs = useMemo(() => {
    const u = 1 // layout radii are read each frame; geometry is built for unit radius and scaled
    void u
    const out: { ring: 0 | 1; at: number; len: number }[] = []
    for (let k = 0; k < (lite ? 1 : 2); k++) { out.push({ ring: 0, at: 0.5 + k * 3, len: 1.0 }); out.push({ ring: 1, at: 0.5 + k * 3.1, len: 0.8 }) }
    return out
  }, [lite])
  useFrame((s) => {
    const t = s.clock.elapsedTime, W = orbitState.W, u = W / 10, L = layout(W)
    defs.forEach((d, i) => {
      const gr = arcs.current[i]; if (!gr) return
      const R = (d.ring === 0 ? L.R1 : L.R2) / u
      gr.scale.setScalar(R)
      // head angle a (clockwise from the top) → torus angle θ = π/2 − a; trail extends behind the head (larger θ)
      const a = orbitState.rho * (d.ring === 0 ? 1.0 : 1.0) + t * 0.12 * (d.ring === 0 ? 1 : 0.8) + d.at
      gr.rotation.z = Math.PI / 2 - a
    })
    path.current.rotation.z = t * 0.05 + orbitState.scroll * 0.6
    path.current.rotation.y = orbitState.px * 0.18; path.current.rotation.x = 1.08 + orbitState.py * 0.12
    nodes.current.forEach((n, i) => { if (!n) return; const a = t * (0.35 + i * 0.07) + i * 2.1; n.position.set(Math.cos(a) * 3.35, Math.sin(a) * 3.35, 0); n.scale.setScalar(0.2 + 0.05 * Math.sin(t * 2 + i)) })
  })
  return (
    <>
      {defs.map((d, i) => (
        <group key={i} ref={(el) => { arcs.current[i] = el }}>
          <mesh>
            <torusGeometry args={[1, d.ring === 0 ? 0.0085 : 0.005, 6, lite ? 40 : 64, d.len]} />
            <meshBasicMaterial map={fade} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.9} color={d.ring === 0 ? '#7fd0ff' : '#a99bff'} />
          </mesh>
        </group>
      ))}
      <group ref={path}>
        <mesh>
          <torusGeometry args={[3.35, 0.006, 6, 120]} />
          <meshBasicMaterial color="#6fb0ff" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <sprite key={i} ref={(el) => { nodes.current[i] = el }}><spriteMaterial map={halo} color={i === 1 ? '#a99bff' : '#7fd0ff'} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        ))}
      </group>
    </>
  )
}

function Particles({ lite }: { lite: boolean }) {
  const n = lite ? 36 : 120
  const ref = useRef<THREE.Points>(null!)
  const geo = useMemo(() => {
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 1.8 + Math.random() * 4.2, a = Math.random() * Math.PI * 2
      p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.sin(a) * r; p[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g
  }, [n])
  useEffect(() => () => geo.dispose(), [geo])
  const tex = useMemo(() => sprite(), [])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    ref.current.rotation.z = t * 0.02 + orbitState.scroll * 0.4
    ref.current.position.x += (orbitState.px * 0.35 - ref.current.position.x) * 0.04
    ref.current.position.y += (-orbitState.py * 0.28 - ref.current.position.y) * 0.04
  })
  return <points ref={ref} geometry={geo}><pointsMaterial map={tex} size={0.12} sizeAttenuation transparent opacity={0.65} depthWrite={false} blending={THREE.AdditiveBlending} color="#a9d4ff" /></points>
}

function Ready({ onReady }: { onReady: () => void }) {
  const n = useRef(0)
  useFrame(() => { if (n.current < 3 && ++n.current === 3) onReady() })
  return null
}

export default function HeroOrbitScene({ lite, active, onReady }: { lite: boolean; active: boolean; onReady: () => void }) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, lite ? 1.25 : 1.75]} camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 1, far: 60 }}
      gl={{ alpha: true, antialias: !lite, powerPreference: 'high-performance' }} style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}>
      <Env />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 5, 6]} intensity={1.6} color="#cfe6ff" />
      <directionalLight position={[5, -3, 3]} intensity={0.8} color="#5a7dff" />
      <Particles lite={lite} />
      <Trails lite={lite} />
      <Core lite={lite} />
      <Ready onReady={onReady} />
    </Canvas>
  )
}
