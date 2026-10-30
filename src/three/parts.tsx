import { useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/** Soft studio reflections for the metal/glass materials (no HDR download). */
export function Env() {
  const { gl, scene, invalidate } = useThree()
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const tex = pm.fromScene(room, 0.04).texture
    scene.environment = tex
    invalidate()
    return () => {
      scene.environment = null
      tex.dispose()
      pm.dispose()
    }
  }, [gl, scene, invalidate])
  return null
}

let spriteTex: THREE.CanvasTexture | null = null
export function sprite() {
  if (spriteTex) return spriteTex
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.35, 'rgba(160,210,255,.8)')
  r.addColorStop(1, 'rgba(60,120,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  spriteTex = new THREE.CanvasTexture(c)
  return spriteTex
}

/** The intelligent core: metal shell, glowing heart, wire lattice. */
export function Core({ speed = 1, glow = 1, tint = '#1f4fd6', heart: heartColor = '#a5e1ff', halo = '#2f6bff', lattice = '#7cc0ff' }: { speed?: number; glow?: number; tint?: string; heart?: string; halo?: string; lattice?: string }) {
  const g = useRef<THREE.Group>(null!)
  const wire = useRef<THREE.Mesh>(null!)
  const heart = useRef<THREE.Mesh>(null!)
  useFrame((s, dt) => {
    g.current.rotation.y += dt * 0.2 * speed
    g.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.35) * 0.14 * speed
    wire.current.rotation.y -= dt * 0.12 * speed
    const k = 1 + Math.sin(s.clock.elapsedTime * 1.6) * 0.05 * speed
    heart.current.scale.setScalar(0.5 * k)
  })
  return (
    <group ref={g}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial color={tint} metalness={0.8} roughness={0.2} clearcoat={1} clearcoatRoughness={0.08} flatShading transparent opacity={0.8} />
      </mesh>
      <mesh ref={wire} scale={1.3}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={lattice} wireframe transparent opacity={0.2} />
      </mesh>
      <mesh ref={heart}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={heartColor} transparent opacity={0.95 * glow} />
      </mesh>
      <mesh scale={2.1}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={halo} transparent opacity={0.08 * glow} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

/** Fine energy rings orbiting the core. */
export function Rings({ speed = 1, reveal }: { speed?: number; reveal?: MutableRefObject<number> }) {
  const refs = useRef<THREE.Mesh[]>([])
  const cfg = useMemo(
    () => [
      { r: 1.9, tilt: [1.2, 0.2, 0], s: 0.25 },
      { r: 2.35, tilt: [0.5, 0.9, 0.3], s: -0.18 },
      { r: 2.85, tilt: [1.45, -0.5, 0.6], s: 0.12 },
    ],
    [],
  )
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      m.rotation.z += dt * cfg[i].s * speed
      const o = reveal ? reveal.current : 1
      ;(m.material as THREE.MeshBasicMaterial).opacity = 0.42 * o
      m.scale.setScalar(0.6 + 0.4 * o)
    })
  })
  return (
    <>
      {cfg.map((c, i) => (
        <mesh key={i} ref={(m) => { if (m) refs.current[i] = m }} rotation={c.tilt as [number, number, number]}>
          <torusGeometry args={[c.r, 0.006, 6, 180]} />
          <meshBasicMaterial color="#5ec8ff" transparent opacity={0.4} />
        </mesh>
      ))}
    </>
  )
}

interface FlowProps {
  nodes: THREE.Vector3[]
  perEdge: number
  /** Indices of highlighted nodes. One = selected module, several = a workflow route. */
  routeRef?: MutableRefObject<number[]>
  reveal?: MutableRefObject<number>
  speed?: number
  hotColor?: string
}

/** Data paths from the core to every node, plus particles travelling along them. */
export function Flow({ nodes, perEdge, routeRef, reveal, speed = 1, hotColor = '#bfe8ff' }: FlowProps) {
  const E = nodes.length
  const N = E * perEdge
  const lineMat = useRef<THREE.LineBasicMaterial>(null!)
  const pointMat = useRef<THREE.PointsMaterial>(null!)
  const seeds = useMemo(() => Float32Array.from({ length: N }, () => Math.random()), [N])
  const tex = useMemo(() => sprite(), [])
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(E * 6), 3))
    return g
  }, [E])
  const hotGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(E * 6), 3))
    g.setDrawRange(0, 0)
    return g
  }, [E])
  const ptGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    return g
  }, [N])
  useEffect(() => () => { lineGeo.dispose(); hotGeo.dispose(); ptGeo.dispose() }, [lineGeo, hotGeo, ptGeo])

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const o = reveal ? reveal.current : 1
    const route = routeRef ? routeRef.current : []
    const chain = route.length > 1
    const lp = lineGeo.attributes.position.array as Float32Array
    const hp = hotGeo.attributes.position.array as Float32Array
    const pp = ptGeo.attributes.position.array as Float32Array
    const pc = ptGeo.attributes.color.array as Float32Array
    for (let i = 0; i < E; i++) {
      const n = nodes[i]
      lp[i * 6 + 3] = n.x * o
      lp[i * 6 + 4] = n.y * o
      lp[i * 6 + 5] = n.z * o
      const role = route.indexOf(i)
      const on = role >= 0
      for (let j = 0; j < perEdge; j++) {
        const idx = i * perEdge + j
        const sp = (on ? 0.5 : 0.2) * speed
        let u: number
        if (on && chain) u = (((j / perEdge) + t * sp - (role > 0 ? 0.5 : 0)) % 1 + 1) % 1
        else u = (seeds[idx] + t * sp) % 1
        if (on && chain ? role === 0 : j % 2) u = 1 - u
        const e = u * u * (3 - 2 * u)
        pp[idx * 3] = n.x * e * o
        pp[idx * 3 + 1] = n.y * e * o
        pp[idx * 3 + 2] = n.z * e * o
        const b = on ? 1 : 0.5
        pc[idx * 3] = b * (on ? 0.9 : 0.4)
        pc[idx * 3 + 1] = b * (on ? 1 : 0.7)
        pc[idx * 3 + 2] = b
      }
    }
    route.forEach((ni, k) => {
      const n = nodes[ni]
      hp.set([0, 0, 0, n.x, n.y, n.z], k * 6)
    })
    hotGeo.setDrawRange(0, route.length * 2)
    hotGeo.attributes.position.needsUpdate = true
    lineGeo.attributes.position.needsUpdate = true
    ptGeo.attributes.position.needsUpdate = true
    ptGeo.attributes.color.needsUpdate = true
    lineMat.current.opacity = 0.28 * o
    pointMat.current.opacity = o
  })
  return (
    <>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial ref={lineMat} color="#6db5ff" transparent opacity={0.3} />
      </lineSegments>
      <lineSegments geometry={hotGeo} frustumCulled={false}>
        <lineBasicMaterial color={hotColor} transparent opacity={0.95} />
      </lineSegments>
      <points geometry={ptGeo} frustumCulled={false}>
        <pointsMaterial ref={pointMat} map={tex} size={0.16} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </>
  )
}

/** Faint neural mesh linking neighbouring nodes (AI scene). */
export function Neural({ nodes, speed = 1 }: { nodes: THREE.Vector3[]; speed?: number }) {
  const E = nodes.length
  const mat = useRef<THREE.LineBasicMaterial>(null!)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(E * 2 * 2 * 3), 3))
    return g
  }, [E])
  useEffect(() => () => geo.dispose(), [geo])
  useFrame((s) => {
    const a = geo.attributes.position.array as Float32Array
    for (let i = 0; i < E; i++) {
      const p = nodes[i], q = nodes[(i + 1) % E], r = nodes[(i + 2) % E]
      a.set([p.x, p.y, p.z, q.x, q.y, q.z, p.x, p.y, p.z, r.x, r.y, r.z], i * 12)
    }
    geo.attributes.position.needsUpdate = true
    mat.current.opacity = 0.1 + Math.sin(s.clock.elapsedTime * 1.4 * speed) * 0.05
  })
  return (
    <lineSegments geometry={geo} frustumCulled={false}>
      <lineBasicMaterial ref={mat} color="#a5b4fc" transparent opacity={0.12} />
    </lineSegments>
  )
}

/** Faint star-dust to give depth. */
export function Dust({ count }: { count: number }) {
  const geo = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 22
      a[i * 3 + 1] = (Math.random() - 0.5) * 12
      a[i * 3 + 2] = -Math.random() * 10
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(a, 3))
    return g
  }, [count])
  const ref = useRef<THREE.Points>(null!)
  useFrame((_, dt) => { ref.current.rotation.y += dt * 0.01 })
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial map={sprite()} size={0.09} color="#8ab8ff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

export const NODE_GEOS = ['octahedron', 'dodecahedron', 'icosahedron', 'octahedron', 'dodecahedron', 'icosahedron', 'octahedron', 'dodecahedron'] as const
