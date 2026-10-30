import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { Env, sprite } from '../parts'
import { canvasTexture, clamp01, ease, rr } from './tex'

/**
 * Financial Audit Intelligence: a floating ledger of layered statements, tax documents on one side,
 * transaction records on the other, joined by verification paths. Two views (tax / audit) cross-fade
 * with a camera move. Record states are illustrative visual states, not live audit results.
 */
export type AuditMode = 0 | 1
interface Props { modeRef: MutableRefObject<AuditMode>; progressRef: MutableRefObject<number>; reduced: boolean; mobile: boolean; active: boolean }

const GREEN = '#34d399', BLUE = '#60a5fa', AMBER = '#fbbf24', RED = '#f87171'
const STATE_COL = [GREEN, BLUE, AMBER, RED]
const W = 4.6, D = 3.2, TH = 0.08
const ROWS = 9
const rowZ = (r: number) => -D / 2 + ((130 + r * 60 + 20) / 704) * D
const BAND_ROWS = [1, 3, 5, 7]

const LAYER_TITLES = ['JOURNAL', 'TAX SCHEDULE', 'TRIAL BALANCE', 'FINANCIAL STATEMENT', 'GENERAL LEDGER']
function ledgerTex(i: number) {
  return canvasTexture(1024, 704, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#0f2160'); bg.addColorStop(1, '#091033')
    g.fillStyle = bg; rr(g, 4, 4, w - 8, h - 8, 36); g.fill()
    g.strokeStyle = 'rgba(125,185,255,.55)'; g.lineWidth = 4; g.stroke()
    g.fillStyle = 'rgba(90,140,255,.22)'; g.fillRect(8, 8, w - 16, 84)
    g.fillStyle = '#e6f0ff'; g.font = '800 40px Manrope, Inter, sans-serif'; g.fillText(LAYER_TITLES[i], 48, 66)
    g.fillStyle = 'rgba(160,200,255,.5)'; for (let k = 0; k < 3; k++) g.fillRect(w - 260 + k * 70, 40, 46, 12)
    for (let r = 0; r < ROWS; r++) {
      const y = 130 + r * 60, bi = BAND_ROWS.indexOf(r)
      if (bi >= 0 && i === 4) { g.fillStyle = STATE_COL[bi] + '30'; rr(g, 24, y - 6, w - 48, 52, 14); g.fill() }
      else if (r % 2) { g.fillStyle = 'rgba(120,160,255,.06)'; g.fillRect(24, y - 6, w - 48, 52) }
      g.fillStyle = 'rgba(170,205,255,.55)'; g.fillRect(52, y + 12, 120 + ((r * 53 + i * 31) % 160), 12)
      g.fillStyle = 'rgba(170,205,255,.28)'; g.fillRect(480, y + 12, 140, 12)
      g.fillStyle = bi >= 0 && i === 4 ? STATE_COL[bi] : 'rgba(190,220,255,.7)'; g.fillRect(w - 52 - (90 + ((r * 37) % 70)), y + 12, 90 + ((r * 37) % 70), 12)
    }
  })
}
function paperTex(k: number) {
  const heads = ['TAX RETURN', 'VAT STATEMENT', 'TAX SCHEDULE', 'RECEIPTS']
  const cols = ['#f59e0b', '#fb7185', '#f59e0b', '#38bdf8']
  return canvasTexture(512, 704, (g, w, h) => {
    g.fillStyle = '#f8fafc'; rr(g, 4, 4, w - 8, h - 8, 28); g.fill()
    g.fillStyle = cols[k % 4]; g.save(); rr(g, 4, 4, w - 8, 120, 28); g.clip(); g.fillRect(4, 4, w - 8, 120); g.restore()
    g.fillStyle = '#fff'; g.font = '800 46px Manrope, Inter, sans-serif'; g.fillText(heads[k % 4], 36, 84)
    for (let r = 0; r < 7; r++) {
      const y = 170 + r * 62
      g.fillStyle = r === 2 || r === 5 ? cols[k % 4] : '#cbd5e1'; g.fillRect(36, y, 150 + ((r * 47 + k * 29) % 140), 16)
      g.fillStyle = '#94a3b8'; g.fillRect(w - 130, y, 94, 16)
      g.strokeStyle = '#34d399'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(w - 160, y + 8); g.lineTo(w - 150, y + 18); g.lineTo(w - 134, y - 2); g.stroke()
    }
    g.fillStyle = '#0f172a'; rr(g, 36, h - 110, w - 72, 66, 14); g.fill()
    g.fillStyle = cols[k % 4]; g.fillRect(56, h - 86, 160, 18); g.fillStyle = '#fff'; g.fillRect(w - 200, h - 86, 140, 18)
  })
}
function recordTex(state: number) {
  const labels = ['Verified', 'Reconciled', 'Under review', 'Attention']
  return canvasTexture(512, 300, (g, w, h) => {
    g.fillStyle = 'rgba(9,18,60,.95)'; rr(g, 4, 4, w - 8, h - 8, 30); g.fill()
    g.strokeStyle = STATE_COL[state]; g.globalAlpha = 0.75; g.lineWidth = 5; g.stroke(); g.globalAlpha = 1
    g.fillStyle = STATE_COL[state]; rr(g, 30, 34, 26, 26, 13); g.fill()
    g.fillStyle = '#e6f0ff'; g.font = '700 38px Manrope, Inter, sans-serif'; g.fillText(labels[state], 72, 62)
    g.fillStyle = 'rgba(170,205,255,.5)'; g.fillRect(34, 112, 280, 16); g.fillRect(34, 156, 190, 14)
    g.fillStyle = 'rgba(200,225,255,.85)'; g.fillRect(w - 190, 200, 150, 22)
  })
}
function vatTex() {
  return canvasTexture(768, 440, (g, w, h) => {
    g.fillStyle = 'rgba(8,20,64,.78)'; rr(g, 4, 4, w - 8, h - 8, 34); g.fill()
    g.strokeStyle = 'rgba(251,191,36,.7)'; g.lineWidth = 4; g.stroke()
    g.fillStyle = '#fde68a'; g.font = '800 40px Manrope, Inter, sans-serif'; g.fillText('VAT', 40, 74)
    g.fillStyle = 'rgba(200,225,255,.8)'; g.font = '600 30px Inter, sans-serif'; g.fillText('Output', 150, h - 40); g.fillText('Input', 450, h - 40)
  })
}
function blobTex() {
  return canvasTexture(256, 256, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(2,6,25,.85)'); r.addColorStop(1, 'rgba(2,6,25,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w)
  })
}

const fade = (o: THREE.Object3D, v: number) => {
  o.visible = v > 0.01
  if (!o.visible) return
  o.traverse((c) => {
    const m = (c as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined
    if (!m) return
    for (const mm of Array.isArray(m) ? m : [m]) { if (mm.userData.b === undefined) mm.userData.b = mm.opacity; mm.transparent = true; mm.opacity = mm.userData.b * v }
  })
}
const bez = (a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, u: number, out: THREE.Vector3) => {
  const k = 1 - u
  return out.set(k * k * a.x + 2 * k * u * c.x + u * u * b.x, k * k * a.y + 2 * k * u * c.y + u * u * b.y, k * k * a.z + 2 * k * u * c.z + u * u * b.z)
}

const DOCS = [
  { p: [-4.2, 0.9, 0.9], ry: 0.55 }, { p: [-3.7, 1.5, -1.3], ry: 0.35 }, { p: [4.2, 0.9, 0.9], ry: -0.55 }, { p: [3.7, 1.5, -1.3], ry: -0.35 },
] as const
const RECS = [
  { p: [-4.3, 0.5, 1.0], s: 0, r: 1 }, { p: [-4.5, -0.55, -0.4], s: 1, r: 3 }, { p: [-3.7, 1.5, -1.5], s: 2, r: 5 }, { p: [4.3, 0.5, 1.0], s: 0, r: 2 },
  { p: [4.5, -0.55, -0.4], s: 3, r: 7 }, { p: [3.7, 1.5, -1.5], s: 1, r: 4 }, { p: [-2.9, -0.25, 2.1], s: 0, r: 6 }, { p: [2.9, -0.25, 2.1], s: 2, r: 8 },
] as const
const NPL = 20

function Stage({ modeRef, progressRef, reduced, mobile }: Omit<Props, 'active'>) {
  const { camera, invalidate } = useThree()
  const spr = useMemo(() => sprite(), [])
  const g = useRef({ v: 0, intro: reduced ? 3 : 0 })
  const root = useRef<THREE.Group>(null!), layers = useRef<THREE.Group[]>([])
  const docs = useRef<THREE.Group[]>([]), recs = useRef<THREE.Group[]>([]), vat = useRef<THREE.Group>(null!), bars = useRef<THREE.Mesh[]>([])
  const marks = useRef<THREE.Group[]>([]), scan = useRef<THREE.Mesh>(null!), head = useRef<THREE.Sprite>(null!)
  const nDocs = mobile ? 2 : 4, nRecs = mobile ? 5 : 8

  const tex = useMemo(() => ({ led: [0, 1, 2, 3, 4].map(ledgerTex), paper: [0, 1, 2, 3].map(paperTex), rec: [0, 1, 2, 3].map(recordTex), vat: vatTex(), blob: blobTex() }), [])
  const layerGeo = useMemo(() => new RoundedBoxGeometry(W, TH, D, 3, 0.05), [])
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(layerGeo), [layerGeo])
  const trail = useMemo(() => {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(61 * 3), 3))
    return { geo, line: new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })) }
  }, [])
  // connection lines (one per doc/record) + particles
  const mkPaths = (n: number, cols: (i: number) => string) => {
    const lines = Array.from({ length: n }, (_, i) => {
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NPL * 3), 3))
      return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: cols(i), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }))
    })
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3))
    const c = new Float32Array(n * 2 * 3); for (let i = 0; i < n; i++) { const col = new THREE.Color(cols(i)); for (let q = 0; q < 2; q++) col.toArray(c, (i * 2 + q) * 3) }
    pg.setAttribute('color', new THREE.BufferAttribute(c, 3))
    return { lines, pg }
  }
  const taxP = useMemo(() => mkPaths(nDocs, () => '#fcd34d'), [nDocs])
  const audP = useMemo(() => mkPaths(nRecs, (i) => STATE_COL[RECS[i].s]), [nRecs])
  useEffect(() => () => {
    Object.values(tex).flat().forEach((t) => (t as THREE.Texture).dispose())
    layerGeo.dispose(); edgeGeo.dispose(); trail.geo.dispose(); trail.line.material.dispose()
    ;[taxP, audP].forEach((p) => { p.lines.forEach((l) => { l.geometry.dispose(); (l.material as THREE.Material).dispose() }); p.pg.dispose() })
  }, [tex, layerGeo, edgeGeo, trail, taxP, audP])

  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), o: new THREE.Vector3() }), [])
  const markPos = (r: number, gap: number, x: number, out: THREE.Vector3) => out.set(x, 2 * gap + TH / 2 + 0.03, rowZ(r))

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime, st = g.current
    st.intro = Math.min(3, st.intro + dt * 0.55)
    st.v += (modeRef.current - st.v) * Math.min(1, dt * 2.4)
    const v = st.v, p = progressRef.current
    const gap = 0.3 + 0.32 * ease(clamp01((p - 0.2) / 0.3)) * (reduced ? 0.6 : 1)
    layers.current.forEach((l, i) => { if (l) l.position.y = (i - 2) * gap })
    root.current.position.y = reduced ? 0 : Math.sin(t * 0.7) * 0.07
    root.current.rotation.y = reduced ? 0 : Math.sin(t * 0.25) * 0.05

    // documents unfold, then yield to records
    docs.current.forEach((d, i) => { if (!d) return; const k = ease(clamp01(st.intro * 1.5 - 0.3 - i * 0.28)) * (1 - v); d.scale.set(1, Math.max(0.02, k), 1); d.position.y = DOCS[i].p[1] + (reduced ? 0 : Math.sin(t * 0.8 + i) * 0.09) + (1 - k) * -0.4; d.position.x = DOCS[i].p[0] * (1 + v * 0.25); fade(d, k) })
    recs.current.forEach((d, i) => { if (!d) return; const k = ease(clamp01(v * 1.4 - i * 0.05)); d.scale.setScalar(0.6 + 0.4 * k); d.position.y = RECS[i].p[1] + (reduced ? 0 : Math.sin(t * 0.7 + i * 1.3) * 0.08); fade(d, k) })
    const kv = ease(clamp01(st.intro * 1.2 - 0.8)) * (1 - v)
    fade(vat.current, kv); vat.current.position.y = 2.75 + (reduced ? 0 : Math.sin(t * 0.9) * 0.06)
    bars.current.forEach((b, i) => { const h = Math.max(0.01, (i ? 0.85 : 1.08) * ease(clamp01(st.intro * 1.1 - 1)) * (1 - v)); b.scale.y = h; b.position.y = -0.42 + h / 2 })
    marks.current.forEach((m, i) => {
      if (!m) return; markPos(BAND_ROWS[i], gap, 1.95, tmp.o); m.position.copy(tmp.o)
      const k = 0.35 + 0.65 * v + (reduced ? 0 : Math.sin(t * 2.4 + i) * 0.08 * (i === 3 ? 2 : 1)); m.scale.setScalar(k)
    })

    // paths
    const fill = (pp: typeof taxP, n: number, from: (i: number, o: THREE.Vector3) => void, to: (i: number, o: THREE.Vector3) => void, vis: number, broken: (i: number) => boolean) => {
      const pa = pp.pg.attributes.position.array as Float32Array
      for (let i = 0; i < n; i++) {
        from(i, tmp.a); to(i, tmp.b); tmp.c.set((tmp.a.x + tmp.b.x) / 2, Math.max(tmp.a.y, tmp.b.y) + 0.8, (tmp.a.z + tmp.b.z) / 2 + 0.4)
        const arr = pp.lines[i].geometry.attributes.position.array as Float32Array, lim = broken(i) ? 0.55 : 1
        for (let q = 0; q < NPL; q++) bez(tmp.a, tmp.c, tmp.b, (q / (NPL - 1)) * lim, tmp.o).toArray(arr, q * 3)
        pp.lines[i].geometry.attributes.position.needsUpdate = true
        ;(pp.lines[i].material as THREE.LineBasicMaterial).opacity = (broken(i) ? 0.45 : 0.8) * vis
        for (let q = 0; q < 2; q++) { const u = ((q / 2) + t * 0.22 + i * 0.13) % 1; bez(tmp.a, tmp.c, tmp.b, u * lim, tmp.o); if (vis < 0.05 || (broken(i) && u > 0.5)) tmp.o.set(0, 99, 0); tmp.o.toArray(pa, (i * 2 + q) * 3) }
      }
      pp.pg.attributes.position.needsUpdate = true
    }
    fill(taxP, nDocs, (i, o) => o.set(DOCS[i].p[0] * (1 + v * 0.25), DOCS[i].p[1] - 0.9 * Math.max(0.02, 1 - v) , DOCS[i].p[2]), (i, o) => markPos([2, 4, 6, 8][i], gap, i < 2 ? -1.5 : 1.5, o), 1 - v, () => false)
    fill(audP, nRecs, (i, o) => o.set(RECS[i].p[0], RECS[i].p[1], RECS[i].p[2]), (i, o) => markPos(RECS[i].r, gap, RECS[i].p[0] < 0 ? -1.6 : 1.4, o), v, (i) => RECS[i].s === 3)

    // audit trail: a path through the highlighted rows, traced repeatedly
    const ta = trail.geo.attributes.position.array as Float32Array
    for (let q = 0; q <= 60; q++) { const u = q / 60, r = 0.8 + u * 7.4; tmp.o.set(Math.sin(u * 5.2) * 1.4, 2 * gap + 0.16 + Math.sin(u * 9) * 0.05, rowZ(r)); tmp.o.toArray(ta, q * 3) }
    trail.geo.attributes.position.needsUpdate = true
    const cyc = reduced ? 1 : (t * 0.16) % 1
    trail.geo.setDrawRange(0, Math.max(2, Math.floor(61 * Math.min(1, cyc * 1.25))))
    trail.line.material.opacity = 0.85 * v
    const hu = Math.min(1, cyc * 1.25), hr = 0.8 + hu * 7.4
    head.current.position.set(Math.sin(hu * 5.2) * 1.4, 2 * gap + 0.2, rowZ(hr)); head.current.visible = v > 0.05 && !reduced
    ;(head.current.material as THREE.SpriteMaterial).opacity = v * (1 - clamp01((cyc - 0.8) * 5))
    scan.current.position.set(0, 2 * gap + TH / 2 + 0.02, reduced ? 0 : -D / 2 + ((t * 0.18) % 1) * D)
    ;(scan.current.material as THREE.MeshBasicMaterial).opacity = reduced ? 0 : 0.22

    // camera: scroll-driven orbit + view change + pointer
    const az = THREE.MathUtils.lerp(-0.3, 0.3, v) + (p - 0.5) * 0.45 + (reduced ? 0 : s.pointer.x * 0.1)
    const r = mobile ? 11.5 : 9.8, y = 3.3 - (p - 0.5) * 1.2 + (reduced ? 0 : s.pointer.y * 0.3)
    camera.position.set(Math.sin(az) * r, y, Math.cos(az) * r); camera.lookAt(0, mobile ? 0.5 : 0.55, 0)
    if (reduced) invalidate()
  })

  return (
    <>
      <Env />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 4]} intensity={2.2} color="#cfe4ff" />
      <pointLight position={[-5, 2, 3]} intensity={26} color="#fbbf24" />
      <pointLight position={[5, 2, 3]} intensity={26} color="#34d399" />
      {/* floor shadow + grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}><planeGeometry args={[11, 8]} /><meshBasicMaterial map={tex.blob} transparent depthWrite={false} /></mesh>
      <gridHelper args={[16, 32, '#2a4aa8', '#16286e']} position={[0, -1.36, 0]}>
        <lineBasicMaterial attach="material" vertexColors transparent opacity={0.25} depthWrite={false} />
      </gridHelper>

      <group ref={root}>
        {tex.led.map((lt, i) => (
          <group key={i} ref={(o) => { if (o) layers.current[i] = o }}>
            <mesh geometry={layerGeo}><meshPhysicalMaterial color="#10236b" metalness={0.35} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={1.1} transparent opacity={0.94} /></mesh>
            <lineSegments geometry={edgeGeo}><lineBasicMaterial color="#7cc0ff" transparent opacity={0.55} /></lineSegments>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, TH / 2 + 0.004, 0]}><planeGeometry args={[W - 0.1, D - 0.1]} /><meshBasicMaterial map={lt} transparent opacity={i === 4 ? 1 : 0.92} toneMapped={false} depthWrite={false} /></mesh>
          </group>
        ))}
        <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[W - 0.2, 0.22]} /><meshBasicMaterial color="#7dd3fc" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        {BAND_ROWS.map((_, i) => (
          <group key={i} ref={(o) => { if (o) marks.current[i] = o }}>
            <mesh><sphereGeometry args={[0.1, 20, 20]} /><meshBasicMaterial color={STATE_COL[i]} /></mesh>
            <sprite scale={[0.42, 0.42, 1]}><spriteMaterial map={spr} color={STATE_COL[i]} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
          </group>
        ))}

        {/* tax view */}
        <group>
          {DOCS.slice(0, nDocs).map((d, i) => (
            <group key={i} ref={(o) => { if (o) docs.current[i] = o }} position={[d.p[0], d.p[1], d.p[2]]} rotation={[0, d.ry, 0]}>
              <mesh><planeGeometry args={[1.55, 2.13]} /><meshBasicMaterial map={tex.paper[i]} transparent toneMapped={false} side={THREE.DoubleSide} /></mesh>
              <mesh position={[0.52, -0.82, 0.02]}><circleGeometry args={[0.13, 24]} /><meshBasicMaterial color={GREEN} transparent opacity={0.9} /></mesh>
              <mesh position={[0.52, -0.82, 0.03]}><ringGeometry args={[0.13, 0.17, 28]} /><meshBasicMaterial color="#a7f3d0" transparent opacity={0.9} /></mesh>
            </group>
          ))}
          <group ref={vat} position={[0, 2.75, -0.3]}>
            <mesh><planeGeometry args={[2.6, 1.5]} /><meshBasicMaterial map={tex.vat} transparent toneMapped={false} depthWrite={false} /></mesh>
            {[-0.55, 0.55].map((x, i) => (
              <mesh key={i} ref={(o) => { if (o) bars.current[i] = o }} position={[x, -0.4, 0.12]}>
                <boxGeometry args={[0.5, 1, 0.3]} /><meshPhysicalMaterial color={i ? '#3b82f6' : '#f59e0b'} metalness={0.3} roughness={0.25} clearcoat={1} emissive={i ? '#1d4ed8' : '#b45309'} emissiveIntensity={0.5} transparent opacity={0.95} />
              </mesh>
            ))}
          </group>
          <points geometry={taxP.pg} frustumCulled={false}><pointsMaterial map={spr} size={0.26} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
          {taxP.lines.map((l, i) => <primitive key={i} object={l} />)}
        </group>

        {/* audit view */}
        <group>
          {RECS.slice(0, nRecs).map((d, i) => (
            <group key={i} ref={(o) => { if (o) recs.current[i] = o }} position={[d.p[0], d.p[1], d.p[2]]} rotation={[0, -Math.atan2(d.p[0], 6) * 0.9, 0]}>
              <mesh><planeGeometry args={[1.5, 0.88]} /><meshBasicMaterial map={tex.rec[d.s]} transparent toneMapped={false} /></mesh>
              <sprite position={[0.55, 0.26, 0.05]} scale={[0.26, 0.26, 1]}><spriteMaterial map={spr} color={STATE_COL[d.s]} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
            </group>
          ))}
          <points geometry={audP.pg} frustumCulled={false}><pointsMaterial map={spr} size={0.26} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>
          {audP.lines.map((l, i) => <primitive key={i} object={l} />)}
          <primitive object={trail.line} />
          <sprite ref={head} scale={[0.5, 0.5, 1]}><spriteMaterial map={spr} color="#a5f3fc" transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        </group>
      </group>
      <Dust mobile={mobile} spr={spr} reduced={reduced} />
    </>
  )
}

function Dust({ mobile, spr, reduced }: { mobile: boolean; spr: THREE.Texture; reduced: boolean }) {
  const n = mobile ? 50 : 140, ref = useRef<THREE.Points>(null!)
  const geo = useMemo(() => { const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 16; a[i * 3 + 1] = Math.random() * 6 - 1; a[i * 3 + 2] = (Math.random() - 0.5) * 10 } const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(a, 3)); return gg }, [n])
  useFrame((_, dt) => { if (!reduced) ref.current.rotation.y += dt * 0.012 })
  useEffect(() => () => geo.dispose(), [geo])
  return <points ref={ref} geometry={geo}><pointsMaterial map={spr} size={0.07} color="#9cc7ff" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} /></points>
}

export default function AuditIntelScene({ active, ...p }: Props) {
  return (
    <Canvas dpr={[1, p.mobile ? 1.5 : 1.75]} camera={{ position: [0, 3.3, 11.4], fov: 36 }} gl={{ antialias: !p.mobile, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'} aria-hidden>
      <Stage {...p} />
    </Canvas>
  )
}
