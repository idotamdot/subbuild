'use client'

import { useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, Compass, Radio, ShieldCheck, UsersRound } from 'lucide-react'

const hazardScenarios = [
  {
    id: 'earthquake',
    title: 'Earthquake',
    category: 'Geological',
    summary: 'Plan for shaking, aftershocks, service outages, accessible reunification, and safe re-entry decisions.',
    actions: ['Identify local official alerts and building-safety guidance', 'Agree on accessible household and community check-in methods', 'List water, power, medical, and communications dependencies'],
    sourceIds: ['ready', 'usgs-earthquake'],
  },
  {
    id: 'flood',
    title: 'Flood & coastal surge',
    category: 'Water',
    summary: 'Consider flash flooding, river flooding, storm surge, routes that may be cut off, and accessible evacuation support.',
    actions: ['Find official local flood and evacuation information', 'Identify routes and support options without assuming any route is passable', 'Plan for medication, mobility aids, pets, and communication needs'],
    sourceIds: ['ready', 'noaa'],
  },
  {
    id: 'volcano',
    title: 'Volcanic event',
    category: 'Geological',
    summary: 'Use local volcano observatory and civil-protection sources for ashfall, lava, lahars, gases, and evacuation information.',
    actions: ['Locate the responsible volcano observatory and civil-protection authority', 'Record only official, dated hazard and evacuation source links', 'Plan for ash-related health, transport, power, water, and supply disruption'],
    sourceIds: ['usgs-volcano', 'ready'],
  },
  {
    id: 'severe-weather',
    title: 'Severe weather',
    category: 'Atmospheric',
    summary: 'Prepare for locally relevant storms, extreme heat or cold, wind, wildfire smoke, and prolonged utility interruption.',
    actions: ['Subscribe to official local weather and emergency alerts', 'List accessible cooling, warming, and communications alternatives', 'Assign a way to check on neighbors who may need support'],
    sourceIds: ['ready', 'noaa'],
  },
  {
    id: 'public-health',
    title: 'Public-health emergency',
    category: 'Health',
    summary: 'Coordinate continuity of care, trusted health information, accessible communication, and community support.',
    actions: ['Identify local public-health and healthcare authority updates', 'Plan continuity questions with qualified care providers', 'Prepare accessible, multilingual ways to share verified updates'],
    sourceIds: ['cdc', 'who'],
  },
  {
    id: 'space-weather',
    title: 'Meteorite / space-weather contingency',
    category: 'Rare-event exercise',
    summary: 'Use this as a low-probability preparedness exercise. Separate meteorite-impact speculation from monitored space-weather advisories and verified local hazards.',
    actions: ['Use official agencies for actual space-weather notices', 'Exercise communications, power, transport, and service-continuity dependencies', 'Do not infer impact predictions, blast zones, or protective actions from this planner'],
    sourceIds: ['noaa-space'],
  },
  {
    id: 'infrastructure',
    title: 'Major service disruption',
    category: 'Cascading event',
    summary: 'Explore how overlapping power, water, transport, communications, supply, or facility outages affect community support.',
    actions: ['Map critical services and identify a source and owner for each dependency', 'Plan manual communications and offline copies of essential information', 'Coordinate continuity questions with responsible service providers'],
    sourceIds: ['ready', 'who'],
  },
  {
    id: 'speculative',
    title: 'Speculative / unknown event',
    category: 'Tabletop exercise only',
    summary: 'A fictional scenario can test flexible coordination and continuity. It is not a prediction, verified threat, or operational warning.',
    actions: ['Keep the exercise clearly labeled as fictional', 'Test needs reporting, accessible communications, and decision handoffs', 'Use official emergency instructions for every real-world event'],
    sourceIds: ['ready'],
  },
] as const

type HazardScenario = typeof hazardScenarios[number]
type ScenarioId = HazardScenario['id']
type PreparednessSource = {
  id: string
  name: string
  scope: string
  url: string
}

const sources: readonly PreparednessSource[] = [
  { id: 'ready', name: 'Ready.gov', scope: 'U.S. preparedness guidance', url: 'https://www.ready.gov/' },
  { id: 'usgs-earthquake', name: 'USGS Earthquake Hazards Program', scope: 'U.S. earthquake information', url: 'https://www.usgs.gov/programs/earthquake-hazards' },
  { id: 'usgs-volcano', name: 'USGS Volcano Hazards Program', scope: 'U.S. volcano science and observatories', url: 'https://www.usgs.gov/programs/VHP' },
  { id: 'noaa', name: 'NOAA / National Weather Service', scope: 'U.S. weather information and alerts', url: 'https://www.weather.gov/' },
  { id: 'noaa-space', name: 'NOAA Space Weather Prediction Center', scope: 'U.S. space-weather monitoring', url: 'https://www.swpc.noaa.gov/' },
  { id: 'cdc', name: 'U.S. Centers for Disease Control and Prevention', scope: 'U.S. public-health guidance', url: 'https://www.cdc.gov/' },
  { id: 'who', name: 'World Health Organization', scope: 'International public-health information', url: 'https://www.who.int/emergencies' },
]

const preparednessSteps = [
  'Know the official alert sources for your area',
  'List people who may need a check-in or access support',
  'Agree on a primary and backup community contact method',
  'Document essential services and continuity dependencies',
  'Schedule a tabletop exercise and assign follow-up owners',
] as const

type PreparednessStep = typeof preparednessSteps[number]

function getScenario(id: ScenarioId): HazardScenario {
  return hazardScenarios.find((scenario) => scenario.id === id) ?? hazardScenarios[0]
}

function getSourcesForScenario(scenario: HazardScenario): readonly PreparednessSource[] {
  return sources.filter((source) => scenario.sourceIds.some((id) => id === source.id))
}

export default function CommunityPreparednessWorkspace() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('earthquake')
  const [communityName, setCommunityName] = useState('')
  const [region, setRegion] = useState('')
  const [completedSteps, setCompletedSteps] = useState<PreparednessStep[]>([])
  const [downloadNotice, setDownloadNotice] = useState('')

  const selectedScenario = getScenario(selectedScenarioId)
  const selectedSources = getSourcesForScenario(selectedScenario)
  const completedCount = completedSteps.length

  const toggleStep = (step: PreparednessStep) => {
    setCompletedSteps((current) => current.includes(step)
      ? current.filter((item) => item !== step)
      : [...current, step])
  }

  const downloadPlan = () => {
    const plan = {
      title: 'Community preparedness discussion plan',
      version: 1,
      createdAt: new Date().toISOString(),
      community: communityName.trim() || 'Community not specified',
      region: region.trim() || 'Region not specified',
      scenario: {
        id: selectedScenario.id,
        title: selectedScenario.title,
        category: selectedScenario.category,
        planningPrompts: selectedScenario.actions,
      },
      readinessChecklist: preparednessSteps.map((step) => ({
        item: step,
        markedForDiscussion: completedSteps.includes(step),
      })),
      sourceLinks: selectedSources.map(({ name, scope, url }) => ({ name, scope, url })),
      limitations: [
        'This is a community discussion aid, not an emergency alert, evacuation instruction, or official safety-zone designation.',
        'A checked item records a planning discussion only; it does not certify readiness, site safety, or completion of professional review.',
        'For real events, follow current instructions from the local authorities and emergency services responsible for the area.',
      ],
    }
    const file = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'community-preparedness-discussion-plan.json'
    link.click()
    URL.revokeObjectURL(url)
    setDownloadNotice('Discussion plan downloaded. It records planning prompts, not an official emergency plan.')
  }

  return (
    <section className="preparedness-section" aria-labelledby="preparedness-title">
      <div className="shell section">
        <div className="section-heading preparedness-heading">
          <div>
            <span className="eyebrow">COMMUNITY READINESS / ALL-HAZARDS PLANNING</span>
            <h2 id="preparedness-title">Prepare together. Protect more lives.</h2>
          </div>
          <p>No tool can promise to save everyone. Communities can make readiness more inclusive by practicing together, using current official guidance, and planning support before it is needed.</p>
        </div>

        <div className="preparedness-banner" role="note">
          <Radio size={19} aria-hidden="true" />
          <p><strong>Planning workspace—not an emergency alert service.</strong> This prototype has no live hazard feed and is not monitored. For an active event, follow current local authority alerts and emergency services.</p>
        </div>

        <div className="preparedness-layout">
          <section className="preparedness-card scenario-card" aria-labelledby="scenario-title">
            <div className="preparedness-card-heading">
              <span className="preparedness-icon"><Compass size={19} /></span>
              <div><span className="card-number">01 / SCENARIO EXPLORER</span><h3 id="scenario-title">What should your community prepare for?</h3></div>
            </div>
            <p className="preparedness-copy">Choose a scenario to bring up discussion prompts and relevant official information sources. Sources open at the agency; they are not live integrations.</p>
            <div className="scenario-grid" role="group" aria-label="Disaster preparedness scenarios">
              {hazardScenarios.map((scenario) => (
                <button
                  className={`scenario-option${selectedScenarioId === scenario.id ? ' selected' : ''}`}
                  key={scenario.id}
                  type="button"
                  aria-pressed={selectedScenarioId === scenario.id}
                  onClick={() => { setSelectedScenarioId(scenario.id); setDownloadNotice('') }}
                >
                  <span>{scenario.category}</span>
                  <strong>{scenario.title}</strong>
                </button>
              ))}
            </div>

            <div className="scenario-detail" aria-live="polite">
              <span className="status-pill">{selectedScenario.category.toUpperCase()}</span>
              <h4>{selectedScenario.title}</h4>
              <p>{selectedScenario.summary}</p>
              <ul>{selectedScenario.actions.map((action) => <li key={action}>{action}</li>)}</ul>
              <div className="preparedness-sources">
                <span className="filter-label">OFFICIAL INFORMATION TO REVIEW</span>
                {selectedSources.map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
                    <span><strong>{source.name}</strong><small>{source.scope}</small></span><ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ))}
                <p>Verify relevance, current status, and local authority instructions at the source.</p>
              </div>
            </div>
          </section>

          <aside className="preparedness-card readiness-card" aria-labelledby="readiness-title">
            <div className="preparedness-card-heading">
              <span className="preparedness-icon"><UsersRound size={19} /></span>
              <div><span className="card-number">02 / COMMUNITY READINESS</span><h3 id="readiness-title">Start a shared discussion</h3></div>
            </div>
            <p className="preparedness-copy">Capture a few basics and take a discussion checklist to your next community meeting.</p>
            <label className="field">Community or group name<input maxLength={100} value={communityName} onChange={(event) => setCommunityName(event.target.value)} placeholder="Optional" /></label>
            <label className="field">Country, region, or local area<input maxLength={120} value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Use a broad area for this draft" /></label>

            <div className="readiness-progress" aria-label={`${completedCount} of ${preparednessSteps.length} discussion prompts marked`}>
              <div><span>DISCUSSION PROMPTS</span><strong>{completedCount}/{preparednessSteps.length}</strong></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(completedCount / preparednessSteps.length) * 100}%` }} /></div>
            </div>
            <div className="readiness-checklist">
              {preparednessSteps.map((step) => (
                <label key={step} className="readiness-check">
                  <input type="checkbox" checked={completedSteps.includes(step)} onChange={() => toggleStep(step)} />
                  <span>{completedSteps.includes(step) && <Check size={13} aria-hidden="true" />}</span>
                  {step}
                </label>
              ))}
            </div>
            <button className="button primary preparedness-download" type="button" onClick={downloadPlan}><ArrowDownToLine size={15} /> Download discussion plan</button>
            {downloadNotice && <p className="preparedness-notice" role="status">{downloadNotice}</p>}
            <p className="preparedness-footnote"><ShieldCheck size={14} /> Checking a prompt means “discussed for planning”—not verified, approved, or ready for deployment.</p>
          </aside>
        </div>
      </div>
    </section>
  )
}
