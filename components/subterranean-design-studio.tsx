'use client'

import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Box,
  CircleAlert,
  Compass,
  Gauge,
  Layers3,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { estimateConcept, estimateFootprintArea, type BuildingSystems, type FinishKey, type FootprintKey, type LiftKey, type StairKey } from '@/lib/design-estimates'

const finishes: Array<{
  key: FinishKey
  label: string
  note: string
  color: string
  pattern: string
}> = [
  { key: 'reinforced-concrete', label: 'Cast concrete', note: 'Monolithic visual language', color: '#637e83', pattern: 'concrete' },
  { key: 'shotcrete', label: 'Shotcrete', note: 'Textured sprayed finish', color: '#9a8467', pattern: 'shotcrete' },
  { key: 'steel', label: 'Steel panels', note: 'Modular panel aesthetic', color: '#52677d', pattern: 'steel' },
  { key: 'masonry', label: 'Masonry', note: 'Coursed block aesthetic', color: '#8e695a', pattern: 'masonry' },
]

const roomTypes = ['Open living', 'Workshop', 'Storage', 'Wellness suite', 'Utility room']
const footprintOptions: Array<{ key: FootprintKey; label: string }> = [
  { key: 'rectangular', label: 'Rectangular' },
  { key: 'l-shaped', label: 'L-shaped' },
  { key: 'octagonal', label: 'Octagonal' },
  { key: 'circular', label: 'Circular' },
]
const amenityOptions = [
  { key: 'sleeping', label: 'Sleeping berth', color: '#a88962' },
  { key: 'seating', label: 'Lounge seating', color: '#8d9f79' },
  { key: 'workbench', label: 'Workbench', color: '#9d795e' },
  { key: 'storage', label: 'Storage unit', color: '#788c9c' },
  { key: 'water', label: 'Water station', color: '#6b9caa' },
  { key: 'air', label: 'Air panel', color: '#94a98b' },
  { key: 'controls', label: 'Control console', color: '#b5a66f' },
  { key: 'medical', label: 'Medical cabinet', color: '#a87570' },
] as const
const stairOptions: Array<{ key: StairKey; label: string; note: string }> = [
  { key: 'switchback', label: 'Switchback', note: 'Landings / compact plan study' },
  { key: 'straight', label: 'Straight run', note: 'Clear linear circulation study' },
  { key: 'sculptural-spiral', label: 'Spiral feature', note: 'Sculptural / never assume as sole egress' },
]
const liftOptions: Array<{ key: LiftKey; label: string; note: string }> = [
  { key: 'none', label: 'No lift concept', note: 'Stairs only; accessibility review still required' },
  { key: 'machine-room-less-regenerative', label: 'Gearless MRL · regenerative', note: 'Energy recovery + machine-room-less concept' },
  { key: 'hydraulic', label: 'Hydraulic passenger lift', note: 'Low-rise concept; energy + equipment trade-offs' },
  { key: 'platform', label: 'Vertical platform lift', note: 'Accessibility concept; route and code dependent' },
]
const powerOptions: Array<{ key: BuildingSystems['power']; label: string; note: string }> = [
  { key: 'grid-resilient', label: 'Grid + resilience', note: 'Critical-load and backup-power study' },
  { key: 'solar-storage', label: 'Solar + storage', note: 'Site/yield/interconnection dependent' },
  { key: 'hybrid-microgrid', label: 'Hybrid microgrid', note: 'Multiple sources; fuel and emissions review' },
]
const waterOptions: Array<{ key: BuildingSystems['water']; label: string; note: string }> = [
  { key: 'utility', label: 'Utility + monitoring', note: 'Utility quality and service subject to provider' },
  { key: 'treatment-reuse', label: 'Treatment + reuse', note: 'Permits, source, discharge, and health review' },
  { key: 'independent-treatment', label: 'Independent treatment', note: 'No potable supply or yield is guaranteed' },
]
const airOptions: Array<{ key: BuildingSystems['air']; label: string; note: string }> = [
  { key: 'monitored-ventilation', label: 'Monitored ventilation', note: 'Mechanical design / sensing study' },
  { key: 'filtered-heat-recovery', label: 'Filtered + heat recovery', note: 'Filter, humidity, and heat-recovery study' },
  { key: 'redundant-air-study', label: 'Redundant air systems', note: 'Independent backup / failure-mode study' },
]
const controlOptions: Array<{ key: BuildingSystems['controls']; label: string; note: string }> = [
  { key: 'manual-ready', label: 'Local + manual-ready', note: 'Local controls and human fallback concept' },
  { key: 'building-automation', label: 'Building automation', note: 'Sensors, alerts, and system integration study' },
  { key: 'integrated-resilience', label: 'Integrated resilience', note: 'Cross-system monitoring / fail-safe review' },
]
const defaultSystems: BuildingSystems = {
  power: 'grid-resilient',
  water: 'utility',
  air: 'monitored-ventilation',
  controls: 'manual-ready',
}
const collaborators = [
  { key: 'atlas', name: 'Atlas', title: 'The cartographer', symbol: 'A', color: '#d6bf83', description: 'Measured, spatial, quietly analytical.' },
  { key: 'luma', name: 'Luma', title: 'The lantern', symbol: 'L', color: '#94c9bc', description: 'Curious, warm, possibility-led.' },
  { key: 'morrow', name: 'Morrow', title: 'The field guide', symbol: 'M', color: '#cf987a', description: 'Grounded, practical, risk-aware.' },
] as const
const safetyItems = [
  'Carry geotechnical, groundwater, and drainage review into professional design.',
  'Require project-specific structural and code review by qualified professionals.',
  'Require engineered excavation protection, utility locating, and a competent-person review.',
  'Plan reviewed ventilation, egress, electrical safety, and any confined-space controls.',
  'Require a written worker-safety plan, training, PPE, and stop-work authority before site work.',
]

type SafetyItem = (typeof safetyItems)[number]
type CollaboratorKey = (typeof collaborators)[number]['key']
type SpeechRecognitionResult = { results: ArrayLike<ArrayLike<{ transcript: string }>> }
type BrowserSpeechRecognition = {
  lang: string
  interimResults: boolean
  onresult: ((event: SpeechRecognitionResult) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition
type Point3 = readonly [number, number, number]
type Color3 = readonly [number, number, number]
type AmenityKey = (typeof amenityOptions)[number]['key']
type PlacedAmenity = { id: string; kind: AmenityKey; x: number; y: number; level: number }

function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function downloadFile(name: string, content: string, type: string): void {
  const file = new Blob([content], { type })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function footprintPath(x: number, y: number, width: number, height: number, shape: FootprintKey): string {
  if (shape === 'circular') {
    const diameter = Math.min(width, height)
    const circleX = x + (width - diameter) / 2
    const circleY = y + (height - diameter) / 2
    return `M${circleX + diameter / 2} ${circleY}a${diameter / 2} ${diameter / 2} 0 1 1 0 ${diameter}a${diameter / 2} ${diameter / 2} 0 1 1 0 -${diameter}Z`
  }
  const points = shape === 'l-shaped'
    ? [[0, 0], [1, 0], [1, 0.55], [0.58, 0.55], [0.58, 1], [0, 1]]
    : shape === 'octagonal'
      ? [[0.22, 0], [0.78, 0], [1, 0.22], [1, 0.78], [0.78, 1], [0.22, 1], [0, 0.78], [0, 0.22]]
      : [[0, 0], [1, 0], [1, 1], [0, 1]]
  return points.map(([px, py], index) => `${index === 0 ? 'M' : 'L'}${x + px * width} ${y + py * height}`).join(' ') + 'Z'
}

function makeConceptSvg(
  floors: string[],
  finish: FinishKey,
  length: number,
  width: number,
  stairs: StairKey,
  lift: LiftKey,
  systems: BuildingSystems,
  footprint: FootprintKey,
  amenities: PlacedAmenity[],
): string {
  const finishData = finishes.find((item) => item.key === finish)!
  const roomWidth = 270 + ((length - 24) / 24) * 150
  const x = 350 - roomWidth / 2
  const levels = floors.map((room, index) => {
    const y = 101 + index * 74
    return `
      <g>
        <path d="${footprintPath(x, y, roomWidth, 58, footprint)}" fill="url(#${finishData.pattern})" stroke="${finishData.color}" stroke-width="2"/>
        <path d="M${x + 8} ${y + 49}h${roomWidth - 16}" stroke="#d9c6a7" stroke-opacity=".72"/>
        <text x="${x + 15}" y="${y + 24}" fill="#f4eee2" font-family="Arial,sans-serif" font-size="12" font-weight="600">${room}</text>
        <text x="${x + 15}" y="${y + 42}" fill="#bac6c1" font-family="monospace" font-size="9">LEVEL ${String(index + 1).padStart(2, '0')} / CONCEPT</text>
        ${amenities.filter((item) => item.level === index).map((item) => {
          const option = amenityOptions.find((candidate) => candidate.key === item.kind)!
          return `<rect x="${x + roomWidth * item.x - 5}" y="${y + 17 + item.y * 18}" width="10" height="10" rx="2" fill="${option.color}"/>`
        }).join('')}
      </g>`
  }).join('')
  const stairGlyph = stairs === 'straight'
    ? '<path d="M510 158h38v-12h38v-12h38v-12h38" fill="none" stroke="#d5bf84" stroke-width="3"/>'
    : stairs === 'sculptural-spiral'
      ? '<path d="M535 161c30-3 30-25 12-30s-27 12-14 22 30 0 23-16" fill="none" stroke="#d5bf84" stroke-width="3"/>'
      : '<path d="M510 160h38v-12h34v12h38v-12h34" fill="none" stroke="#d5bf84" stroke-width="3"/>'
  const stairMarks = floors.map((_, index) => {
    const y = 111 + index * 74
    return `<path d="M${510 + index % 2 * 24} ${y + 37}h35v-12h28" fill="none" stroke="#d5bf84" stroke-width="2" stroke-dasharray="4 3"/>`
  }).join('')
  const liftShaft = lift === 'none' ? '' : `
    <rect x="610" y="101" width="42" height="${floors.length * 74 - 16}" fill="#34454a" fill-opacity=".45" stroke="#9fc0bd" stroke-width="2"/>
    ${floors.map((_, index) => {
      const y = 111 + index * 74
      return `<rect x="616" y="${y + 5}" width="30" height="47" fill="#78918d" fill-opacity=".45" stroke="#d0ddd1" stroke-width="1"/><path d="M631 ${y + 7}v43" stroke="#d0ddd1" stroke-opacity=".55"/>`
    }).join('')}
  `
  const stairLevels = floors.map((_, index) => {
    const y = 111 + index * 74
    const path = stairs === 'straight'
      ? `M${x + 12} ${y + 47}h9v-8h9v-8h9v-8h9`
      : stairs === 'sculptural-spiral'
        ? `M${x + 17} ${y + 48}c18-2 19-19 7-21s-16 9-7 16 18 0 14-12`
        : `M${x + 10} ${y + 47}h13v-8h13v8h13v-8h9`
    return `<path d="${path}" fill="none" stroke="#d5bf84" stroke-width="2"/>`
  }).join('')
  const bottom = 101 + floors.length * 74 - 14
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 ${Math.max(420, bottom + 58)}" role="img" aria-labelledby="title desc">
    <title id="title">Subterranean concept section</title>
    <desc id="desc">Illustrative ${floors.length}-level ${footprint} concept using ${finishData.label}, ${stairs} stair, ${lift} lift, ${systems.power} power, ${systems.water} water, ${systems.air} air, and ${systems.controls} controls. ${amenities.length} concept amenities shown. Approximately ${length} by ${width} feet per level. Not for construction.</desc>
    <defs>
      <pattern id="concrete" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#39484a"/><path d="M-4 16L16 -4M4 20L20 4" stroke="#8aa0a0" stroke-opacity=".32"/></pattern>
      <pattern id="shotcrete" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#554a3d"/><circle cx="4" cy="5" r="1.6" fill="#bca782" fill-opacity=".62"/><circle cx="11" cy="10" r="1.1" fill="#d0c1a5" fill-opacity=".48"/></pattern>
      <pattern id="steel" width="24" height="20" patternUnits="userSpaceOnUse"><rect width="24" height="20" fill="#35424c"/><path d="M0 1h24M1 0v20M23 0v20" stroke="#92abb3" stroke-opacity=".48"/><circle cx="4" cy="5" r="1" fill="#c1c9c6"/></pattern>
      <pattern id="masonry" width="32" height="20" patternUnits="userSpaceOnUse"><rect width="32" height="20" fill="#59453e"/><path d="M0 1h32M0 19h32M16 1v9M8 10v9M28 10v9" stroke="#ba9d84" stroke-opacity=".58"/></pattern>
      <linearGradient id="ground" x2="0" y2="1"><stop stop-color="#25352e"/><stop offset="1" stop-color="#121d1c"/></linearGradient>
    </defs>
    <rect width="700" height="${Math.max(420, bottom + 58)}" fill="#111a1e"/>
    <path d="M0 83h700v${Math.max(300, bottom - 56)}H0z" fill="url(#ground)" opacity=".82"/>
    <path d="M35 84h630" stroke="#a6b28a" stroke-width="3"/>
    <path d="M42 90h616M50 98h600" stroke="#8b9b7c" stroke-opacity=".25"/>
    <path d="M93 83v30h24v${Math.max(36, (floors.length - 1) * 74 + 36)}h30" fill="none" stroke="#d4ba8d" stroke-width="3" stroke-dasharray="5 5"/>
    <path d="M91 82v-24h28v24" fill="none" stroke="#d4ba8d" stroke-width="2"/>
    <text x="42" y="43" fill="#d7dfd5" font-family="monospace" font-size="10" letter-spacing="1.2">CONCEPTUAL SECTION / NOT FOR CONSTRUCTION</text>
    <text x="42" y="${Math.max(145, bottom + 35)}" fill="#b7c2b9" font-family="monospace" font-size="10">${length} ft × ${width} ft / ${floors.length} LEVEL${floors.length > 1 ? 'S' : ''} / ${finishData.label.toUpperCase()}</text>
    <text x="${x + 8}" y="91" fill="#d7c996" font-family="monospace" font-size="8">${stairs.toUpperCase()} STAIR STUDY</text>
    ${stairGlyph}${stairMarks}${stairLevels}
    ${liftShaft}
    ${lift !== 'none' ? `<text x="610" y="${bottom + 13}" fill="#b5cbc4" font-family="monospace" font-size="8">${lift.toUpperCase()}</text>` : ''}
    ${levels}
  </svg>`
}

function SystemChoiceGroup<Key extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: Array<{ key: Key; label: string; note: string }>
  selected: Key
  onSelect: (key: Key) => void
}): React.JSX.Element {
  return (
    <div className="studio-access-group" role="group" aria-label={label}>
      <span className="studio-access-label">{label}</span>
      {options.map((option) => (
        <button key={option.key} className={`studio-access-option ${selected === option.key ? 'active' : ''}`} type="button" onClick={() => onSelect(option.key)} aria-pressed={selected === option.key}>
          <strong>{option.label}</strong><span>{option.note}</span>
        </button>
      ))}
    </div>
  )
}

function Walkthrough({ room, finish, stairs, lift, canEnterVr, onEnterVr }: {
  room: string
  finish: (typeof finishes)[number]
  stairs: (typeof stairOptions)[number]
  lift: (typeof liftOptions)[number]
  canEnterVr: boolean
  onEnterVr: () => void
}): React.JSX.Element {
  const [view, setView] = useState(0)
  return (
    <div className="studio-walkthrough">
      <div className="studio-walkthrough-header">
        <div><span className="eyebrow">IMMERSIVE PREVIEW / LEVEL {String(view + 1).padStart(2, '0')}</span><h3>{room}</h3></div>
        <span className="studio-status"><span /> SCREEN WALKTHROUGH</span>
      </div>
      <div className="studio-room-view" style={{ '--room-finish': finish.color } as React.CSSProperties} aria-label={`Illustrative screen walkthrough of a ${room.toLowerCase()} with ${finish.label.toLowerCase()} finishes`}>
        <div className="studio-room-back">
          <div className="studio-room-door"><span>PASSAGE</span></div>
          <div className={`studio-room-stair stair-${stairs.key}`} aria-hidden="true" />
          {lift.key !== 'none' && <div className="studio-room-lift" aria-label={`Conceptual ${lift.label}`}><span>LIFT</span></div>}
          <span className="studio-room-light" />
        </div>
        <div className="studio-room-floor" />
        <span className="studio-room-caption">CONCEPTUAL INTERIOR / FINISH APPEARANCE ONLY</span>
      </div>
      <div className="studio-walkthrough-controls">
        <button className="button small" type="button" onClick={() => setView((value) => (value + 2) % 3)} aria-label="Previous walkthrough viewpoint"><ArrowLeft size={14} /> Viewpoint</button>
        <span>View {view + 1} of 3 · {finish.label}</span>
        <button className="button small" type="button" onClick={() => setView((value) => (value + 1) % 3)} aria-label="Next walkthrough viewpoint">Viewpoint <ArrowRight size={14} /></button>
      </div>
      <p className="studio-footnote">Access concept: {stairs.label}{lift.key !== 'none' ? ` + ${lift.label}` : ''}. Lift cabling, controls, emergency operation, evacuation, power loss, accessibility, and code review require qualified specialists.</p>
      {canEnterVr ? (
        <WebXRButton onEnter={onEnterVr} />
      ) : (
        <p className="studio-vr-note">A compatible VR headset and a browser with WebXR support are required for head-tracked VR. This screen preview remains available on this device.</p>
      )}
    </div>
  )
}

type XrViewport = { x: number; y: number; width: number; height: number }
type XrView = {
  projectionMatrix: Float32Array
  transform: { inverse: { matrix: Float32Array } }
}
type XrReferenceSpace = object
type XrPose = { views: XrView[] }
type XrTransform = { matrix: Float32Array }
type XrInputSource = { targetRaySpace: object }
type XrFrame = {
  getViewerPose(space: XrReferenceSpace): XrPose | null
  getPose(space: object, baseSpace: XrReferenceSpace): { transform: XrTransform } | null
}
type XrSelectEvent = { frame: XrFrame; inputSource: XrInputSource }
type XrLayer = { framebuffer: WebGLFramebuffer | null; getViewport(view: XrView): XrViewport }
type XrSession = {
  inputSources: ArrayLike<XrInputSource>
  updateRenderState(state: { baseLayer: XrLayer }): void
  requestReferenceSpace(type: string): Promise<XrReferenceSpace>
  requestAnimationFrame(callback: (time: number, frame: XrFrame) => void): number
  end(): Promise<void>
  addEventListener(type: 'end', callback: () => void, options?: { once?: boolean }): void
  addEventListener(type: 'select', callback: (event: XrSelectEvent) => void): void
}
type XrSystem = {
  isSessionSupported(mode: 'immersive-vr'): Promise<boolean>
  requestSession(mode: 'immersive-vr', options?: { optionalFeatures?: string[] }): Promise<XrSession>
}
type XrCanvasContext = WebGLRenderingContext & { makeXRCompatible(): Promise<void> }
type XrLayerConstructor = new (session: XrSession, context: WebGLRenderingContext) => XrLayer
type WebXRSessionProps = {
  finish: (typeof finishes)[number]
  footprint: FootprintKey
  lengthFeet: number
  widthFeet: number
  rooms: string[]
  amenities: PlacedAmenity[]
  selectedLevel: number
  stairs: StairKey
  lift: LiftKey
  collaborator: CollaboratorKey
  voiceAllowed: boolean
  onClose: () => void
  onFinishChange: (finish: FinishKey) => void
  onRoomChange: (level: number, room: string) => void
  onLevelChange: (level: number) => void
  onAddFloor: () => void
  onWidthChange: (width: number) => void
  onCollaboratorChange: (collaborator: CollaboratorKey) => void
  onVoicePrompt: () => void
}

function xrSystem(): XrSystem | undefined {
  return (navigator as Navigator & { xr?: XrSystem }).xr
}

function multiplyMatrices(left: Float32Array, right: Float32Array): Float32Array {
  const result = new Float32Array(16)
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      for (let index = 0; index < 4; index += 1) {
        result[column * 4 + row] += left[index * 4 + row] * right[column * 4 + index]
      }
    }
  }
  return result
}

function appendEllipsoid(
  vertices: number[],
  center: Point3,
  radii: Point3,
  color: Color3,
  longitudes = 14,
  latitudes = 9,
): void {
  const point = (latitude: number, longitude: number): Point3 => {
    const phi = Math.PI * latitude / latitudes
    const theta = Math.PI * 2 * longitude / longitudes
    return [
      center[0] + radii[0] * Math.sin(phi) * Math.cos(theta),
      center[1] + radii[1] * Math.cos(phi),
      center[2] + radii[2] * Math.sin(phi) * Math.sin(theta),
    ]
  }
  const triangle = (first: Point3, second: Point3, third: Point3): void => {
    for (const vertex of [first, second, third]) vertices.push(...vertex, ...color)
  }
  for (let latitude = 0; latitude < latitudes; latitude += 1) {
    for (let longitude = 0; longitude < longitudes; longitude += 1) {
      const northWest = point(latitude, longitude)
      const northEast = point(latitude, longitude + 1)
      const southWest = point(latitude + 1, longitude)
      const southEast = point(latitude + 1, longitude + 1)
      triangle(northWest, southWest, northEast)
      triangle(northEast, southWest, southEast)
    }
  }
}

function roomVertices({
  color,
  activeFinish,
  collaboratorColor,
  rooms,
  selectedLevel,
  selectedRoom,
  lengthFeet,
  widthFeet,
  footprint,
  amenities,
  stairs,
  lift,
}: {
  color: Color3
  activeFinish: FinishKey
  collaboratorColor: Color3
  rooms: string[]
  selectedLevel: number
  selectedRoom: string
  lengthFeet: number
  widthFeet: number
  footprint: FootprintKey
  amenities: PlacedAmenity[]
  stairs: StairKey
  lift: LiftKey
}): Float32Array {
  const vertices: number[] = []
  const quad = (points: Point3[], tint: number, baseColor: Color3 = color): void => {
    const shaded: number[] = baseColor.map((channel) => Math.min(1, channel * tint))
    for (const index of [0, 1, 2, 0, 2, 3]) vertices.push(...points[index], ...shaded)
  }
  const wall: Color3 = [0.24, 0.31, 0.34]
  quad([[-4, 0, -5], [-4, 3.2, -5], [4, 3.2, -5], [4, 0, -5]], 0.74)
  quad([[-4, 0, 5], [-4, 3.2, 5], [4, 3.2, 5], [4, 0, 5]], 0.68)
  quad([[-4, 0, -5], [-4, 3.2, -5], [-4, 3.2, 5], [-4, 0, 5]], wall[0])
  quad([[4, 0, 5], [4, 3.2, 5], [4, 3.2, -5], [4, 0, -5]], wall[0])
  quad([[-4, 3.2, -5], [4, 3.2, -5], [4, 3.2, 5], [-4, 3.2, 5]], 0.5)
  quad([[-4, 0, 5], [4, 0, 5], [4, 0, -5], [-4, 0, -5]], 0.95)
  quad([[-0.7, 0, -4.98], [-0.7, 2.2, -4.98], [0.7, 2.2, -4.98], [0.7, 0, -4.98]], 0.3)
  const swatchX: number[] = [-2.4, -0.8, 0.8, 2.4]
  for (const [index, item] of finishes.entries()) {
    const swatch: Color3 = [
      parseInt(item.color.slice(1, 3), 16) / 255,
      parseInt(item.color.slice(3, 5), 16) / 255,
      parseInt(item.color.slice(5, 7), 16) / 255,
    ]
    const centerX = swatchX[index]
    quad([[centerX - 0.36, 2.25, -4.9], [centerX - 0.36, 2.83, -4.9], [centerX + 0.36, 2.83, -4.9], [centerX + 0.36, 2.25, -4.9]], 0.56, [0.75, 0.78, 0.7])
    quad([[centerX - 0.27, 2.34, -4.86], [centerX - 0.27, 2.74, -4.86], [centerX + 0.27, 2.74, -4.86], [centerX + 0.27, 2.34, -4.86]], item.key === activeFinish ? 1 : 0.66, swatch)
  }
  const roomSlots: number[] = [-3.2, -1.6, 0, 1.6, 3.2]
  for (const [index, room] of roomTypes.entries()) {
    const centerX = roomSlots[index]
    const selectedColor: Color3 = room === selectedRoom ? collaboratorColor : [0.34, 0.4, 0.36]
    quad([[centerX - 0.43, 1.34, -4.89], [centerX - 0.43, 1.9, -4.89], [centerX + 0.43, 1.9, -4.89], [centerX + 0.43, 1.34, -4.89]], 0.85, selectedColor)
    quad([[centerX - 0.32, 1.45, -4.84], [centerX - 0.32, 1.78, -4.84], [centerX + 0.32, 1.78, -4.84], [centerX + 0.32, 1.45, -4.84]], 1, selectedColor)
  }
  const firstVisibleLevel = Math.max(0, Math.min(rooms.length - 6, selectedLevel - 2))
  const visibleLevels = rooms.slice(firstVisibleLevel, firstVisibleLevel + 6)
  for (const [visibleIndex] of visibleLevels.entries()) {
    const centerZ = -2.85 + visibleIndex * 1.1
    const levelColor: Color3 = firstVisibleLevel + visibleIndex === selectedLevel ? collaboratorColor : [0.37, 0.46, 0.4]
    quad([[-3.96, 2.15, centerZ - 0.28], [-3.96, 2.15, centerZ + 0.28], [-3.96, 2.75, centerZ + 0.28], [-3.96, 2.75, centerZ - 0.28]], 0.72, levelColor)
  }
  const addAction = collaboratorColor
  const actionCenters: number[] = [-2.4, 0, 2.4]
  for (const centerX of actionCenters) {
    quad([[centerX - 0.36, 0.55, -4.89], [centerX - 0.36, 1.07, -4.89], [centerX + 0.36, 1.07, -4.89], [centerX + 0.36, 0.55, -4.89]], 0.62, [0.62, 0.67, 0.58])
  }
  quad([[-2.52, 0.68, -4.84], [-2.52, 0.94, -4.84], [-2.28, 0.94, -4.84], [-2.28, 0.68, -4.84]], 1, addAction)
  quad([[-0.12, 0.68, -4.84], [-0.12, 0.94, -4.84], [0.12, 0.94, -4.84], [0.12, 0.68, -4.84]], 1, collaboratorColor)
  quad([[2.28, 0.68, -4.84], [2.28, 0.94, -4.84], [2.52, 0.94, -4.84], [2.52, 0.68, -4.84]], 1, [0.78, 0.67, 0.42])
  appendEllipsoid(vertices, [2.45, 1.45, -1.15], [0.3, 0.38, 0.25], collaboratorColor)
  appendEllipsoid(vertices, [2.45, 2.02, -1.15], [0.23, 0.24, 0.21], collaboratorColor)
  const orbitColor: Color3 = [0.93, 0.84, 0.59]
  appendEllipsoid(vertices, [2.12, 1.99, -1.15], [0.045, 0.045, 0.045], orbitColor, 8, 6)
  appendEllipsoid(vertices, [2.76, 1.68, -1.15], [0.035, 0.035, 0.035], orbitColor, 8, 6)
  const footprintHex = `#${color.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`
  const concept = screenSceneVertices(footprint, footprintHex, amenities, selectedLevel, stairs, lift, lengthFeet, widthFeet)
  const scene = new Float32Array(vertices.length + concept.length)
  scene.set(vertices)
  scene.set(concept, vertices.length)
  return scene
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Your browser could not initialize the VR room shader.')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const reason = gl.getShaderInfoLog(shader) ?? 'Unknown shader error'
    gl.deleteShader(shader)
    throw new Error(`The VR room could not be rendered: ${reason}`)
  }
  return shader
}

function screenSceneVertices(
  shape: FootprintKey,
  finishColor: string,
  amenities: PlacedAmenity[],
  level: number,
  stairs: StairKey,
  lift: LiftKey,
  lengthFeet: number,
  widthFeet: number,
): Float32Array {
  const vertices: number[] = []
  const colorFromHex = (hex: string): Color3 => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
  const vertex = (point: Point3, color: Color3): void => vertices.push(...point, ...color)
  const triangle = (a: Point3, b: Point3, c: Point3, color: Color3): void => {
    vertex(a, color); vertex(b, color); vertex(c, color)
  }
  const quad = (a: Point3, b: Point3, c: Point3, d: Point3, color: Color3): void => {
    triangle(a, b, c, color); triangle(a, c, d, color)
  }
  const footprintScale = shape === 'circular' ? Math.min(lengthFeet, widthFeet) / 32 : undefined
  const lengthScale = footprintScale ?? lengthFeet / 32
  const widthScale = footprintScale ?? widthFeet / 32
  const outline: Array<[number, number]> = shape === 'l-shaped'
    ? [[-4, -4], [4, -4], [4, 0], [0, 0], [0, 4], [-4, 4]]
    : shape === 'octagonal'
      ? [[-2.4, -4], [2.4, -4], [4, -2.4], [4, 2.4], [2.4, 4], [-2.4, 4], [-4, 2.4], [-4, -2.4]]
      : shape === 'circular'
        ? Array.from({ length: 24 }, (_, index): [number, number] => {
          const angle = index * Math.PI * 2 / 24
          return [Math.cos(angle) * 4, Math.sin(angle) * 4]
        })
        : [[-4, -4], [4, -4], [4, 4], [-4, 4]]
  const wallColor: Color3 = colorFromHex(finishColor).map((channel) => channel * 0.55) as [number, number, number]
  const floorColor: Color3 = [0.31, 0.37, 0.32]
  for (let index = 0; index < outline.length; index += 1) {
    const [rawX1, rawZ1] = outline[index]
    const [rawX2, rawZ2] = outline[(index + 1) % outline.length]
    const x1 = rawX1 * lengthScale
    const z1 = rawZ1 * widthScale
    const x2 = rawX2 * lengthScale
    const z2 = rawZ2 * widthScale
    quad([x1, 0, z1], [x1, 3.2, z1], [x2, 3.2, z2], [x2, 0, z2], wallColor)
    if (index > 0) triangle([0, 0.06, 0], [x1, 0.06, z1], [x2, 0.06, z2], floorColor)
  }
  const addBox = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, color: Color3): void => {
    const scaledCx = cx * lengthScale
    const scaledCz = cz * widthScale
    const scaledSx = sx * lengthScale
    const scaledSz = sz * widthScale
    const x0 = scaledCx - scaledSx / 2, x1 = scaledCx + scaledSx / 2
    const y0 = cy, y1 = cy + sy
    const z0 = scaledCz - scaledSz / 2, z1 = scaledCz + scaledSz / 2
    quad([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], color)
    quad([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1], color)
    quad([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0], color)
    quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], color)
    quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], color)
    quad([x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], color)
  }
  const steps = stairs === 'straight' ? 8 : stairs === 'sculptural-spiral' ? 6 : 6
  for (let index = 0; index < steps; index += 1) {
    const angle = stairs === 'sculptural-spiral' ? index * 0.64 : 0
    const x = stairs === 'sculptural-spiral' ? Math.cos(angle) * 0.8 : -3.1 + (index % 2) * 1.2
    const z = stairs === 'sculptural-spiral' ? Math.sin(angle) * 0.8 : 2.8 - Math.floor(index / 2) * 0.9
    addBox(x, 0.12 + index * 0.1, z, 0.8, 0.12, 0.62, [0.68, 0.58, 0.39])
  }
  if (lift !== 'none') {
    addBox(2.9, 0.05, -2.8, 1.2, 3.05, 1.2, [0.28, 0.43, 0.42])
    addBox(2.9, 0.1, -2.8, 0.82, 1.9, 0.82, [0.55, 0.66, 0.62])
  }
  for (const item of amenities.filter((amenity) => amenity.level === level)) {
    const option = amenityOptions.find((candidate) => candidate.key === item.kind)
    if (!option) continue
    addBox(-3.1 + item.x * 6.2, 0.08, -3.1 + item.y * 6.2, 0.9, item.kind === 'air' || item.kind === 'controls' ? 1.15 : 0.7, 0.76, colorFromHex(option.color))
  }
  return new Float32Array(vertices)
}

function screenPerspective(aspect: number): Float32Array {
  const near = 0.1, far = 80, f = 1 / Math.tan(Math.PI / 7)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, 2 * far * near / (near - far), 0,
  ])
}

function screenView(yaw: number, pitch: number): Float32Array {
  const eye: Point3 = [Math.sin(yaw) * 13, 4 + pitch * 8, Math.cos(yaw) * 13]
  const target: Point3 = [0, 1.3, 0]
  const normalize = (vector: number[]): number[] => {
    const length = Math.hypot(...vector) || 1
    return vector.map((component) => component / length)
  }
  const cross = (a: number[], b: number[]): number[] => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]])
  const x = normalize(cross([0, 1, 0], z))
  const y = cross(z, x)
  const dot = (a: number[], b: Point3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ])
}

function Screen3DPreview({ finishColor, shape, amenities, level, stairs, lift, lengthFeet, widthFeet }: {
  finishColor: string
  shape: FootprintKey
  amenities: PlacedAmenity[]
  level: number
  stairs: StairKey
  lift: LiftKey
  lengthFeet: number
  widthFeet: number
}): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<() => void>(() => {})
  const rotationRef = useRef({ yaw: 0.6, pitch: 0.08 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { antialias: true, alpha: false })
    if (!canvas || !gl) {
      setError('This browser could not create the interactive 3D preview.')
      return
    }
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let vertexShader: WebGLShader | null = null
    let fragmentShader: WebGLShader | null = null
    try {
      vertexShader = createShader(gl, gl.VERTEX_SHADER, 'attribute vec3 position; attribute vec3 color; uniform mat4 projectionView; varying vec3 surfaceColor; void main(){surfaceColor=color;gl_Position=projectionView*vec4(position,1.0);}')
      fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, 'precision mediump float; varying vec3 surfaceColor; void main(){gl_FragColor=vec4(surfaceColor,1.0);}')
      program = gl.createProgram()
      buffer = gl.createBuffer()
      if (!program || !buffer) throw new Error('WebGL could not allocate the room preview.')
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'The 3D preview shader could not link.')
      gl.useProgram(program)
      const position = gl.getAttribLocation(program, 'position')
      const color = gl.getAttribLocation(program, 'color')
      const projectionView = gl.getUniformLocation(program, 'projectionView')
      gl.enableVertexAttribArray(position)
      gl.enableVertexAttribArray(color)
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0)
      gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 24, 12)
      gl.enable(gl.DEPTH_TEST)
      gl.disable(gl.CULL_FACE)
      const vertices = screenSceneVertices(shape, finishColor, amenities, level, stairs, lift, lengthFeet, widthFeet)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
      drawRef.current = () => {
        const rect = canvas.getBoundingClientRect()
        const ratio = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.max(1, Math.round(rect.width * ratio))
        canvas.height = Math.max(1, Math.round(rect.height * ratio))
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clearColor(0.055, 0.075, 0.07, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        const projectionView = multiplyMatrices(
          screenPerspective(canvas.width / Math.max(1, canvas.height)),
          screenView(rotationRef.current.yaw, rotationRef.current.pitch),
        )
        const uniform = gl.getUniformLocation(program, 'projectionView')
        gl.uniformMatrix4fv(uniform, false, projectionView)
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6)
      }
      drawRef.current()
      window.addEventListener('resize', drawRef.current)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The 3D preview could not be rendered.')
    }
    return () => {
      window.removeEventListener('resize', drawRef.current)
      drawRef.current = () => {}
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
    }
  }, [finishColor, shape, amenities, level, stairs, lift, lengthFeet, widthFeet])

  return (
    <div className="studio-3d-preview">
      <canvas
        ref={canvasRef}
        aria-label={`Interactive 3D concept preview, ${shape} room with ${amenities.filter((item) => item.level === level).length} placed amenities`}
        onPointerDown={(event) => { dragRef.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId) }}
        onPointerUp={() => { dragRef.current = null }}
        onPointerCancel={() => { dragRef.current = null }}
        onPointerMove={(event) => {
          const previous = dragRef.current
          if (!previous || event.buttons !== 1) return
          rotationRef.current.yaw += (event.clientX - previous.x) * 0.009
          rotationRef.current.pitch = Math.max(-0.16, Math.min(0.55, rotationRef.current.pitch + (event.clientY - previous.y) * 0.004))
          dragRef.current = { x: event.clientX, y: event.clientY }
          drawRef.current()
        }}
      />
      <span>REAL-TIME 3D CONCEPT / DRAG TO ORBIT / NOT FOR CONSTRUCTION</span>
      {error && <p className="studio-error" role="alert">{error}</p>}
    </div>
  )
}

function FloorPlanEditor({
  shape,
  finishColor,
  amenities,
  level,
  stairs,
  lift,
  lengthFeet,
  widthFeet,
  onPlace,
  onRemove,
}: {
  shape: FootprintKey
  finishColor: string
  amenities: PlacedAmenity[]
  level: number
  stairs: StairKey
  lift: LiftKey
  lengthFeet: number
  widthFeet: number
  onPlace: (event: React.DragEvent<SVGSVGElement>) => void
  onRemove: (id: string) => void
}): React.JSX.Element {
  const stairPath = stairs === 'straight'
    ? 'M92 197h16v-18h16v-18h16v-18h16'
    : stairs === 'sculptural-spiral'
      ? 'M98 195c28-3 30-31 11-35s-26 16-10 27 31 1 24-22'
      : 'M92 196h18v-16h18v16h18v-16h17'
  const levelAmenities = amenities.filter((item) => item.level === level)

  return (
    <div className="studio-floorplan-wrap">
      <div className="studio-panel-title"><span>DRAG ITEMS INTO THE FLOOR PLAN</span><Compass size={15} /></div>
      <p className="studio-footnote">Top-down illustration of Level {level + 1}. Drag a palette item into the outlined footprint to place it; select a placed marker to remove it. Stairs, lifts, room sizes, clearances, and egress shown here are not code or equipment specifications.</p>
      <svg
        className="studio-floorplan"
        viewBox="0 0 480 270"
        role="group"
        aria-label={`Interactive top-down concept floor plan, Level ${level + 1}, ${shape} footprint`}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }}
        onDrop={onPlace}
      >
        <defs>
          <pattern id="floorplan-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" stroke="#82917b" strokeOpacity=".12" strokeWidth=".6" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="480" height="270" fill="url(#floorplan-grid)" />
        <path d={footprintPath(40, 32, 400, 200, shape)} fill="#26342e" stroke={finishColor} strokeWidth="4" />
        <path d={stairPath} fill="none" stroke="#ddc38c" strokeWidth="3" strokeDasharray="5 3" />
        {lift !== 'none' && <g aria-label={`${liftOptions.find((item) => item.key === lift)?.label ?? 'Lift'} location concept`}>
          <rect x="350" y="54" width="48" height="48" rx="3" fill="#344b46" stroke="#9fc0bd" strokeWidth="2" />
          <path d="M374 59v38M355 78h38" stroke="#c0d7ca" strokeOpacity=".55" />
          <text x="374" y="115" textAnchor="middle" fill="#c0d7ca" fontFamily="monospace" fontSize="8">LIFT STUDY</text>
        </g>}
        {levelAmenities.map((item) => {
          const amenity = amenityOptions.find((option) => option.key === item.kind)
          if (!amenity) return null
          const x = 40 + item.x * 400
          const y = 32 + item.y * 200
          return (
            <g
              key={item.id}
              className="studio-floorplan-marker"
              role="button"
              tabIndex={0}
              aria-label={`Remove ${amenity.label} from Level ${level + 1}`}
              onClick={() => onRemove(item.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onRemove(item.id)
                }
              }}
            >
              <rect x={x - 8} y={y - 8} width="16" height="16" rx="3" fill={amenity.color} stroke="#f5edd9" strokeWidth="1.5" />
              <title>{amenity.label} — select to remove</title>
            </g>
          )
        })}
        <text x="18" y="257" fill="#aeb9ad" fontFamily="monospace" fontSize="9">{Math.round(estimateFootprintArea(lengthFeet, widthFeet, shape)).toLocaleString()} SQ FT / LEVEL · CONCEPT ONLY</text>
      </svg>
      <p className="studio-floorplan-legend"><span>STAIR STUDY</span><span>{lift === 'none' ? 'NO LIFT SELECTED' : 'LIFT LOCATION STUDY'}</span><span>{levelAmenities.length} PLACED ITEM{levelAmenities.length === 1 ? '' : 'S'}</span></p>
    </div>
  )
}

function WebXRButton({ onEnter }: { onEnter: () => void }): React.JSX.Element {
  return <button className="button studio-vr-button" type="button" onClick={onEnter}><Compass size={16} /> Enter headset VR</button>
}

function WebXRSession({
  finish,
  footprint,
  lengthFeet,
  widthFeet,
  rooms,
  amenities,
  selectedLevel,
  stairs,
  lift,
  collaborator,
  voiceAllowed,
  onClose,
  onFinishChange,
  onRoomChange,
  onLevelChange,
  onAddFloor,
  onWidthChange,
  onCollaboratorChange,
  onVoicePrompt,
}: WebXRSessionProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<XrSession | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const bufferRef = useRef<WebGLBuffer | null>(null)
  const vertexCountRef = useRef(0)
  const callbacksRef = useRef({
    onFinishChange,
    onRoomChange,
    onLevelChange,
    onAddFloor,
    onWidthChange,
    onCollaboratorChange,
    onVoicePrompt,
    onClose,
  })
  const sceneRef = useRef({ rooms, selectedLevel, collaborator, voiceAllowed, widthFeet })
  const [error, setError] = useState('')
  const [sceneStatus, setSceneStatus] = useState('Point and select a finish, room, or scene control.')

  useEffect(() => {
    callbacksRef.current = {
      onFinishChange,
      onRoomChange,
      onLevelChange,
      onAddFloor,
      onWidthChange,
      onCollaboratorChange,
      onVoicePrompt,
      onClose,
    }
  }, [onFinishChange, onRoomChange, onLevelChange, onAddFloor, onWidthChange, onCollaboratorChange, onVoicePrompt, onClose])

  useEffect(() => {
    sceneRef.current = { rooms, selectedLevel, collaborator, voiceAllowed, widthFeet }
  }, [rooms, selectedLevel, collaborator, voiceAllowed, widthFeet])

  useEffect(() => {
    const gl = glRef.current
    const buffer = bufferRef.current
    if (!gl || !buffer) return
    const collaboratorColor: Color3 = collaborator === 'atlas' ? [0.84, 0.75, 0.51]
      : collaborator === 'luma' ? [0.58, 0.79, 0.74]
        : [0.81, 0.6, 0.48]
    const vertices = roomVertices({
      color: [
        parseInt(finish.color.slice(1, 3), 16) / 255,
        parseInt(finish.color.slice(3, 5), 16) / 255,
        parseInt(finish.color.slice(5, 7), 16) / 255,
      ],
      activeFinish: finish.key,
      collaboratorColor,
      rooms,
      selectedLevel,
      selectedRoom: rooms[selectedLevel] ?? rooms[0] ?? 'Open living',
      lengthFeet,
      widthFeet,
      footprint,
      amenities,
      stairs,
      lift,
    })
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    vertexCountRef.current = vertices.length / 6
  }, [finish, lengthFeet, widthFeet, rooms, selectedLevel, collaborator, footprint, amenities, stairs, lift])

  const enterVr = async () => {
    setError('')
    const xr = xrSystem()
    const canvas = canvasRef.current
    if (!xr || !canvas) {
      setError('WebXR or the VR canvas is unavailable in this browser.')
      return
    }
    try {
      const gl = canvas.getContext('webgl', { antialias: true, alpha: false }) as XrCanvasContext | null
      const Layer = (window as Window & { XRWebGLLayer?: XrLayerConstructor }).XRWebGLLayer
      if (!gl || !Layer) throw new Error('This browser does not provide a compatible WebGL headset renderer.')
      await gl.makeXRCompatible()
      const session = await xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] })
      sessionRef.current = session
      const layer = new Layer(session, gl)
      session.updateRenderState({ baseLayer: layer })
      let space: XrReferenceSpace
      try {
        space = await session.requestReferenceSpace('local-floor')
      } catch {
        space = await session.requestReferenceSpace('local')
      }

      const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
        attribute vec3 position;
        attribute vec3 color;
        uniform mat4 projectionView;
        varying vec3 surfaceColor;
        void main() { surfaceColor = color; gl_Position = projectionView * vec4(position, 1.0); }
      `)
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
        precision mediump float;
        varying vec3 surfaceColor;
        void main() { gl_FragColor = vec4(surfaceColor, 1.0); }
      `)
      const program = gl.createProgram()
      if (!program) throw new Error('Your browser could not create the VR room.')
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'The VR room shader could not link.')
      const initialCollaboratorColor: Color3 = collaborator === 'atlas' ? [0.84, 0.75, 0.51]
        : collaborator === 'luma' ? [0.58, 0.79, 0.74]
          : [0.81, 0.6, 0.48]
      const vertices = roomVertices({
        color: [
          parseInt(finish.color.slice(1, 3), 16) / 255,
          parseInt(finish.color.slice(3, 5), 16) / 255,
          parseInt(finish.color.slice(5, 7), 16) / 255,
        ],
        activeFinish: finish.key,
        collaboratorColor: initialCollaboratorColor,
        rooms,
        selectedLevel,
        selectedRoom: rooms[selectedLevel] ?? rooms[0] ?? 'Open living',
        lengthFeet,
        widthFeet,
        footprint,
        amenities,
        stairs,
        lift,
      })
      const buffer = gl.createBuffer()
      if (!buffer) throw new Error('Your browser could not allocate the VR room geometry.')
      glRef.current = gl
      bufferRef.current = buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
      gl.useProgram(program)
      const position = gl.getAttribLocation(program, 'position')
      const color = gl.getAttribLocation(program, 'color')
      const projectionView = gl.getUniformLocation(program, 'projectionView')
      gl.enableVertexAttribArray(position)
      gl.enableVertexAttribArray(color)
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0)
      gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 24, 12)
      gl.enable(gl.DEPTH_TEST)
      gl.disable(gl.CULL_FACE)
      session.addEventListener('select', (event) => {
        const matrix = event.frame.getPose(event.inputSource.targetRaySpace, space)?.transform.matrix
        if (!matrix) return
        const intersectPlane = (z: number): Point3 | undefined => {
          const directionZ = -matrix[10]
          if (Math.abs(directionZ) < 0.0001) return undefined
          const distance = (z - matrix[14]) / directionZ
          if (distance <= 0) return undefined
          return [
            matrix[12] - matrix[8] * distance,
            matrix[13] - matrix[9] * distance,
            z,
          ]
        }
        const materialPoint = intersectPlane(-3.8)
        if (materialPoint && materialPoint[1] >= 2.15 && materialPoint[1] <= 2.95) {
          const swatchX: number[] = [-2.4, -0.8, 0.8, 2.4]
          const materialIndex = swatchX.findIndex((center) => Math.abs(materialPoint[0] - center) < 0.43)
          if (materialIndex >= 0) {
            callbacksRef.current.onFinishChange(finishes[materialIndex].key)
            setSceneStatus(`Finish concept changed to ${finishes[materialIndex].label}.`)
            return
          }
        }
        if (materialPoint && materialPoint[1] >= 1.3 && materialPoint[1] <= 1.95) {
          const roomSlots: number[] = [-3.2, -1.6, 0, 1.6, 3.2]
          const roomIndex = roomSlots.findIndex((center) => Math.abs(materialPoint[0] - center) < 0.47)
          if (roomIndex >= 0) {
            callbacksRef.current.onRoomChange(sceneRef.current.selectedLevel, roomTypes[roomIndex])
            setSceneStatus(`Level ${sceneRef.current.selectedLevel + 1} concept set to ${roomTypes[roomIndex]}.`)
            return
          }
        }
        if (materialPoint && materialPoint[1] >= 0.5 && materialPoint[1] <= 1.1) {
          if (materialPoint[0] < -1.6) {
            callbacksRef.current.onAddFloor()
            setSceneStatus('Added a conceptual level. The design and planning allowances are updating.')
            return
          }
          if (materialPoint[0] > 1.6) {
            callbacksRef.current.onWidthChange(Math.min(32, sceneRef.current.widthFeet + 4))
            setSceneStatus('Widened the concept. The cross-section and planning allowances are updating.')
            return
          }
          if (sceneRef.current.voiceAllowed) {
            callbacksRef.current.onVoicePrompt()
            setSceneStatus('Listening for a voice prompt. Your browser may process voice input through its speech provider.')
          } else {
            setSceneStatus('Enable the voice-processing acknowledgement in the collaborator panel before headset voice prompts.')
          }
          return
        }
        const levelPoint = (() => {
          const directionX = -matrix[8]
          if (Math.abs(directionX) < 0.0001) return undefined
          const distance = (-3.92 - matrix[12]) / directionX
          if (distance <= 0) return undefined
          return [
            matrix[13] - matrix[9] * distance,
            matrix[14] - matrix[10] * distance,
          ] as const
        })()
        if (levelPoint && levelPoint[0] >= 2.05 && levelPoint[0] <= 2.85) {
          const { rooms: currentRooms, selectedLevel: currentLevel } = sceneRef.current
          const firstVisibleLevel = Math.max(0, Math.min(currentRooms.length - 6, currentLevel - 2))
          const visibleLevels = currentRooms.slice(firstVisibleLevel, firstVisibleLevel + 6)
          const levelIndex = visibleLevels.findIndex((_, index) => Math.abs(levelPoint[1] - (-2.85 + index * 1.1)) < 0.36)
          if (levelIndex >= 0) {
            callbacksRef.current.onLevelChange(firstVisibleLevel + levelIndex)
            setSceneStatus(`Selected conceptual level ${firstVisibleLevel + levelIndex + 1}. Choose its room program from the back-wall controls.`)
            return
          }
        }
        const hologramPoint = intersectPlane(-1.15)
        if (hologramPoint && hologramPoint[0] > 1.9 && hologramPoint[0] < 3 && hologramPoint[1] > 1.25 && hologramPoint[1] < 2.5) {
          const collaboratorIndex = collaborators.findIndex((item) => item.key === sceneRef.current.collaborator)
          const nextCollaborator = collaborators[(collaboratorIndex + 1) % collaborators.length]
          callbacksRef.current.onCollaboratorChange(nextCollaborator.key)
          setSceneStatus(`Hologram appearance changed to ${nextCollaborator.name}.`)
          return
        }
        setSceneStatus("Point at the wall's material swatches or room program chips to make a live concept change.")
      })
      session.addEventListener('end', () => {
        sessionRef.current = null
        glRef.current = null
        bufferRef.current = null
        vertexCountRef.current = 0
        callbacksRef.current.onClose()
      }, { once: true })

      const renderFrame = (_time: number, frame: XrFrame) => {
        const pose = frame.getViewerPose(space)
        if (pose) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer)
          gl.clearColor(0.025, 0.045, 0.05, 1)
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          for (const view of pose.views) {
            const viewport = layer.getViewport(view)
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height)
            gl.uniformMatrix4fv(projectionView, false, multiplyMatrices(view.projectionMatrix, view.transform.inverse.matrix))
            gl.drawArrays(gl.TRIANGLES, 0, vertexCountRef.current)
          }
        }
        session.requestAnimationFrame(renderFrame)
      }
      session.requestAnimationFrame(renderFrame)
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : 'The VR session could not start. Check headset and browser support.'
      const session = sessionRef.current
      sessionRef.current = null
      if (session) {
        try {
          await session.end()
        } catch (cleanupError) {
          const cleanupReason = cleanupError instanceof Error ? cleanupError.message : 'unknown session cleanup error'
          setError(`${reason} The partially started VR session could not be cleanly closed: ${cleanupReason}`)
          return
        }
      }
      setError(reason)
    }
  }

  useEffect(() => () => {
    void sessionRef.current?.end()
    glRef.current = null
    bufferRef.current = null
    vertexCountRef.current = 0
  }, [])

  return (
    <div className="studio-xr" role="dialog" aria-modal="true" aria-labelledby="studio-xr-title">
      <div className="studio-xr-header">
        <div><span className="eyebrow">WEBXR / LIVE CONCEPT PREVIEW</span><h3 id="studio-xr-title">Step inside the room</h3></div>
        <button className="studio-icon-button" type="button" onClick={() => { void sessionRef.current?.end(); onClose() }} aria-label="Close VR walkthrough"><X size={18} /></button>
      </div>
      <canvas ref={canvasRef} className="studio-xr-canvas" aria-label="Headset-rendered conceptual room" />
      <div className="studio-xr-copy">
        <p>This headset scene is an unengineered spatial concept. Point at upper wall swatches for finishes; the middle chips change the selected level’s room. The low left control adds a level, the low right control widens the concept, the low middle control starts voice only after acknowledgement, and selecting the hologram changes its appearance.</p>
        <p role="status">{sceneStatus}</p>
        <p>This is a single-device session. Invitations, remote participants, shared speech, and an LLM collaborator are not connected in this prototype.</p>
        <p>This is not a safety, structural, or construction demonstration.</p>
        {error && <p className="studio-error" role="alert">{error}</p>}
        <button className="button primary" type="button" onClick={() => void enterVr()}><Compass size={15} /> Start immersive VR</button>
      </div>
    </div>
  )
}

export default function SubterraneanDesignStudio(): React.JSX.Element {
  const [finish, setFinish] = useState<FinishKey>('reinforced-concrete')
  const [footprint, setFootprint] = useState<FootprintKey>('rectangular')
  const [stairs, setStairs] = useState<StairKey>('switchback')
  const [lift, setLift] = useState<LiftKey>('none')
  const [systems, setSystems] = useState<BuildingSystems>(defaultSystems)
  const [placedAmenities, setPlacedAmenities] = useState<PlacedAmenity[]>([])
  const [amenityStatus, setAmenityStatus] = useState('')
  const [length, setLength] = useState(32)
  const [width, setWidth] = useState(20)
  const [rooms, setRooms] = useState<string[]>(['Open living'])
  const [selectedLevel, setSelectedLevel] = useState(0)
  const [safetyConfirmed, setSafetyConfirmed] = useState<SafetyItem[]>([])
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [vrOpen, setVrOpen] = useState(false)
  const [vrSupported, setVrSupported] = useState(false)
  const [collaborator, setCollaborator] = useState<CollaboratorKey>('atlas')
  const [voiceStyle, setVoiceStyle] = useState<'warm' | 'measured' | 'bright'>('measured')
  const [movement, setMovement] = useState<'orbit' | 'hover' | 'guide'>('orbit')
  const [systemVoice, setSystemVoice] = useState('')
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voicePermission, setVoicePermission] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [exportStatus, setExportStatus] = useState('')
  const [exportError, setExportError] = useState('')
  const [geniePrompt, setGeniePrompt] = useState('')
  const [genieReply, setGenieReply] = useState('I can explore the concept with you. Try a finish, a room program, a wider footprint, or one more level. I will keep unverified site and safety questions visible.')
  const finishData = finishes.find((item) => item.key === finish)!
  const collaboratorData = collaborators.find((item) => item.key === collaborator)!
  const estimate = useMemo(() => estimateConcept({
    finish,
    footprint,
    lengthFeet: length,
    widthFeet: width,
    floors: rooms.length,
    stairs,
    lift,
    systems,
  }), [finish, footprint, length, width, rooms.length, stairs, lift, systems])
  const risks = [
    'Soil profile, seasonal groundwater, drainage, and nearby utilities are unknown and need site-specific review.',
    ...(rooms.length > 1 ? ['Multi-level below-grade concepts can increase excavation, shoring, access, and egress complexity.'] : []),
    ...(stairs === 'sculptural-spiral' ? ['A spiral feature stair is not assumed to satisfy required egress, accessibility, or emergency movement; assess a separate compliant route with the project team.'] : []),
    ...(lift !== 'none' ? ['Lift reliability, emergency operation, flood exposure, power loss, rescue access, accessibility, and approved egress need coordinated specialist review; a lift is not assumed to replace stairs.'] : []),
    'Seismic design depends on the site-specific hazard, soil response, groundwater, structural system, connections, and applicable standards; no seismic suitability is calculated here.',
    'Selected material appearance does not compare actual unit weight or structural strength. A licensed structural engineer must evaluate dead load, seismic mass, capacities, connections, durability, and ground interaction using verified product data.',
    ...(systems.power !== 'grid-resilient' ? ['On-site generation and storage do not establish energy independence: model site yield, critical loads, duration, fuel or storage limits, interconnection, fire protection, and maintenance with qualified specialists.'] : []),
    ...(systems.water !== 'utility' ? ['Water treatment/reuse selection does not establish potable water: source analysis, treatment train, testing, permits, monitoring, backflow, and waste-stream management require qualified review.'] : []),
    'Below-grade ventilation, filtration, humidity, air-quality monitoring, power-loss response, and emergency operation need a mechanical engineer and applicable life-safety review.',
    ...(estimate.area > 900 ? ['Larger footprints may change equipment access, spoil handling, logistics, and construction sequencing.'] : []),
    'The selected finish is a visual concept only; it does not establish structural capacity, fire rating, waterproofing, or code compliance.',
  ]
  const safetyReady = safetyConfirmed.length === safetyItems.length

  useEffect(() => {
    let active = true
    const xr = xrSystem()
    if (!xr) return
    void xr.isSessionSupported('immersive-vr').then((supported) => {
      if (active) setVrSupported(supported)
    }).catch(() => {
      if (active) setVrSupported(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const speech = window.speechSynthesis
    const refreshVoices = () => setSystemVoices(speech.getVoices())
    refreshVoices()
    speech.addEventListener('voiceschanged', refreshVoices)
    return () => speech.removeEventListener('voiceschanged', refreshVoices)
  }, [])

  const addFloor = (): void => setRooms((current) => [...current, 'Open living'])
  const removeFloor = (): void => {
    setRooms((current) => current.length > 1 ? current.slice(0, -1) : current)
    setSelectedLevel((current) => Math.min(current, rooms.length - 2))
  }
  const isInsideFootprint = (x: number, y: number): boolean => {
    if (footprint === 'l-shaped') return x <= 0.58 || y <= 0.55
    if (footprint === 'circular') {
      const pointX = (x - 0.5) * length
      const pointY = (y - 0.5) * width
      const radius = Math.min(length, width) / 2
      return pointX ** 2 + pointY ** 2 <= radius ** 2
    }
    if (footprint === 'octagonal') return Math.abs(x - 0.5) + Math.abs(y - 0.5) <= 0.92
    return true
  }
  const placeAmenity = (kind: AmenityKey, x: number, y: number): void => {
    if (!isInsideFootprint(x, y)) {
      setAmenityStatus('Place amenities within the selected room outline.')
      return
    }
    setPlacedAmenities((current) => [...current, { id: crypto.randomUUID(), kind, x, y, level: selectedLevel }])
    setAmenityStatus(`${amenityOptions.find((item) => item.key === kind)?.label ?? 'Amenity'} added to Level ${selectedLevel + 1}.`)
  }
  const addAmenity = (kind: AmenityKey): void => {
    const candidateSlots: Array<[number, number]> = [[0.25, 0.25], [0.72, 0.25], [0.25, 0.72], [0.48, 0.42], [0.72, 0.72]]
    const slot = candidateSlots.find(([x, y]) => isInsideFootprint(x, y)) ?? [0.25, 0.25]
    placeAmenity(kind, slot[0], slot[1])
  }
  const dropAmenity = (event: React.DragEvent<SVGSVGElement>): void => {
    event.preventDefault()
    const key = event.dataTransfer.getData('text/plain')
    const amenity = amenityOptions.find((item) => item.key === key)
    if (!amenity) {
      setAmenityStatus('Choose an amenity from the palette before dropping it.')
      return
    }
    const transform = event.currentTarget.getScreenCTM()
    if (!transform) {
      setAmenityStatus('The floor plan is not ready for item placement. Try again.')
      return
    }
    const point = event.currentTarget.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const svgPoint = point.matrixTransform(transform.inverse())
    placeAmenity(amenity.key, (svgPoint.x - 40) / 400, (svgPoint.y - 32) / 200)
  }
  const askGenie = (rawPrompt: string): void => {
    const prompt = rawPrompt.trim()
    if (!prompt) return
    const lower = prompt.toLowerCase()
    setVoiceError('')
    setGeniePrompt('')

    let response: string
    const levelRequest = lower.match(/\b(?:level|floor)\s+(\d+)\b/)
    const requestedLevel = levelRequest ? Number(levelRequest[1]) - 1 : undefined
    if (requestedLevel !== undefined) {
      if (!Number.isSafeInteger(requestedLevel) || requestedLevel < 0 || requestedLevel >= rooms.length) {
        setGenieReply(`This concept currently has ${rooms.length} level${rooms.length === 1 ? '' : 's'}. Add a level first or select an existing level from the browser controls. No site depth is implied by the level count.`)
        return
      }
      setSelectedLevel(requestedLevel)
    }
    const requestedFinish = lower.includes('shotcrete') || lower.includes('sprayed finish')
      ? finishes.find((item) => item.key === 'shotcrete')
      : lower.includes('steel')
        ? finishes.find((item) => item.key === 'steel')
        : lower.includes('masonry') || lower.includes('brick') || lower.includes('block')
          ? finishes.find((item) => item.key === 'masonry')
          : lower.includes('concrete')
            ? finishes.find((item) => item.key === 'reinforced-concrete')
            : undefined

    if (requestedFinish) {
      setFinish(requestedFinish.key)
      response = `I switched the visual study to ${requestedFinish.label}. The finish selection updates the speculative allowance and the walkthrough immediately. It does not establish structural suitability, waterproofing, fire performance, or code compliance.`
    } else if (requestedLevel !== undefined && !roomTypes.some((room) => lower.includes(room.toLowerCase().split(' ')[0]))) {
      response = `I selected Level ${requestedLevel + 1}. Choose its room program in the browser or point to a room chip in the headset. Levels are conceptual and do not indicate a safe excavation depth.`
    } else if (lower.includes('add a level') || lower.includes('another level') || lower.includes('another floor') || lower.includes('deeper') || lower.includes('add a floor')) {
      addFloor()
      response = `I added a conceptual level. That increases the modeled area, labor allowance, and schedule range. Multi-level below-grade design adds excavation, groundwater, shoring, egress, and worker-safety questions that need site-specific professional review.`
    } else if ((lower.includes('remove') || lower.includes('fewer')) && (lower.includes('level') || lower.includes('floor'))) {
      if (rooms.length === 1) {
        response = 'This concept is already at one level. We can make that level smaller instead. Any depth or placement decision still needs survey, soil, groundwater, utility, and qualified safety review.'
      } else {
        removeFloor()
        response = 'I removed the deepest conceptual level. The planning allowances update with the smaller program. This is a visualization change, not a site or safety determination.'
      }
    } else if (lower.includes('workshop') || lower.includes('storage') || lower.includes('wellness') || lower.includes('utility') || lower.includes('living')) {
      const selectedRoom = roomTypes.find((room) => lower.includes(room.toLowerCase().split(' ')[0])) ?? 'Open living'
      const targetLevel = requestedLevel ?? selectedLevel
      setRooms((current) => current.map((room, index) => index === targetLevel ? selectedRoom : room))
      response = `I changed Level ${String(targetLevel + 1).padStart(2, '0')} to ${selectedRoom}. That is a room-program sketch only; utilities, ventilation, egress, accessibility, and code requirements need qualified design.`
    } else if (lower.includes('wider') || lower.includes('width')) {
      setWidth((current) => Math.min(32, current + 4))
      response = width >= 32
        ? 'This concept is already at the largest width control. A broader footprint could affect access, excavation logistics, drainage, and cost; a site team would need to study it.'
        : `I widened the concept by 4 feet. The area, labor, and cost ranges update immediately. Actual usable space and constructability depend on site conditions and engineered design.`
    } else if (lower.includes('longer') || lower.includes('length')) {
      setLength((current) => Math.min(48, current + 4))
      response = length >= 48
        ? 'This concept is already at the largest length control. More area could affect access, logistics, and cost; a site team would need to study it.'
        : 'I extended the concept by 4 feet. The area, labor, and cost ranges update immediately. This remains a schematic—not a dimensioned plan for construction.'
    } else if (lower.includes('risk') || lower.includes('safe') || lower.includes('groundwater') || lower.includes('soil') || lower.includes('worker')) {
      response = 'I cannot clear a below-grade design as safe from a browser concept. Soil and groundwater, drainage, structural loads, utilities, shoring, ventilation, access, code, and worker protection remain unresolved. Require qualified site-specific design and a written safety plan before any work.'
    } else if (lower.includes('cost') || lower.includes('price') || lower.includes('budget') || lower.includes('labor') || lower.includes('schedule')) {
      response = `The current illustrative model is ${money(estimate.totalLow)}–${money(estimate.totalHigh)} including a separate 15% design-development reserve, with ${estimate.laborLowHours.toLocaleString()}–${estimate.laborHighHours.toLocaleString()} assumed labor-hours. These are invented planning allowances—not researched local rates or a quote. Site, engineering, approvals, procurement, and crew bids can change them substantially.`
    } else {
      response = `For this ${rooms.length}-level, ${estimate.area.toLocaleString()} sq ft concept, the next useful question is what you want to change: finish, room program, footprint, or another level. Unknown site conditions and worker safety cannot be solved by this prototype; I will keep those review gates visible.`
    }
    setGenieReply(response)
  }
  const speakGenieReply = (): void => {
    if (!('speechSynthesis' in window)) {
      setVoiceError('Spoken responses are not supported in this browser.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(genieReply)
    utterance.pitch = voiceStyle === 'warm' ? 0.88 : voiceStyle === 'bright' ? 1.2 : 1
    utterance.rate = voiceStyle === 'warm' ? 0.92 : voiceStyle === 'bright' ? 1.08 : 0.96
    utterance.voice = systemVoices.find((voice) => voice.name === systemVoice) ?? null
    window.speechSynthesis.speak(utterance)
  }
  const startVoicePrompt = (): void => {
    setVoiceError('')
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setVoiceError('Spoken prompts are not supported in this browser. You can use the text prompt instead.')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const spokenPrompt = event.results[0]?.[0]?.transcript
      if (spokenPrompt) askGenie(spokenPrompt)
    }
    recognition.onerror = (event) => setVoiceError(`Voice input could not be transcribed (${event.error}). Try a text prompt instead.`)
    try {
      recognition.start()
    } catch (caught) {
      setVoiceError(caught instanceof Error ? caught.message : 'The browser could not start voice input. Use the text prompt instead.')
    }
  }

  const downloadSpecs = () => {
    if (!safetyReady) return
    const weeksLow = 10 + rooms.length * 3
    const weeksHigh = 20 + rooms.length * 8
    const specs = [
      '# Subterranean concept brief',
      '',
      '> CONCEPT ONLY — NOT A BLUEPRINT, PERMIT SET, ENGINEERING DOCUMENT, BID, OR CONSTRUCTION INSTRUCTION.',
      '> This browser-generated study is speculative. It does not certify safety, site suitability, code compliance, performance, or worker protection.',
      '',
      '## Design snapshot',
      `- Concept footprint: ${length} ft × ${width} ft per level`,
      `- Plan shape concept: ${footprintOptions.find((item) => item.key === footprint)!.label} (the displayed room outline is schematic, not a surveyed net area)`,
      `- Levels: ${rooms.length}`,
      `- Concept area: ${estimate.area.toLocaleString()} sq ft`,
      `- Room program: ${rooms.map((room, index) => `Level ${index + 1}: ${room}`).join('; ')}`,
      `- Visual finish: ${estimate.finish}`,
      `- Stair concept: ${stairOptions.find((item) => item.key === stairs)!.label}`,
      `- Lift concept: ${liftOptions.find((item) => item.key === lift)!.label}`,
      `- Power concept: ${powerOptions.find((item) => item.key === systems.power)!.label}`,
      `- Water concept: ${waterOptions.find((item) => item.key === systems.water)!.label}`,
      `- Air concept: ${airOptions.find((item) => item.key === systems.air)!.label}`,
      `- Controls concept: ${controlOptions.find((item) => item.key === systems.controls)!.label}`,
      `- Interior planning markers: ${placedAmenities.length === 0 ? 'none placed' : placedAmenities.map((item) => `${amenityOptions.find((option) => option.key === item.kind)!.label} on level ${item.level + 1}`).join(', ')}`,
      '- Site location: not collected by this browser-only studio',
      '',
      '## Materials and systems to review',
      `- Selected visual finish concept: ${estimate.finish}. Appearance selection does not establish structural suitability.`,
      `- Access study: ${stairOptions.find((item) => item.key === stairs)!.label} stair; ${liftOptions.find((item) => item.key === lift)!.label}. This is not a lift specification or egress/accessibility determination.`,
      '- Emerging-system review prompts only: regenerative drives, machine-room-less arrangements, remote diagnostics, emergency communications, backup-power interfaces, and accessibility controls. A qualified lift consultant must determine suitability, availability, compatibility, and applicable standards for the site.',
      `- Power: ${powerOptions.find((item) => item.key === systems.power)!.label}. Assess verified load profile, critical circuits, generation/storage yields, interconnection, backup duration, fire protection, emissions, controls, and maintenance; no self-powering claim is made.`,
      `- Water: ${waterOptions.find((item) => item.key === systems.water)!.label}. Assess source quality, treatment objectives, independent testing, permits, monitoring, backflow prevention, residuals, and maintenance; potability is not determined.`,
      `- Air: ${airOptions.find((item) => item.key === systems.air)!.label}. A mechanical engineer must design and validate ventilation, filtration, humidity management, air-quality monitoring, redundancy, and loss-of-power response.`,
      `- Controls: ${controlOptions.find((item) => item.key === systems.controls)!.label}. Review cybersecurity, local/manual operation, alarms, fail-safe states, emergency overrides, sensor reliability, and maintenance access.`,
      '- Structural/seismic review: obtain site-specific geotechnical and seismic hazard information. Compare actual material density/self-weight, verified strength data, seismic mass, ground/structural interaction, connections, corrosion/durability, and applicable design requirements with licensed engineers; this concept performs no calculations.',
      '- Engineered structure, reinforcement/connection schedule, waterproofing, drainage, fire protection, and code-approved egress: to be specified by qualified project professionals.',
      '- Ventilation, electrical, plumbing, backup power, and other services: scope and performance not determined in this concept.',
      '',
      '## Speculative cost and labor allowances',
      `- Construction allowance: ${money(estimate.constructionLow)}–${money(estimate.constructionHigh)}.`,
      `- Stair/lift concept allowance: ${money(estimate.accessLow)}–${money(estimate.accessHigh)}. ${estimate.accessBasis}`,
      `- Building systems allowance: ${money(estimate.systemsLow)}–${money(estimate.systemsHigh)}. ${estimate.systemsBasis}`,
      `- Separate design-development allowance (${Math.round(estimate.designFeePercent * 100)}% planning assumption): ${money(estimate.designFeeLow)}–${money(estimate.designFeeHigh)}.`,
      `- Combined preliminary allowance: ${money(estimate.totalLow)}–${money(estimate.totalHigh)}.`,
      `- Illustrative labor effort: ${estimate.laborLowHours.toLocaleString()}–${estimate.laborHighHours.toLocaleString()} labor-hours; not a crew schedule or wage quote.`,
      '- Allowances are illustrative model inputs, not researched local market rates, bids, vendor quotes, or a promise of project cost. Excludes unknown site conditions and may not include permits, land, financing, taxes, professional fees beyond the design reserve, escalation, or extraordinary utility work.',
      '',
      '## Timeline discussion range',
      `- ${weeksLow}–${weeksHigh} weeks as a speculative planning placeholder after scope definition.`,
      '- Excludes the time to obtain survey/geotechnical information, design and engineering, approvals, procurement, weather delays, and discovery of concealed conditions. A qualified project team must replace this placeholder.',
      '',
      '## Equipment and expertise to source',
      '- Potential equipment categories: access-appropriate excavation equipment, utility locating, engineered shoring/retention systems, dewatering equipment if professionally determined, material handling, and concrete placement equipment as applicable.',
      '- Potential specialist network: geotechnical and civil engineers; structural engineer; licensed electrical, plumbing, and mechanical trades; excavation/shoring contractor; waterproofing/drainage specialist; and a site safety competent person.',
      '- Access specialists to consult: licensed elevator contractor/consultant, accessibility professional, fire/life-safety engineer, and electrical/backup-power specialist. Confirm credentials, local approvals, maintainability, rescue procedures, and service coverage before selection.',
      '- Vendor suggestions are role categories only. No specific vendors are endorsed, vetted, available, or quoted by this concept tool.',
      '',
      '## Risk register / reasoning',
      ...risks.map((risk) => `- REVIEW REQUIRED: ${risk}`),
      '',
      '## Mandatory professional and worker-safety gate',
      ...safetyItems.map((item) => `- [x] Acknowledged for follow-up: ${item}`),
      '- These acknowledgements are not evidence that reviews or controls have been completed. No final design is generated. Do not excavate or build from this file. Require qualified, site-specific design and an enforceable worker-safety plan before work.',
      '',
      'Generated locally in this browser. This file is a concept discussion aid only.',
    ].join('\n')
    setExportError('')
    setExportStatus('')
    try {
      downloadFile('subterranean-concept-spec-sheet.md', specs, 'text/markdown;charset=utf-8')
      downloadFile('subterranean-concept-section.svg', makeConceptSvg(rooms, finish, length, width, stairs, lift, systems, footprint, placedAmenities), 'image/svg+xml;charset=utf-8')
      setExportStatus('The concept spec sheet and schematic SVG were generated for download.')
    } catch (caught) {
      setExportError(caught instanceof Error ? `The concept files could not be generated: ${caught.message}` : 'The concept files could not be generated in this browser.')
    }
  }

  return (
    <section className="studio-section" id="design-studio" aria-labelledby="studio-title">
      <div className="shell section">
        <div className="studio-intro">
          <div>
            <span className="eyebrow">THE SANCTUM DESIGN STUDIO / EXPLORE THE POSSIBLE</span>
            <h2 id="studio-title">Imagine below the surface.</h2>
            <p>Shape a private, expandable concept—from a single quiet room to a multi-level underground world. See materials shift, sketch the room program, and explore the planning questions before a real professional review.</p>
          </div>
          <div className="studio-edition"><Sparkles size={16} /><span>LIVE CONCEPT BUILDER<br /><strong>LOCAL TO THIS DEVICE</strong></span></div>
        </div>

        <div className="studio-workspace">
          <div className="studio-controls">
            <div className="studio-panel-title"><span>01 / THE ENVELOPE</span><Layers3 size={16} /></div>
            <label className="studio-slider-label" htmlFor="studio-length"><span>Length</span><strong>{length} ft</strong></label>
            <input id="studio-length" type="range" min={24} max={48} step={4} value={length} onChange={(event) => setLength(Number(event.target.value))} />
            <label className="studio-slider-label" htmlFor="studio-width"><span>Width</span><strong>{width} ft</strong></label>
            <input id="studio-width" type="range" min={16} max={32} step={4} value={width} onChange={(event) => setWidth(Number(event.target.value))} />

            <div className="studio-panel-title"><span>02 / MATERIAL STUDY</span><Box size={16} /></div>
            <div className="studio-material-list" role="group" aria-label="Choose a conceptual visual finish">
              {finishes.map((item) => (
                <button key={item.key} type="button" className={`studio-material ${finish === item.key ? 'selected' : ''}`} onClick={() => setFinish(item.key)} aria-pressed={finish === item.key}>
                  <span className={`studio-swatch pattern-${item.key}`} style={{ '--swatch': item.color } as React.CSSProperties} />
                  <span><strong>{item.label}</strong><small>{item.note}</small></span>
                  <span className="studio-material-dot" aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="studio-footnote">Finish changes are visual studies only—not a structural material recommendation.</p>

            <div className="studio-panel-title"><span>03 / SHAPE THE FOOTPRINT</span><Layers3 size={16} /></div>
            <div className="studio-access-group" role="group" aria-label="Choose a conceptual floor plan">
              {footprintOptions.map((option) => (
                <button key={option.key} className={`studio-access-option ${footprint === option.key ? 'active' : ''}`} type="button" onClick={() => setFootprint(option.key)} aria-pressed={footprint === option.key}>
                  <strong>{option.label}</strong><span>Approx. {Math.round(estimateFootprintArea(length, width, option.key)).toLocaleString()} sq ft / level · schematic</span>
                </button>
              ))}
            </div>
            <p className="studio-footnote">Footprint areas are rough plan-study areas, not surveyed net floor areas. Geometry is illustrative; dimensions and wall systems require professional design.</p>

            <div className="studio-panel-title"><span>04 / ADD A LEVEL</span><Plus size={16} /></div>
            <div className="studio-floor-stepper">
              <button className="studio-icon-button" type="button" onClick={removeFloor} disabled={rooms.length === 1} aria-label="Remove the deepest level"><Minus size={16} /></button>
              <span><strong>{rooms.length}</strong> {rooms.length === 1 ? 'level' : 'levels'} in this concept</span>
              <button className="studio-icon-button" type="button" onClick={addFloor} aria-label="Add another conceptual level"><Plus size={16} /></button>
            </div>
            <p className="studio-footnote">Add levels to explore a larger program. More levels increase uncertainty and require a deeper professional review.</p>

            <div className="studio-panel-title"><span>05 / STAIRS + VERTICAL ACCESS</span><Layers3 size={16} /></div>
            <p className="studio-footnote">Compare visual access strategies. They are concept options only—not code, egress, accessibility, or equipment specifications.</p>
            <div className="studio-access-group" role="group" aria-label="Choose a conceptual stair type">
              <span className="studio-access-label">STAIR CONCEPT</span>
              {stairOptions.map((option) => (
                <button key={option.key} className={`studio-access-option ${stairs === option.key ? 'active' : ''}`} type="button" onClick={() => setStairs(option.key)} aria-pressed={stairs === option.key}>
                  <strong>{option.label}</strong><span>{option.note}</span>
                </button>
              ))}
            </div>
            <div className="studio-access-group" role="group" aria-label="Choose a conceptual lift type">
              <span className="studio-access-label">LIFT CONCEPT</span>
              {liftOptions.map((option) => (
                <button key={option.key} className={`studio-access-option ${lift === option.key ? 'active' : ''}`} type="button" onClick={() => setLift(option.key)} aria-pressed={lift === option.key}>
                  <strong>{option.label}</strong><span>{option.note}</span>
                </button>
              ))}
            </div>
            <div className="studio-access-tech"><Gauge size={15} /><span><strong>Technology review prompts:</strong> regenerative drives, machine-room-less layouts, remote diagnostics, emergency communications, and backup-power interfaces. Availability and suitability must be verified by licensed lift and life-safety specialists.</span></div>
            <p className="studio-footnote">A lift is not a substitute for required stairs or a reviewed emergency-egress strategy. Confirm accessibility, flood exposure, maintenance, rescue procedures, and power-loss response for the actual site.</p>

            <div className="studio-panel-title"><span>06 / RESILIENT BUILDING SYSTEMS</span><Gauge size={16} /></div>
            <p className="studio-footnote">Choose concept pathways; no energy independence, potable water, safe air, or equipment performance is calculated or guaranteed.</p>
            <SystemChoiceGroup label="POWER + STORAGE" options={powerOptions} selected={systems.power} onSelect={(power) => setSystems((current) => ({ ...current, power }))} />
            <SystemChoiceGroup label="WATER + TREATMENT" options={waterOptions} selected={systems.water} onSelect={(water) => setSystems((current) => ({ ...current, water }))} />
            <SystemChoiceGroup label="VENTILATION + AIR QUALITY" options={airOptions} selected={systems.air} onSelect={(air) => setSystems((current) => ({ ...current, air }))} />
            <SystemChoiceGroup label="COMPUTERIZED CONTROLS" options={controlOptions} selected={systems.controls} onSelect={(controls) => setSystems((current) => ({ ...current, controls }))} />
            <div className="studio-access-tech"><CircleAlert size={15} /><span><strong>Material / seismic gate:</strong> a finish swatch is not a structural material choice. Compare verified unit weight, strength, seismic mass, connections, and soil interaction only with site-specific geotechnical data and licensed structural engineering.</span></div>
            <div className="studio-panel-title"><span>07 / PLACE INTERIOR CONCEPT ITEMS</span><Box size={16} /></div>
            <p className="studio-footnote">Select an item to place it in the plan. These symbols represent space-planning placeholders, not equipment, access clearances, or safe egress dimensions.</p>
            <div className="studio-amenity-palette" aria-label="Amenity palette">
              {amenityOptions.map((item) => (
                <button key={item.key} type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', item.key)} onClick={() => addAmenity(item.key)} aria-label={`Add ${item.label} to the selected level`}>
                  <span style={{ '--amenity-color': item.color } as React.CSSProperties} /><strong>{item.label}</strong>
                </button>
              ))}
            </div>
            <p className="studio-footnote" role="status">{amenityStatus || `${placedAmenities.length} items placed across ${rooms.length} conceptual levels.`}</p>
          </div>

          <div className="studio-model-column">
            <div className="studio-model-toolbar"><span><span className="studio-live-dot" /> LIVE SECTION / SCHEMATIC</span><span>SCROLL TO EXPLORE</span></div>
            <div className="studio-model" role="img" aria-label={`Conceptual cross section, ${rooms.length} level${rooms.length > 1 ? 's' : ''}, ${length} by ${width} feet per level, ${footprint} plan, ${finishData.label}, ${stairs} stairs, ${lift} lift`}>
              <div className="studio-model-grid" />
              <svg viewBox={`0 0 700 ${Math.max(420, 101 + rooms.length * 74 + 42)}`} role="img" aria-labelledby="studio-section-title studio-section-description">
                <title id="studio-section-title">Expandable underground concept section</title>
                <desc id="studio-section-description">A conceptual {rooms.length}-level {footprint} underground room layout. Selected finish: {finishData.label}. It shows {stairs} stairs, {lift} lift, and {placedAmenities.length} space-planning items. The drawing is schematic, not for construction.</desc>
                <defs>
                  <pattern id="concrete-live" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#39484a"/><path d="M-4 16L16 -4M4 20L20 4" stroke="#8aa0a0" strokeOpacity=".32" /></pattern>
                  <pattern id="shotcrete-live" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#554a3d"/><circle cx="4" cy="5" r="1.6" fill="#bca782" fillOpacity=".62"/><circle cx="11" cy="10" r="1.1" fill="#d0c1a5" fillOpacity=".48"/></pattern>
                  <pattern id="steel-live" width="24" height="20" patternUnits="userSpaceOnUse"><rect width="24" height="20" fill="#35424c"/><path d="M0 1h24M1 0v20M23 0v20" stroke="#92abb3" strokeOpacity=".48"/><circle cx="4" cy="5" r="1" fill="#c1c9c6"/></pattern>
                  <pattern id="masonry-live" width="32" height="20" patternUnits="userSpaceOnUse"><rect width="32" height="20" fill="#59453e"/><path d="M0 1h32M0 19h32M16 1v9M8 10v9M28 10v9" stroke="#ba9d84" strokeOpacity=".58"/></pattern>
                  <linearGradient id="studio-ground" x2="0" y2="1"><stop stopColor="#25352e"/><stop offset="1" stopColor="#121d1c"/></linearGradient>
                </defs>
                <rect width="700" height={Math.max(420, 101 + rooms.length * 74 + 42)} fill="#111a1e" />
                <path d={`M0 83h700v${Math.max(300, 101 + rooms.length * 74 - 56)}H0z`} fill="url(#studio-ground)" opacity=".82" />
                <path d="M35 84h630" stroke="#a6b28a" strokeWidth="3" />
                <path d="M42 90h616M50 98h600" stroke="#8b9b7c" strokeOpacity=".25" />
                <path d={`M93 83v30h24v${Math.max(36, (rooms.length - 1) * 74 + 36)}h30`} fill="none" stroke="#d4ba8d" strokeWidth="3" strokeDasharray="5 5" />
                <path d="M91 82v-24h28v24" fill="none" stroke="#d4ba8d" strokeWidth="2" />
                <text x="42" y="43" fill="#d7dfd5" fontFamily="monospace" fontSize="10" letterSpacing="1.2">CONCEPTUAL SECTION / NOT FOR CONSTRUCTION</text>
                {rooms.map((_, index) => {
                  const roomWidth = 270 + ((length - 24) / 24) * 150
                  const x = 350 - roomWidth / 2
                  const y = 101 + index * 74
                  const stairPath = stairs === 'straight'
                    ? `M${x + 12} ${y + 47}h9v-8h9v-8h9v-8h9`
                    : stairs === 'sculptural-spiral'
                      ? `M${x + 17} ${y + 48}c18-2 19-19 7-21s-16 9-7 16 18 0 14-12`
                      : `M${x + 10} ${y + 47}h13v-8h13v8h13v-8h9`
                  return <g key={`access-${index}`} aria-hidden="true">
                    <path d={stairPath} fill="none" stroke="#d5bf84" strokeWidth="2" />
                    {lift !== 'none' && <><rect x={x + roomWidth - 42} y={y + 4} width="34" height="48" fill="#78918d" fillOpacity=".45" stroke="#d0ddd1" /><path d={`M${x + roomWidth - 25} ${y + 7}v42`} stroke="#d0ddd1" strokeOpacity=".55" /></>}
                  </g>
                })}
                {rooms.map((room, index) => {
                  const roomWidth = 270 + ((length - 24) / 24) * 150
                  const x = 350 - roomWidth / 2
                  const y = 101 + index * 74
                  return (
                    <g key={`${index}-${room}`}>
                      <path d={footprintPath(x, y, roomWidth, 58, footprint)} fill={`url(#${finishData.pattern}-live)`} stroke={finishData.color} strokeWidth="2" />
                      <path d={`M${x + 8} ${y + 49}h${roomWidth - 16}`} stroke="#d9c6a7" strokeOpacity=".72" />
                      <text x={x + 15} y={y + 24} fill="#f4eee2" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600">{room}</text>
                      <text x={x + 15} y={y + 42} fill="#bac6c1" fontFamily="monospace" fontSize="9">LEVEL {String(index + 1).padStart(2, '0')} / CONCEPT</text>
                      {placedAmenities.filter((item) => item.level === index).map((item) => {
                        const amenity = amenityOptions.find((candidate) => candidate.key === item.kind)!
                        const boxX = x + roomWidth * item.x - 5
                        const boxY = y + 17 + item.y * 18
                        return <rect key={item.id} x={boxX} y={boxY} width="11" height="11" rx="2" fill={amenity.color} stroke="#f5edd9" strokeWidth="1.5"><title>{amenity.label} on Level {index + 1}</title></rect>
                      })}
                    </g>
                  )
                })}
                <text x="42" y={Math.max(145, 101 + rooms.length * 74 + 14)} fill="#b7c2b9" fontFamily="monospace" fontSize="10">{length} ft × {width} ft / {rooms.length} LEVEL{rooms.length > 1 ? 'S' : ''} / {finishData.label.toUpperCase()}</text>
              </svg>
              <span className="studio-model-tag">SECTION A–A / STUDY {String(rooms.length).padStart(2, '0')}</span>
            </div>
            <FloorPlanEditor
              shape={footprint}
              finishColor={finishData.color}
              amenities={placedAmenities}
              level={selectedLevel}
              stairs={stairs}
              lift={lift}
              lengthFeet={length}
              widthFeet={width}
              onPlace={dropAmenity}
              onRemove={(id) => setPlacedAmenities((current) => current.filter((item) => item.id !== id))}
            />
            <div className="studio-3d-tools">
              <div className="studio-panel-title"><span>LIVE SPATIAL MODEL</span><Compass size={15} /></div>
              <Screen3DPreview finishColor={finishData.color} shape={footprint} amenities={placedAmenities} level={selectedLevel} stairs={stairs} lift={lift} />
            </div>
            <div className="studio-system-summary" aria-label="Selected building system concepts">
              <span><strong>POWER</strong>{powerOptions.find((item) => item.key === systems.power)!.label}</span>
              <span><strong>WATER</strong>{waterOptions.find((item) => item.key === systems.water)!.label}</span>
              <span><strong>AIR</strong>{airOptions.find((item) => item.key === systems.air)!.label}</span>
              <span><strong>CONTROLS</strong>{controlOptions.find((item) => item.key === systems.controls)!.label}</span>
            </div>
            <div className="studio-floor-program">
              {rooms.map((room, index) => (
                <label className={`studio-floor-row ${selectedLevel === index ? 'active' : ''}`} key={index}>
                  <span><span className="studio-floor-number">L{String(index + 1).padStart(2, '0')}</span> Program</span>
                  <select aria-label={`Room program for level ${index + 1}`} value={room} onFocus={() => setSelectedLevel(index)} onChange={(event) => { setSelectedLevel(index); setRooms((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item)) }}>
                    {roomTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <button className="button studio-walk-button" type="button" onClick={() => setWalkthroughOpen((open) => !open)} aria-expanded={walkthroughOpen}>
              <Compass size={16} /> {walkthroughOpen ? 'Close the walkthrough' : 'Walk through your concept'} <ArrowRight size={15} />
            </button>
            {walkthroughOpen && <Walkthrough room={rooms[0]} finish={finishData} stairs={stairOptions.find((item) => item.key === stairs)!} lift={liftOptions.find((item) => item.key === lift)!} canEnterVr={vrSupported} onEnterVr={() => setVrOpen(true)} />}
          </div>
        </div>

        <section className="studio-genie" aria-labelledby="studio-genie-title">
          <div className="studio-genie-stage">
            <div className="studio-genie-topline"><span className="studio-genie-spark">✳</span><span>BLUEPRINT GENIE / COLLABORATOR PREVIEW</span><span className="studio-genie-connection">LOCAL PROTOTYPE · NO LLM CONNECTED</span></div>
            <div className={`studio-genie-orb genie-${collaborator} motion-${movement}`} style={{ '--genie-color': collaboratorData.color } as React.CSSProperties} aria-hidden="true">
              <span className="studio-genie-orb-ring ring-one" /><span className="studio-genie-orb-ring ring-two" />
              <span className="studio-genie-avatar-core"><span>{collaboratorData.symbol}</span><i /><i /><i /></span>
              <span className="studio-genie-orbit-dot" />
            </div>
            <span className="studio-genie-name">{collaboratorData.name}<small>{collaboratorData.title}</small></span>
            <p className="studio-genie-manifesto">“We can imagine boldly and still be honest about what we don’t know.”</p>
                  <div className="studio-genie-boundary"><CircleAlert size={14} /> This is an interactive local prototype, not an LLM-generated professional opinion. Text stays in this browser and is not sent to an AI service.</div>
          </div>
          <div className="studio-genie-console">
            <div className="studio-panel-title"><span>MAKE YOUR COLLABORATOR YOURS</span><Sparkles size={16} /></div>
            <div className="studio-persona-options" role="group" aria-label="Choose a collaborator appearance">
              {collaborators.map((item) => (
                <button type="button" key={item.key} className={`studio-persona ${collaborator === item.key ? 'selected' : ''}`} onClick={() => setCollaborator(item.key)} aria-pressed={collaborator === item.key} style={{ '--persona-color': item.color } as React.CSSProperties}>
                  <span className="studio-persona-symbol">{item.symbol}</span><span><strong>{item.name}</strong><small>{item.title}</small></span>
                </button>
              ))}
            </div>
            <div className="studio-genie-preferences">
              <label>Voice character<select value={voiceStyle} onChange={(event) => setVoiceStyle(event.target.value as typeof voiceStyle)}><option value="warm">Warm / reassuring</option><option value="measured">Measured / clear</option><option value="bright">Bright / curious</option></select></label>
              <label>Movement language<select value={movement} onChange={(event) => setMovement(event.target.value as typeof movement)}><option value="orbit">Slow orbit</option><option value="hover">Calm hover</option><option value="guide">Guiding sweep</option></select></label>
              {systemVoices.length > 0 && <label className="studio-system-voice">Device speech voice<select value={systemVoice} onChange={(event) => setSystemVoice(event.target.value)}><option value="">System default</option>{systemVoices.map((voice) => <option value={voice.name} key={`${voice.name}-${voice.lang}`}>{voice.name} · {voice.lang}</option>)}</select></label>}
            </div>
            <div className="studio-genie-reply" aria-live="polite"><span className="studio-genie-reply-mark">{collaboratorData.symbol}</span><p>{genieReply}</p></div>
            <form className="studio-genie-form" onSubmit={(event) => { event.preventDefault(); askGenie(geniePrompt) }}>
              <label className="sr-only" htmlFor="studio-genie-prompt">Ask your concept collaborator to change the design</label>
              <input id="studio-genie-prompt" value={geniePrompt} onChange={(event) => setGeniePrompt(event.target.value)} placeholder="“Show me steel, then widen the room…”" maxLength={300} />
              <button className="button primary small" type="submit" disabled={!geniePrompt.trim()}>Explore <ArrowRight size={14} /></button>
            </form>
            <div className="studio-genie-actions">
              <button className="button small" type="button" onClick={speakGenieReply}>Speak reply <Compass size={14} /></button>
              <label className="studio-voice-consent"><input type="checkbox" checked={voicePermission} onChange={(event) => setVoicePermission(event.target.checked)} /> I understand browser voice input may be processed by its speech provider.</label>
              <button className="button small" type="button" disabled={!voicePermission} onClick={startVoicePrompt}>Talk to the genie</button>
            </div>
            {voiceError && <p className="studio-error" role="alert">{voiceError}</p>}
            <p className="studio-genie-footer">The preset identity, voice character, and movement style are visual/audio preferences. Material, room, and size commands use simple local rules until an AI provider is deliberately connected and reviewed.</p>
          </div>
        </section>

        <div className="studio-analysis">
          <section className="studio-analysis-card studio-estimate" aria-labelledby="studio-estimate-title">
            <div className="studio-panel-title"><span>PLANNING MODEL / LIVE ESTIMATE</span><BadgeDollarSign size={18} /></div>
            <h3 id="studio-estimate-title">{money(estimate.totalLow)} <span>—</span> {money(estimate.totalHigh)}</h3>
            <p className="studio-estimate-label">Speculative combined allowance · {estimate.area.toLocaleString()} sq ft</p>
            <div className="studio-cost-lines">
              <div><span>Construction allowance</span><strong>{money(estimate.constructionLow)} – {money(estimate.constructionHigh)}</strong></div>
              <div><span>Stairs + lift concept allowance</span><strong>{money(estimate.accessLow)} – {money(estimate.accessHigh)}</strong></div>
              <div><span>Power, water, air + controls allowance</span><strong>{money(estimate.systemsLow)} – {money(estimate.systemsHigh)}</strong></div>
              <div><span>Design development reserve · 15% assumption</span><strong>{money(estimate.designFeeLow)} – {money(estimate.designFeeHigh)}</strong></div>
              <div><span>Illustrative labor effort</span><strong>{estimate.laborLowHours.toLocaleString()} – {estimate.laborHighHours.toLocaleString()} hours</strong></div>
              <div><span>Schedule conversation range</span><strong>{10 + rooms.length * 3} – {20 + rooms.length * 8} weeks</strong></div>
            </div>
            <p className="studio-reasoning"><strong>Why the range moves:</strong> the model scales broad, unsourced construction and access allowances by footprint, levels, finish, stair, and lift selection, then adds selected building-system allowances. Unknown soil, seismic conditions, groundwater, loads, access, utilities, engineering, approvals, procurement, equipment compatibility, and local pricing can materially change cost and duration.</p>
            <p className="studio-footnote">{estimate.systemsBasis}</p>
            <p className="studio-footnote">Illustrative planning inputs only—not researched local market rates, a quote, bid, contractor commitment, or completed fee proposal. The design reserve is a placeholder, not a price promise.</p>
          </section>

          <section className="studio-analysis-card" aria-labelledby="studio-risk-title">
            <div className="studio-panel-title"><span>RISK / REVIEW BEFORE COMMITMENT</span><CircleAlert size={17} /></div>
            <h3 id="studio-risk-title">{rooms.length > 1 ? 'Elevated design-review load' : 'Critical site unknowns remain'}</h3>
            <ul className="studio-risk-list">{risks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
            <p className="studio-footnote">Access allowance basis: {estimate.accessBasis} This is a prompt list, not a hazard analysis, risk clearance, or site-suitability assessment.</p>
          </section>

          <section className="studio-analysis-card" aria-labelledby="studio-resourcing-title">
            <div className="studio-panel-title"><span>PEOPLE / EQUIPMENT TO SOURCE</span><Box size={17} /></div>
            <h3 id="studio-resourcing-title">A specialist team, not a shortcut.</h3>
            <p className="studio-network-intro">Potential vendor and labor-network categories to research locally—not named, vetted, or endorsed providers.</p>
            <div className="studio-network"><span>GEOTECHNICAL + SEISMIC HAZARD REVIEW</span><span>STRUCTURAL ENGINEER</span><span>EXCAVATION + ENGINEERED SHORING</span><span>WATER TREATMENT PROFESSIONAL</span><span>MECHANICAL / IAQ ENGINEER</span><span>ENERGY + STORAGE SPECIALIST</span><span>BUILDING CONTROLS INTEGRATOR</span><span>LICENSED ELEVATOR CONSULTANT</span><span>ACCESSIBILITY + LIFE-SAFETY REVIEW</span><span>SITE SAFETY COMPETENT PERSON</span></div>
            <p className="studio-equipment"><strong>Possible equipment categories:</strong> access-appropriate excavation, utility locating, engineered shoring, material handling, monitored ventilation and filtration, tested water-treatment equipment, energy storage and backup interfaces, and professionally specified monitoring/control hardware. No device or vendor is selected or validated.</p>
          </section>
        </div>

        <section className="studio-safety" aria-labelledby="studio-safety-title">
          <div className="studio-safety-heading">
            <div><span className="eyebrow">HARD GATE / NO UNSAFE FINAL OUTPUT</span><h3 id="studio-safety-title">Safety is part of the design.</h3></div>
            <ShieldCheck size={26} />
          </div>
          <p>This studio will not produce final construction drawings or directions. The concept package stays locked until you acknowledge these professional and worker-safety reviews for the next stage. Acknowledging them does not mean they have been completed.</p>
          <p className="studio-footnote">Before any design advances, qualified professionals must resolve site seismic hazard and soil response; verified structural material weights, capacities and connections; power generation and backup limits; water-source and treatment quality; ventilation and emergency operation; and computerized controls, cybersecurity, manual overrides and safe failure states.</p>
          <div className="studio-safety-checks">
            {safetyItems.map((item) => (
              <label key={item} className="studio-safety-check">
                <input type="checkbox" checked={safetyConfirmed.includes(item)} onChange={(event) => setSafetyConfirmed((current) => event.target.checked ? [...current, item] : current.filter((entry) => entry !== item))} />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="studio-export-row">
            <button className="button primary" type="button" onClick={downloadSpecs} disabled={!safetyReady}><ArrowDownToLine size={16} /> Download concept spec + schematic</button>
            <span role="status">{exportStatus || (safetyReady ? 'Concept-only files will be generated in this browser.' : `${safetyConfirmed.length} of ${safetyItems.length} review acknowledgements complete.`)}</span>
          </div>
          {exportError && <p className="studio-error" role="alert">{exportError}</p>}
          <p className="studio-never-final"><CircleAlert size={15} /> No checkbox overrides missing site data, engineering, approvals, code review, a worker-safety plan, or qualified professional sign-off. No final or build-ready product is available from this tool.</p>
        </section>
      </div>
      {vrOpen && <WebXRSession
        finish={finishData}
        footprint={footprint}
        lengthFeet={length}
        widthFeet={width}
        rooms={rooms}
        amenities={placedAmenities}
        selectedLevel={selectedLevel}
        stairs={stairs}
        lift={lift}
        collaborator={collaborator}
        voiceAllowed={voicePermission}
        onClose={() => setVrOpen(false)}
        onFinishChange={setFinish}
        onRoomChange={(level, room) => setRooms((current) => current.map((item, index) => index === level ? room : item))}
        onLevelChange={setSelectedLevel}
        onAddFloor={addFloor}
        onWidthChange={setWidth}
        onCollaboratorChange={setCollaborator}
        onVoicePrompt={startVoicePrompt}
      />}
    </section>
  )
}
