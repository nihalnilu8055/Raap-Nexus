import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../lib/motion'
import { canvasTexture, clamp01 } from './finance/tex'

/**
 * Real-3D depth stage that sits BEHIND the layered hero artwork: a faint data network with travelling pulses, and a reflective floor grid. The camera dollies/orbits with hero scroll
 * progress (scrollState.hero) and eases toward the pointer. Rendered only where it pays off (desktop/tablet, motion allowed).
 */
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
      <Rig /><Floor /><Network lite={lite} />
    </Canvas>
  )
}
