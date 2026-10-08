'use client'

import { ArrowDownToLine, ExternalLink, FileSearch, MapPinned, Plus, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  centralTexasCounties,
  parseCountyFeatures,
  type CentralTexasCounty,
  type CountyFeature,
  type GisPosition,
  type GisRing,
} from '@/lib/central-texas-gis'

type ResearchLane = 'Zoning / land use' | 'Jurisdiction / permits' | 'Licensing' | 'Life safety / technical'
type ReviewStatus = 'Unverified lead' | 'Reviewed against source' | 'Conflicting sources / escalate'
type ResearchRecord = {
  id: string
  lane: ResearchLane
  authority: string
  subject: string
  finding: string
  sourceName: string
  sourceUrl: string
  checkedAt: string
  status: ReviewStatus
}
type GisResult = {
  source: string
  vintage: string
  retrievedAt: string
  sourceUrl: string
  feature: CountyFeature
}
type SupplyRecord = { id: string; category: string; item: string; quantity: string; unit: string; reviewDate: string }
type SafetySystemRecord = { id: string; system: string; responsibleRole: string; failSafe: string; sourceUrl: string; state: string }

const counties = Object.keys(centralTexasCounties) as CentralTexasCounty[]
const lanes: ResearchLane[] = ['Zoning / land use', 'Jurisdiction / permits', 'Licensing', 'Life safety / technical']
const reviewStatuses: ReviewStatus[] = ['Unverified lead', 'Reviewed against source', 'Conflicting sources / escalate']
const emergencyChecklist = [
  'Emergency action plan, roles, communications, and stop-work authority reviewed with the responsible safety lead.',
  'Egress and evacuation approach reviewed with the authority having jurisdiction; no route is inferred from this concept.',
  'Power-loss and fire/emergency shutdown response reviewed by licensed electrical and fire/life-safety professionals.',
  'Air-quality alarms, ventilation failure response, and human fallback reviewed by a mechanical engineer and emergency planner.',
  'Water contamination isolation, testing, alternate supply, and safe-use decisions reviewed by qualified water professionals.',
  'Flooding, severe weather, drainage, and emergency response reviewed using site-specific professional assessments.',
  'Lift entrapment and rescue response reviewed with the elevator contractor; lifts are not assumed to be evacuation routes.',
  'Worker emergency communications, training, PPE, rescue planning, and competent-person coverage reviewed before work.',
]
const agents: Array<{ title: string; lane: ResearchLane; focus: string }> = [
  { title: 'GIS boundary scout', lane: 'Jurisdiction / permits', focus: 'County boundary, municipality, ETJ, and the correct authority to contact.' },
  { title: 'Land-use & zoning scout', lane: 'Zoning / land use', focus: 'Official zoning map, land-use code, overlay districts, and referral contacts.' },
  { title: 'License & permit verifier', lane: 'Licensing', focus: 'Applicable state/local license lookups, permit pages, and current official source records.' },
  { title: 'Life-safety source reviewer', lane: 'Life safety / technical', focus: 'Official review pathways for structural, geotechnical, water, ventilation, power, and emergency systems.' },
]

function searchLink(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} official government source`)}`
}

function getRings(geometry: CountyFeature['geometry']): GisRing[] {
  return geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat()
}

function projectPosition(position: GisPosition, bounds: { minX: number; maxX: number; minY: number; maxY: number }): [number, number] {
  const xSpan = bounds.maxX - bounds.minX || 1
  const ySpan = bounds.maxY - bounds.minY || 1
  return [24 + ((position[0] - bounds.minX) / xSpan) * 592, 24 + ((bounds.maxY - position[1]) / ySpan) * 352]
}

function downloadResearch(
  records: ResearchRecord[],
  result: GisResult | null,
  county: CentralTexasCounty,
  checkedEmergencyItems: string[],
  inventory: SupplyRecord[],
  systemRecords: SafetySystemRecord[],
): void {
  const payload = {
    title: 'Jurisdiction and compliance research notes',
    generatedAt: new Date().toISOString(),
    county,
    gis: result ? {
      source: result.source,
      vintage: result.vintage,
      retrievedAt: result.retrievedAt,
      sourceUrl: result.sourceUrl,
      geoid: result.feature.properties.GEOID,
      featureName: result.feature.properties.NAME,
    } : null,
    records,
    emergencyChecklist: emergencyChecklist.map((item) => ({ item, acknowledgedForReview: checkedEmergencyItems.includes(item) })),
    inventory,
    safetySystemIntegrationPlans: systemRecords,
    disclaimer: 'Unverified planning notes, not legal advice, a permit determination, code interpretation, license approval, survey, site assessment, or safety certification. Confirm current requirements with the authority having jurisdiction and qualified professionals. No parcel/address data is included.',
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'jurisdiction-research-notes.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

function parseGisResult(value: unknown): GisResult {
  if (typeof value !== 'object' || value === null || !('feature' in value)) {
    throw new Error('The GIS response did not include a county boundary.')
  }
  const response = value as Record<string, unknown>
  if (
    typeof response.source !== 'string'
    || typeof response.vintage !== 'string'
    || typeof response.retrievedAt !== 'string'
    || typeof response.sourceUrl !== 'string'
  ) {
    throw new Error('The GIS response is missing its data-source details.')
  }
  const features = parseCountyFeatures({ type: 'FeatureCollection', features: [response.feature] })
  if (features.length !== 1) throw new Error('The GIS response did not include exactly one county.')
  return {
    source: response.source,
    vintage: response.vintage,
    retrievedAt: response.retrievedAt,
    sourceUrl: response.sourceUrl,
    feature: features[0],
  }
}

export default function ComplianceResearchWorkspace(): React.JSX.Element {
  const [county, setCounty] = useState<CentralTexasCounty>('Travis')
  const [municipality, setMunicipality] = useState('')
  const [authorityType, setAuthorityType] = useState('Not established')
  const [gisResult, setGisResult] = useState<GisResult | null>(null)
  const [gisLoading, setGisLoading] = useState(false)
  const [gisError, setGisError] = useState('')
  const [lane, setLane] = useState<ResearchLane>('Zoning / land use')
  const [subject, setSubject] = useState('')
  const [finding, setFinding] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [status, setStatus] = useState<ReviewStatus>('Unverified lead')
  const [records, setRecords] = useState<ResearchRecord[]>([])
  const [checkedEmergencyItems, setCheckedEmergencyItems] = useState<string[]>([])
  const [inventory, setInventory] = useState<SupplyRecord[]>([])
  const [inventoryCategory, setInventoryCategory] = useState('Seed lots')
  const [inventoryItem, setInventoryItem] = useState('')
  const [inventoryQuantity, setInventoryQuantity] = useState('')
  const [inventoryUnit, setInventoryUnit] = useState('')
  const [inventoryReviewDate, setInventoryReviewDate] = useState('')
  const [systemRecords, setSystemRecords] = useState<SafetySystemRecord[]>([])
  const [systemName, setSystemName] = useState('Power / energy storage')
  const [responsibleRole, setResponsibleRole] = useState('')
  const [failSafe, setFailSafe] = useState('')
  const [integrationSource, setIntegrationSource] = useState('')
  const [formError, setFormError] = useState('')
  const [formStatus, setFormStatus] = useState('')

  const rings = useMemo(() => gisResult ? getRings(gisResult.feature.geometry) : [], [gisResult])
  const bounds = useMemo(() => {
    const positions = rings.flat()
    if (positions.length === 0) return null
    return positions.reduce((value, position) => ({
      minX: Math.min(value.minX, position[0]),
      maxX: Math.max(value.maxX, position[0]),
      minY: Math.min(value.minY, position[1]),
      maxY: Math.max(value.maxY, position[1]),
    }), { minX: positions[0][0], maxX: positions[0][0], minY: positions[0][1], maxY: positions[0][1] })
  }, [rings])

  const loadBoundary = async (): Promise<void> => {
    setGisLoading(true)
    setGisError('')
    try {
      const response = await fetch(`/api/gis/counties?county=${encodeURIComponent(county)}`)
      const payload: unknown = await response.json()
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'The live GIS boundary is unavailable.'
        throw new Error(message)
      }
      setGisResult(parseGisResult(payload))
    } catch (error) {
      setGisResult(null)
      setGisError(error instanceof Error ? error.message : 'The live GIS boundary is unavailable.')
    } finally {
      setGisLoading(false)
    }
  }

  const addRecord = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setFormError('')
    setFormStatus('')
    let parsedUrl: URL
    try {
      parsedUrl = new URL(sourceUrl)
    } catch {
      setFormError('Enter a complete official source URL beginning with https://.')
      return
    }
    if (parsedUrl.protocol !== 'https:') {
      setFormError('Research sources must use HTTPS.')
      return
    }
    const checkedAt = new Date().toISOString()
    setRecords((current) => [{
      id: crypto.randomUUID(),
      lane,
      authority: [municipality.trim(), `${county} County, Texas`, authorityType].filter(Boolean).join(' · '),
      subject: subject.trim(),
      finding: finding.trim(),
      sourceName: sourceName.trim(),
      sourceUrl: parsedUrl.toString(),
      checkedAt,
      status,
    }, ...current])
    setSubject('')
    setFinding('')
    setSourceName('')
    setSourceUrl('')
    setFormStatus('Research note added to this page only. It has not been submitted or stored remotely.')
  }

  const addInventory = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setInventory((current) => [{
      id: crypto.randomUUID(),
      category: inventoryCategory,
      item: inventoryItem.trim(),
      quantity: inventoryQuantity.trim(),
      unit: inventoryUnit.trim(),
      reviewDate: inventoryReviewDate,
    }, ...current])
    setInventoryItem('')
    setInventoryQuantity('')
    setInventoryUnit('')
    setInventoryReviewDate('')
  }

  const addSafetySystem = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    let parsedUrl: URL
    try {
      parsedUrl = new URL(integrationSource)
    } catch {
      setFormError('Enter an HTTPS manufacturer or official system-documentation URL.')
      return
    }
    if (parsedUrl.protocol !== 'https:') {
      setFormError('Safety-system documentation links must use HTTPS.')
      return
    }
    setSystemRecords((current) => [{
      id: crypto.randomUUID(),
      system: systemName,
      responsibleRole: responsibleRole.trim(),
      failSafe: failSafe.trim(),
      sourceUrl: parsedUrl.toString(),
      state: 'Planning note only — not connected or approved',
    }, ...current])
    setResponsibleRole('')
    setFailSafe('')
    setIntegrationSource('')
    setFormError('')
  }

  return (
    <section className="compliance-section" id="compliance-research" aria-labelledby="compliance-title">
      <div className="shell section">
        <div className="section-heading compliance-heading">
          <div><span className="eyebrow">LIVE GIS / HUMAN-VERIFIED COMPLIANCE RESEARCH</span><h2 id="compliance-title">Find the right authority before the answer.</h2></div>
          <p>Map public county boundaries, assign focused research work, and capture dated source evidence. This workspace never declares a project compliant.</p>
        </div>
        <div className="compliance-safety-banner"><ShieldCheck size={19} /><p><strong>Safety outranks cost and schedule.</strong> Do not reduce, bypass, or trade away worker protection, life safety, required reviews, or engineered controls to lower an estimate. Unresolved requirements stay unresolved; no “compliant” or build-ready outcome is generated.</p></div>

        <div className="compliance-layout">
          <section className="compliance-card" aria-labelledby="gis-title">
            <div className="studio-panel-title"><span>01 / PUBLIC GIS BOUNDARY</span><MapPinned size={17} /></div>
            <h3 id="gis-title">County outline · Central Texas</h3>
            <p className="compliance-copy">Choose a county to request its current Census TIGERweb boundary. Only the county name/FIPS code is sent to the U.S. Census Bureau through this server; no address, parcel, GPS, or site coordinates are requested.</p>
            <div className="compliance-map-controls">
              <label className="field"><span>County</span><select value={county} onChange={(event) => { setCounty(event.target.value as CentralTexasCounty); setGisResult(null) }}>{counties.map((item) => <option key={item}>{item}</option>)}</select></label>
              <button className="button primary small" type="button" onClick={() => void loadBoundary()} disabled={gisLoading}>{gisLoading ? 'Loading public GIS…' : 'Load live county boundary'}</button>
            </div>
            {gisError && <p className="compliance-error" role="alert">{gisError}</p>}
            {gisResult && bounds ? (
              <>
                <div className="compliance-map">
                  <svg viewBox="0 0 640 400" role="img" aria-label={`${gisResult.feature.properties.NAME} GIS county boundary`}>
                    <path d="M0 100h640M0 200h640M0 300h640M160 0v400M320 0v400M480 0v400" />
                    {rings.map((ring, index) => {
                      const [first, ...rest] = ring
                      const start = projectPosition(first, bounds)
                      const commands = rest.map((position) => {
                        const [x, y] = projectPosition(position, bounds)
                        return `L${x.toFixed(2)} ${y.toFixed(2)}`
                      }).join(' ')
                      return <path className="compliance-map-boundary" key={index} d={`M${start[0].toFixed(2)} ${start[1].toFixed(2)} ${commands} Z`} />
                    })}
                  </svg>
                  <span>{gisResult.feature.properties.NAME.toUpperCase()} / COUNTY OUTLINE</span>
                </div>
                <p className="compliance-source">Source: {gisResult.source} · {gisResult.vintage} vintage · retrieved {new Date(gisResult.retrievedAt).toLocaleString()}</p>
                <a className="text-link compliance-source-link" href={gisResult.sourceUrl} target="_blank" rel="noreferrer">Open Census GIS source <ExternalLink size={13} /></a>
              </>
            ) : (
              <div className="compliance-map-placeholder">The selected county outline will appear here after you request the live GIS layer.</div>
            )}
            <p className="studio-footnote">County boundaries are not parcel boundaries, city limits, ETJs, zoning overlays, flood maps, or a survey. TIGERweb’s annual boundary vintage is not real-time land-use data. Confirm every controlling map with the local authority.</p>
          </section>

          <section className="compliance-card" aria-labelledby="agents-title">
            <div className="studio-panel-title"><span>02 / RESEARCH AGENT WORK QUEUE</span><FileSearch size={17} /></div>
            <h3 id="agents-title">Focused source-finding roles</h3>
            <p className="compliance-copy">These are transparent, human-in-the-loop research agents: each builds a fresh official-source search for this county. Search links open only when selected. No LLM or autonomous legal/code interpreter is connected.</p>
            <div className="compliance-agents">
              {agents.map((agent) => {
                const place = [municipality.trim(), `${county} County Texas`].filter(Boolean).join(' ')
                const query = agent.lane === 'Zoning / land use'
                  ? `${place} zoning map land use ETJ planning code site:.gov`
                  : agent.lane === 'Licensing'
                    ? `${place} Texas contractor trade license verification official site:texas.gov OR site:tx.us`
                    : agent.lane === 'Jurisdiction / permits'
                      ? `${place} planning building permits jurisdiction official GIS site:.gov`
                      : `${place} underground construction geotechnical seismic water treatment ventilation life safety official site:.gov`
                return (
                  <article className="compliance-agent" key={agent.title}>
                    <div><span className="card-number">{agent.lane.toUpperCase()}</span><h4>{agent.title}</h4><p>{agent.focus}</p></div>
                    <a className="button small" href={searchLink(query)} target="_blank" rel="noreferrer">Search current sources <ExternalLink size={13} /></a>
                  </article>
                )
              })}
            </div>
            <p className="studio-footnote">Search providers may receive the coarse city/county terms you enter. Do not include street addresses, owner names, parcel numbers, or security details in the municipality field or search.</p>
          </section>

          <section className="compliance-card compliance-form-card" aria-labelledby="jurisdiction-title">
            <div className="studio-panel-title"><span>03 / JURISDICTION + ZONING INTAKE</span><MapPinned size={17} /></div>
            <h3 id="jurisdiction-title">Record who has authority</h3>
            <p className="compliance-copy">Use official planning, zoning, ETJ, and permit sources to verify whether city, county, state, or another agency has jurisdiction. Do not infer authority from a county outline.</p>
            <div className="compliance-intake">
              <label className="field"><span>Municipality / locality (no street address)</span><input value={municipality} onChange={(event) => setMunicipality(event.target.value)} maxLength={80} placeholder="City or locality name" /></label>
              <label className="field"><span>Possible authority</span><select value={authorityType} onChange={(event) => setAuthorityType(event.target.value)}><option>Not established</option><option>Municipality — verify city limits / ETJ</option><option>County — verify applicable powers</option><option>State agency — verify scope</option><option>Multiple authorities — verify each</option></select></label>
            </div>
            <form className="compliance-record-form" onSubmit={addRecord}>
              <label className="field"><span>Research lane</span><select value={lane} onChange={(event) => setLane(event.target.value as ResearchLane)}>{lanes.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field"><span>Requirement / topic under review</span><input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} required placeholder="e.g. zoning district, excavation permit, trade license" /></label>
              <label className="field"><span>Finding and reasoning (quote or summarize)</span><textarea value={finding} onChange={(event) => setFinding(event.target.value)} maxLength={1200} required placeholder="Record what the source says, open questions, and why it may apply. Do not state a conclusion without verification." /></label>
              <div className="compliance-intake">
                <label className="field"><span>Official agency/source name</span><input value={sourceName} onChange={(event) => setSourceName(event.target.value)} maxLength={120} required placeholder="Agency or authority" /></label>
                <label className="field"><span>Source URL (HTTPS)</span><input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} required placeholder="https://..." /></label>
              </div>
              <label className="field"><span>Review status</span><select value={status} onChange={(event) => setStatus(event.target.value as ReviewStatus)}>{reviewStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
              {formError && <p className="compliance-error" role="alert">{formError}</p>}
              {formStatus && <p className="compliance-source" role="status">{formStatus}</p>}
              <button className="button primary small" type="submit"><Plus size={14} /> Add dated research note</button>
            </form>
          </section>

          <section className="compliance-card compliance-license-card" aria-labelledby="licensing-title">
            <div className="studio-panel-title"><span>04 / LICENSE + COMPLIANCE REGISTER</span><ShieldCheck size={17} /></div>
            <h3 id="licensing-title">Evidence, not assumptions</h3>
            <p className="compliance-copy">Track licenses and zoning/permit findings separately, with source URL, retrieval time, and status. “Reviewed” means a person checked the cited source; it is not agency approval.</p>
            {records.length > 0 ? (
              <div className="compliance-records">
                {records.map((record) => (
                  <article className="compliance-record" key={record.id}>
                    <div><span className="card-number">{record.lane.toUpperCase()} · {record.status.toUpperCase()}</span><h4>{record.subject}</h4></div>
                    <p>{record.finding}</p>
                    <p><strong>Authority:</strong> {record.authority} · <strong>Source:</strong> {record.sourceName}</p>
                    <a className="text-link" href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceUrl} <ExternalLink size={12} /></a>
                    <time dateTime={record.checkedAt}>Checked {new Date(record.checkedAt).toLocaleString()}</time>
                  </article>
                ))}
              </div>
            ) : <div className="compliance-map-placeholder">No research notes yet. Notes remain in this browser tab until you close it.</div>}
            <div className="compliance-export">
              <button className="button small" type="button" onClick={() => downloadResearch(records, gisResult, county, checkedEmergencyItems, inventory, systemRecords)}><ArrowDownToLine size={14} /> Export source register</button>
              <span>Exports citations, emergency review, safety integration notes, and inventory. No parcel or address fields exist.</span>
            </div>
            <p className="studio-footnote">For each decision, verify the issuing authority, applicable edition/date, license scope and status, and any local amendments directly. Conflicts or missing evidence must be escalated to the authority and licensed professionals—not resolved by lowering safety requirements.</p>
          </section>

          <section className="compliance-card" aria-labelledby="preparedness-title">
            <div className="studio-panel-title"><span>05 / EMERGENCY PREPAREDNESS</span><ShieldCheck size={17} /></div>
            <h3 id="preparedness-title">Preparedness review checklist</h3>
            <p className="compliance-copy">Check only that a topic has been reviewed with responsible people. These acknowledgements do not mean that a plan, system, or site passed a test or is safe.</p>
            <div className="compliance-checklist">
              {emergencyChecklist.map((item) => (
                <label key={item}><input type="checkbox" checked={checkedEmergencyItems.includes(item)} onChange={(event) => setCheckedEmergencyItems((current) => event.target.checked ? [...current, item] : current.filter((entry) => entry !== item))} /><span>{item}</span></label>
              ))}
            </div>
            <p className="studio-footnote">{checkedEmergencyItems.length} of {emergencyChecklist.length} review acknowledgements recorded locally. This is not a readiness score, emergency instruction, or substitute for an approved emergency action plan and competent training.</p>
          </section>

          <section className="compliance-card" aria-labelledby="integration-title">
            <div className="studio-panel-title"><span>06 / SAFETY-SYSTEM INTEGRATION PLAN</span><ShieldCheck size={17} /></div>
            <h3 id="integration-title">Plan interfaces; keep control local</h3>
            <p className="compliance-safety-banner"><strong>No remote actuation is connected.</strong> Do not enter API keys, passwords, network addresses, alarm bypasses, or operating setpoints. Safety-critical systems require qualified integration, independent interlocks, a local manual fallback, and tested failure behavior.</p>
            <div className="compliance-dashboard" aria-label="Safety system status panels">
              {['Power + backup', 'Water + treatment', 'Air + ventilation'].map((system) => (
                <article key={system}><span>{system}</span><strong>NOT CONNECTED</strong><button type="button" disabled>Remote control unavailable</button><small>Status data and commands are not received or sent.</small></article>
              ))}
            </div>
            <form className="compliance-record-form" onSubmit={addSafetySystem}>
              <label className="field"><span>Safety-system scope</span><select value={systemName} onChange={(event) => setSystemName(event.target.value)}><option>Power / energy storage</option><option>Water treatment / contamination monitoring</option><option>Air quality / ventilation</option><option>Fire / alarm / communications</option><option>Flood / drainage monitoring</option><option>Elevator / emergency communication</option><option>Building controls / local fallback</option></select></label>
              <label className="field"><span>Responsible licensed role (not a personal name)</span><input value={responsibleRole} onChange={(event) => setResponsibleRole(event.target.value)} maxLength={100} required placeholder="e.g. licensed controls integrator" /></label>
              <label className="field"><span>Required fail-safe / manual fallback review question</span><textarea value={failSafe} onChange={(event) => setFailSafe(event.target.value)} maxLength={600} required placeholder="Record the professional review question; do not enter operating commands." /></label>
              <label className="field"><span>Official or manufacturer documentation URL</span><input type="url" value={integrationSource} onChange={(event) => setIntegrationSource(event.target.value)} required placeholder="https://..." /></label>
              {formError && <p className="compliance-error" role="alert">{formError}</p>}
              <button className="button small" type="submit">Add integration planning note</button>
            </form>
            {systemRecords.map((record) => <article className="compliance-record" key={record.id}><strong>{record.system} · {record.state}</strong><p>Responsible role: {record.responsibleRole}</p><p>Fail-safe review: {record.failSafe}</p><a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.sourceUrl}</a></article>)}
          </section>

          <section className="compliance-card compliance-form-card" aria-labelledby="inventory-title">
            <div className="studio-panel-title"><span>07 / CONTINUITY INVENTORY</span><FileSearch size={17} /></div>
            <h3 id="inventory-title">Seeds, livestock, and critical supplies</h3>
            <p className="compliance-copy">A private continuity-planning ledger for seed lots, animal holdings, feed, water, veterinary supplies, and other essentials. Do not enter names, precise location, parcel details, or sensitive security information. Entries stay in this browser tab unless you export them.</p>
            <form className="compliance-record-form" onSubmit={addInventory}>
              <label className="field"><span>Inventory category</span><select value={inventoryCategory} onChange={(event) => setInventoryCategory(event.target.value)}><option>Seed lots</option><option>Livestock holdings</option><option>Feed / forage</option><option>Water reserve</option><option>Medical / veterinary supplies</option><option>Power / fuel supplies</option><option>Other critical supplies</option></select></label>
              <label className="field"><span>Item / species or lot description</span><input value={inventoryItem} onChange={(event) => setInventoryItem(event.target.value)} maxLength={100} required placeholder="Non-sensitive description" /></label>
              <div className="compliance-intake">
                <label className="field"><span>Quantity / count</span><input value={inventoryQuantity} onChange={(event) => setInventoryQuantity(event.target.value)} maxLength={40} required placeholder="Count or amount" /></label>
                <label className="field"><span>Unit</span><input value={inventoryUnit} onChange={(event) => setInventoryUnit(event.target.value)} maxLength={30} required placeholder="seeds, animals, kg…" /></label>
              </div>
              <label className="field"><span>Next review / viability check date</span><input type="date" value={inventoryReviewDate} onChange={(event) => setInventoryReviewDate(event.target.value)} /></label>
              <button className="button small" type="submit"><Plus size={14} /> Add inventory record</button>
            </form>
            {inventory.length > 0 ? <div className="compliance-records">{inventory.map((item) => <article className="compliance-record" key={item.id}><strong>{item.category}: {item.item}</strong><p>{item.quantity} {item.unit}{item.reviewDate ? ` · review by ${item.reviewDate}` : ''}</p></article>)}</div> : <div className="compliance-map-placeholder">No inventory recorded.</div>}
          </section>
        </div>
      </div>
    </section>
  )
}
