'use client'

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
  FileText,
  MapPin,
  Shield,
  UsersRound,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { assessPhysicalEnvelope, buildPlanningBrief, feasibilityItems, getUnresolvedItems, type FeasibilityAnswer, type PlanningDraft } from '@/lib/planning'
import PublishedContent from '@/components/published-content'
import SubterraneanDesignStudio from '@/components/subterranean-design-studio'
import ComplianceResearchWorkspace from '@/components/compliance-research-workspace'
import CommunityPreparednessWorkspace from '@/components/community-preparedness-workspace'
import LlmSanctuaryWorkspace from '@/components/llm-sanctuary-workspace'

type Planner = PlanningDraft
type Contact = {
  alias: string
  channel: 'Email' | 'Phone'
  email: string
  phone: string
  area: string
  window: 'Weekday mornings' | 'Weekday afternoons' | 'Weekday evenings' | 'Email only — no calls'
  consent: boolean
  marketing: boolean
}
const initialPlanner: Planner = {
  goal: '',
  occupancy: '',
  duration: '',
  area: '',
  projectType: '',
  soilType: '',
  accessConstraint: '',
  existingSlab: '',
  ownerPriorities: [],
  feasibility: {},
  redactions: { area: true, occupancy: true, duration: false, goal: false, feasibility: false, priorities: false },
}
const initialContact: Contact = {
  alias: '',
  channel: 'Email',
  email: '',
  phone: '',
  area: '',
  window: 'Weekday mornings',
  consent: false,
  marketing: false,
}
const solutions = [
  { id: 'storm', number: '01 / STORM SHELTERS', title: 'Storm shelters', copy: 'Explore residential storm shelter options and the factors that shape a site-specific conversation.', target: 'comparison' },
  { id: 'room', number: '02 / SAFE ROOMS', title: 'Safe rooms', copy: 'Compare interior and garage-adjacent concepts for shorter-duration protection goals.', target: 'comparison' },
  { id: 'custom', number: '03 / CUSTOM PLANNING', title: 'Custom bunkers', copy: 'Start a broader conversation about long-duration needs, utilities, access, and site constraints.', target: 'comparison' },
]
const criteria = [
  { id: 'hazard', label: 'Hazard goals', values: ['Wind / debris planning', 'Storm protection goals', 'Site and threat specific'] },
  { id: 'occupancy', label: 'Occupancy', values: ['Household scale', 'Room-scale', 'Defined in consultation'] },
  { id: 'duration', label: 'Expected duration', values: ['Short stay', 'Short stay', 'Depends on design brief'] },
  { id: 'access', label: 'Possible placement', values: ['Interior / exterior', 'Interior / garage', 'Site dependent'] },
  { id: 'utilities', label: 'Utilities', values: ['Varies by design', 'Varies by design', 'Longer-duration systems need planning'] },
]
const priorities = ['Longer duration', 'Air filtration', 'Medical access', 'Daily accessibility', 'Budget', 'Simple installation']
const stepNames = ['Your goal', 'Project context', 'Feasibility', 'Review & share']
const workspaces = [
  { id: 'community', label: 'Readiness' },
  { id: 'research', label: 'Hazards & sources' },
  { id: 'design', label: 'Safety-place studio' },
  { id: 'solutions', label: 'Approaches' },
  { id: 'comparison', label: 'Compare' },
  { id: 'sanctuary', label: 'LLM Sanctuary' },
  { id: 'approach', label: 'Guidance' },
  { id: 'planner', label: 'Community brief' },
] as const
type WorkspaceId = typeof workspaces[number]['id']

function Blueprint() {
  const [activeNode, setActiveNode] = useState('shell')
  const descriptions: Record<string, string> = {
    shell: 'Envelope concept • dimensions and assemblies require project-specific engineering',
    air: 'Air-system concept • configuration and performance require qualified review',
    exit: 'Egress concept • location and code requirements are site dependent',
  }
  return (
    <div className="blueprint" aria-label="Illustrative interactive shelter cross-section">
      <span className="dimension top">CONCEPTUAL SECTION / NOT FOR CONSTRUCTION</span>
      <span className="dimension side">SCHEMATIC ONLY</span>
      <span className="plan-tag">HL / STUDY 001</span>
      <svg className="plan-svg" viewBox="0 0 500 300" role="img" aria-labelledby="blueprint-title blueprint-desc">
        <title id="blueprint-title">Illustrative shelter cutaway</title>
        <desc id="blueprint-desc">A non-engineered vector schematic showing an underground room, surrounding layers, an air-system concept and an egress concept. Select the marked points for plain-language notes.</desc>
        <g fill="none" stroke="#7394c5" strokeWidth="1">
          <path d="M44 75h413M44 82h413M44 89h413" strokeDasharray="3 5" opacity=".6" />
          <path d="M117 93v113h246V93M132 106v93h216v-93z" stroke="#8ba9d6" strokeWidth="2" />
          <path d="M132 106h216v16H132zM132 183h216v16H132z" stroke="#d9a463" opacity=".9" />
          <path d="M148 124h73v49h-73zM258 124h73v49h-73z" />
          <path d="M145 139h-35v-19M334 137h42v-29h22" />
          <path d="M237 199v28h36v-28M354 161h27v39h22v27" strokeDasharray="5 4" />
          <path d="M93 205h300M102 215h282M112 225h262" opacity=".5" />
          <path d="M117 89v117M363 89v117" strokeDasharray="2 4" opacity=".55" />
        </g>
        <g fill="#9fb9e5" fontFamily="DM Mono, monospace" fontSize="8">
          <text x="153" y="151">PLANNED SPACE</text><text x="265" y="151">UTILITY ZONE</text>
          <text x="111" y="245">SITE / DRAINAGE CONDITIONS VARY</text>
        </g>
        <g role="group" aria-label="Blueprint information points">
          <g onClick={() => setActiveNode('shell')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNode('shell') } }} tabIndex={0} role="button" aria-label="Envelope concept information">
            <circle cx="132" cy="111" r="7" fill="#d97706" stroke="#f3cb91" /><circle cx="132" cy="111" r="12" fill="none" stroke="#d97706" opacity=".5" />
          </g>
          <g onClick={() => setActiveNode('air')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNode('air') } }} tabIndex={0} role="button" aria-label="Air system concept information">
            <circle cx="379" cy="108" r="7" fill="#4f83e5" stroke="#acc7ff" /><circle cx="379" cy="108" r="12" fill="none" stroke="#4f83e5" opacity=".5" />
          </g>
          <g onClick={() => setActiveNode('exit')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNode('exit') } }} tabIndex={0} role="button" aria-label="Egress concept information">
            <circle cx="392" cy="226" r="7" fill="#4f83e5" stroke="#acc7ff" /><circle cx="392" cy="226" r="12" fill="none" stroke="#4f83e5" opacity=".5" />
          </g>
        </g>
      </svg>
      <span className="plan-caption" aria-live="polite">{descriptions[activeNode]}</span>
    </div>
  )
}

function saveJson(data: unknown) {
  const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(file)
  link.download = 'shelter-planning-brief.json'
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function PlanningExperience() {
  const [plan, setPlan] = useState<Planner>(initialPlanner)
  const [contact, setContact] = useState<Contact>(initialContact)
  const [step, setStep] = useState(0)
  const [filter, setFilter] = useState('All goals')
  const [whyOpen, setWhyOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [reference, setReference] = useState('')
  const [referenceKey, setReferenceKey] = useState('')
  const [receiptChecked, setReceiptChecked] = useState(false)
  const [shareNotice, setShareNotice] = useState('')
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('community')
  const workspaceTabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const stageTabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const unresolved = getUnresolvedItems(plan)
  const physicalEnvelope = assessPhysicalEnvelope(plan)
  const displayedRows = filter === 'All goals' ? criteria : criteria.filter((row) =>
    filter === 'Tornado' ? ['hazard', 'occupancy', 'duration', 'access'].includes(row.id) :
      filter === 'Blast' ? ['hazard', 'access', 'utilities'].includes(row.id) :
        ['duration', 'utilities', 'access'].includes(row.id),
  )
  const updatePlan = <K extends keyof Planner>(key: K, value: Planner[K]) => setPlan((current) => ({ ...current, [key]: value }))
  const updateContact = <K extends keyof Contact>(key: K, value: Contact[K]) => setContact((current) => ({ ...current, [key]: value }))
  const selectWorkspace = (workspace: WorkspaceId) => {
    setActiveWorkspace(workspace)
    document.getElementById('workspace-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const handleWorkspaceKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % workspaces.length
      : event.key === 'ArrowLeft' ? (index - 1 + workspaces.length) % workspaces.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? workspaces.length - 1
            : -1
    if (nextIndex < 0) return
    event.preventDefault()
    setActiveWorkspace(workspaces[nextIndex].id)
    workspaceTabRefs.current[nextIndex]?.focus()
  }
  const handleStageKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = event.key === 'ArrowRight' ? (index + 1) % stepNames.length
      : event.key === 'ArrowLeft' ? (index - 1 + stepNames.length) % stepNames.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? stepNames.length - 1
            : -1
    if (nextIndex < 0) return
    event.preventDefault()
    setStep(nextIndex)
    stageTabRefs.current[nextIndex]?.focus()
  }
  const exportCoReview = () => {
    setShareNotice('')
    try {
      const packageText = JSON.stringify({
        type: 'esspt-co-review',
        version: 1,
        brief: buildPlanningBrief(plan),
        ownerPriorities: plan.redactions.priorities ? [] : plan.ownerPriorities,
      }, null, 2)
      const file = new Blob([packageText], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(file)
      link.download = 'co-review.json'
      link.click()
      URL.revokeObjectURL(link.href)
      setShareNotice('Co-review file downloaded. It contains the details you chose to include; share it with your co-reviewer directly.')
    } catch {
      setShareNotice('The co-review file could not be created in this browser.')
    }
  }
  const submitInquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmissionError('')
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          brief: buildPlanningBrief(plan),
          contact: { ...contact, acknowledgement: 'on_page' },
        }),
      })
      const result = await response.json() as { reference?: string; referenceKey?: string; error?: string }
      if (!response.ok || !result.reference || !result.referenceKey) {
        throw new Error(result.error ?? 'Your request could not be saved. Please try again later.')
      }
      setReference(result.reference)
      setReferenceKey(result.referenceKey)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Your request could not be saved. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }
  const checkReceipt = async () => {
    if (!reference || !referenceKey) return
    setSubmissionError('')
    try {
      const response = await fetch('/api/inquiries/check-in', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reference, referenceKey }),
      })
      const result = await response.json() as { received?: boolean; error?: string }
      if (!response.ok || !result.received) throw new Error(result.error ?? 'Receipt confirmation is unavailable.')
      setReceiptChecked(true)
      setReferenceKey('')
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Receipt confirmation is unavailable.')
    }
  }
  const scrollToPlanner = () => {
    setStep(0)
    selectWorkspace('planner')
  }
  const plannerContent = (
    <section className="planner-section" id="planner" aria-labelledby="planner-title">
      <div className="shell section planner-layout">
        <aside className="planner-aside">
          <span className="eyebrow">COMMUNITY BRIEF / START WHERE YOU ARE</span>
          <h2 id="planner-title">Every life matters. Prepare so no one is left out.</h2>
          <p>Bring community needs, concerns, and unanswered questions into one starting brief. This does not assess a hazard or determine if a location is safe.</p>
          <div className="privacy-points">
            <div className="privacy-point"><FileText size={17} /> Your draft stays in this open page and clears when you close or reload it.</div>
            <div className="privacy-point"><Shield size={17} /> Downloads are readable JSON files; include only details you want to share.</div>
            <div className="privacy-point"><MapPin size={17} /> No exact address, GPS coordinates, or security specifications are requested.</div>
          </div>
          <button className="button small" style={{ marginTop: 23 }} onClick={() => setWhyOpen(!whyOpen)} aria-expanded={whyOpen}><CircleHelp size={15} /> Why we ask</button>
          {whyOpen && <div className="why-panel">These broad inputs help organize a conversation. This page does not save your in-progress answers to browser storage or send them anywhere until you submit a consultation request. Downloaded and co-review JSON files are not encrypted. Avoid entering exact locations or security-sensitive details.</div>}
        </aside>
        <div className="planner-card">
          {reference ? (
            <div>
              <div className="eyebrow">REQUEST RECEIVED</div>
              <h3 style={{ marginTop: 12 }}>Thank you. Your community planning request has been received.</h3>
              <div className="reference" aria-label={`Inquiry reference ${reference}`}>{reference}</div>
              <p className="step-hint">This is an on-page-only acknowledgment. No email or text was sent. A response is expected within two business days. Please avoid sharing exact property locations or other sensitive details during initial contact.</p>
              <div className="summary"><dl><div><dt>Preferred contact</dt><dd>{contact.channel}</dd></div><div><dt>Contact window</dt><dd>{contact.window}</dd></div><div><dt>Inquiry reference</dt><dd>{reference}</dd></div><div><dt>Expected response</dt><dd>Within two business days</dd></div></dl></div>
              {!receiptChecked && referenceKey && <div className="one-time-key"><strong>One-time receipt key</strong><code>{referenceKey}</code><p>Save this key before verifying. It is shown once, is never emailed or texted, and cannot be retrieved if lost.</p><div className="staff-actions"><button className="button small" onClick={() => { void navigator.clipboard.writeText(referenceKey) }}>Copy key</button><button className="button primary small" onClick={() => void checkReceipt()}>Verify receipt once</button></div></div>}
              {receiptChecked && <div className="banner success" role="status">Receipt verified. The one-time key has been consumed and cannot be used again.</div>}
              {submissionError && <div className="banner error" role="alert">{submissionError}</div>}
              <button className="button small no-print" style={{ marginTop: 18 }} onClick={() => window.print()}><Download size={14} /> Print receipt</button>
            </div>
          ) : (
            <>
              <div className="progress-head"><span>STEP {step + 1} / 4</span><span>{stepNames[step]}</span></div>
              <div className="progress-track" role="progressbar" aria-label="Planning progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}><div className="progress-fill" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
              <div className="planning-stage-tabs" role="tablist" aria-label="Project planning stages">
                {stepNames.map((name, index) => <button
                  key={name}
                  ref={(element) => { stageTabRefs.current[index] = element }}
                  id={`planning-stage-tab-${index}`}
                  className={`planning-stage-tab${step === index ? ' active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={step === index}
                  aria-controls={`planning-stage-panel-${index}`}
                  tabIndex={step === index ? 0 : -1}
                  onClick={() => setStep(index)}
                  onKeyDown={(event) => handleStageKeyDown(event, index)}
                >{name}</button>)}
              </div>
              <div role="tabpanel" id="planning-stage-panel-0" aria-labelledby="planning-stage-tab-0" tabIndex={0} hidden={step !== 0}>
              {step === 0 && <>
                <h3>What would you like to plan for?</h3><p className="step-hint">Choose a starting point. This is not a technical recommendation.</p>
                <div className="option-grid">{[['Storm shelter', 'Storm protection goals'], ['Safe room', 'Short-duration shelter goals'], ['Custom shelter', 'Broader resilience planning']].map(([label, hint]) => <button key={label} className={`option ${plan.goal === label ? 'active' : ''}`} onClick={() => updatePlan('goal', label)} aria-pressed={plan.goal === label}>{label}<span>{hint}</span></button>)}</div>
              </>}
              </div>
              <div role="tabpanel" id="planning-stage-panel-1" aria-labelledby="planning-stage-tab-1" tabIndex={0} hidden={step !== 1}>
              {step === 1 && <>
                <h3>Share broad context, if known.</h3><p className="step-hint">These ranges help guide a conversation; they are not capacity recommendations.</p>
                <div className="field"><label htmlFor="occupancy">Approximate occupancy range</label><select id="occupancy" value={plan.occupancy} onChange={(e) => updatePlan('occupancy', e.target.value)}><option value="">Choose a broad range</option><option>1–2 people</option><option>3–5 people</option><option>6–10 people</option><option>More than 10</option><option>Not sure yet</option></select></div>
                <div className="field"><label htmlFor="duration">Target duration (rough goal)</label><select id="duration" value={plan.duration} onChange={(e) => updatePlan('duration', e.target.value)}><option value="">Choose a broad range</option><option>Hours</option><option>Overnight</option><option>Several days</option><option>Weeks or longer</option><option>Not sure yet</option></select></div>
                <div className="field"><label htmlFor="area">Broad area (optional)</label><select id="area" value={plan.area} onChange={(e) => updatePlan('area', e.target.value)}><option value="">Skip for now</option><option>Bastrop County</option><option>Williamson County</option><option>Travis County</option><option>Lee County</option><option>Other Central Texas area</option></select></div>
                <fieldset className="priority-picker"><legend>What matters most to you? Choose any that fit.</legend><div className="priority-options">{priorities.map((priority) => <label className="redaction" key={priority}><input type="checkbox" checked={plan.ownerPriorities.includes(priority)} onChange={(event) => setPlan((current) => ({ ...current, ownerPriorities: event.target.checked ? [...current.ownerPriorities, priority] : current.ownerPriorities.filter((item) => item !== priority) }))} />{priority}</label>)}</div></fieldset>
              </>}
              </div>
              <div role="tabpanel" id="planning-stage-panel-2" aria-labelledby="planning-stage-tab-2" tabIndex={0} hidden={step !== 2}>
              {step === 2 && <>
                <h3>What is already known about the site?</h3><p className="step-hint">Choose an honest status for each item. Unknowns will never block you.</p>
                <div className="check-row"><div><div className="check-title">Project type</div><div className="check-hint">New construction or an existing home?</div></div><div className="segmented" role="group" aria-label="Project type">{['New build', 'Retrofit', 'Unsure'].map((value) => <button key={value} className={plan.projectType === value ? 'active' : ''} aria-pressed={plan.projectType === value} onClick={() => updatePlan('projectType', value)}>{value}</button>)}</div></div>
                <div className="feasibility-fields">
                  <label className="field">Broad soil / water note<select value={plan.soilType} onChange={(event) => updatePlan('soilType', event.target.value)}><option value="">Not sure yet</option><option>Expansive clay</option><option>Shallow bedrock or chalk</option><option>High water table</option><option>Other / mixed</option><option>Unknown</option></select></label>
                  <label className="field">Equipment access<select value={plan.accessConstraint} onChange={(event) => updatePlan('accessConstraint', event.target.value)}><option value="">Not sure yet</option><option>Conventional equipment access</option><option>Constrained or zero-lot-line</option><option>Crane or restricted equipment access</option></select></label>
                  {plan.projectType === 'Retrofit' && <label className="field">Existing slab at proposed location?<select value={plan.existingSlab} onChange={(event) => updatePlan('existingSlab', event.target.value)}><option value="">Not sure yet</option><option>Yes</option><option>No</option></select></label>}
                </div>
                <div className={`envelope-card ${physicalEnvelope.category === 'Potential below-grade fit conflict' ? 'envelope-warning' : ''}`} role="status"><span className="eyebrow">PRELIMINARY PHYSICAL-ENVELOPE SCREEN</span><h4>{physicalEnvelope.category}</h4><p>{physicalEnvelope.guidance}</p>{physicalEnvelope.flags.length > 0 && <ul>{physicalEnvelope.flags.map((flag) => <li key={flag}>{flag}</li>)}</ul>}<small>Informational screening only. It does not determine legal, engineering, soil, or property feasibility; no site-specific incompatibility is concluded here.</small></div>
                <div className="checklist">{feasibilityItems.map(([key, hint]) => <div className="check-row" key={key}><div><div className="check-title">{key}</div><div className="check-hint">{hint}</div></div><div className="segmented" role="group" aria-label={`${key} status`}>{(['Known', 'Unsure', 'Requires assessment'] as FeasibilityAnswer[]).map((value) => <button key={value} className={plan.feasibility[key] === value ? 'active' : ''} aria-pressed={plan.feasibility[key] === value} onClick={() => setPlan((current) => ({ ...current, feasibility: { ...current.feasibility, [key]: value } }))}>{value}</button>)}</div></div>)}</div>
              </>}
              </div>
              <div role="tabpanel" id="planning-stage-panel-3" aria-labelledby="planning-stage-tab-3" tabIndex={0} hidden={step !== 3}>
              {step === 3 && <>
                <h3>Review your brief and decide what to share.</h3><p className="step-hint">The downloaded or co-review brief is readable JSON. If you request a consultation, the carpenter receives only the details you have chosen to include and the contact details you provide below.</p>
                <div className="summary"><dl><div><dt>Goal</dt><dd>{plan.goal || 'Not selected'}</dd></div><div><dt>Project type</dt><dd>{plan.projectType || 'Not sure yet'}</dd></div><div><dt>Occupancy</dt><dd>{plan.occupancy || 'Not specified'}</dd></div><div><dt>Duration</dt><dd>{plan.duration || 'Not specified'}</dd></div><div><dt>Area</dt><dd>{plan.area || 'Not specified'}</dd></div></dl><div style={{ marginTop: 14, fontSize: 11, color: '#bbc5d1' }}>Unresolved or unreviewed: {unresolved.length ? unresolved.map(([key]) => key).join(', ') : 'No items marked yet'}</div></div>
                <div className="summary"><dt>Your priorities</dt><dd>{plan.ownerPriorities.length ? plan.ownerPriorities.join(' · ') : 'Not selected'}</dd></div>
                <div className="filter-label" style={{ marginTop: 16 }}>Choose what to leave out of your shared brief</div>
                <div className="redaction-list">{[['area', 'Broad area / county'], ['occupancy', 'Occupancy range'], ['duration', 'Target duration'], ['goal', 'Project goal'], ['feasibility', 'Feasibility notes'], ['priorities', 'Your priorities']].map(([key, label]) => <label className="redaction" key={key}><input type="checkbox" checked={plan.redactions[key]} onChange={(event) => setPlan((current) => ({ ...current, redactions: { ...current.redactions, [key]: event.target.checked } }))} /> Leave out {label}</label>)}</div>
                <div className="hero-actions no-print" style={{ marginTop: 8 }}><button type="button" className="button small" onClick={() => saveJson(buildPlanningBrief(plan))}><Download size={14} /> Download readable JSON</button><button type="button" className="button small" onClick={() => window.print()}><FileText size={14} /> Print / save as PDF</button></div>
                <div className="co-review-create"><h4>Invite a co-decision maker</h4><p>Download a readable review file for your co-reviewer. They can add their own priorities and return an alignment summary. Differing priorities are surfaced as topics to resolve—not treated as consensus.</p><button className="button small" type="button" onClick={exportCoReview}>Download co-review file</button>{shareNotice && <p className="save-line" role="status">{shareNotice}</p>}<p className="step-hint">This JSON file is not encrypted. Share it directly only with people you trust.</p><a className="text-link" href="/co-review">Have a co-review file? Open the co-review workspace →</a></div>
                <form onSubmit={submitInquiry} style={{ marginTop: 20 }}>
                  <div className="filter-label">REQUEST A CONSULTATION / OPTIONAL</div>
                  <p className="step-hint" style={{ marginTop: 7 }}>Only the details included in the shared brief and minimum contact details needed to reply are submitted. Acknowledgment is on-page only; no email or text is sent.</p>
                  <div className="contact-grid" style={{ marginTop: 13 }}>
                    <div className="field"><label htmlFor="alias">Preferred name or alias</label><input id="alias" value={contact.alias} maxLength={80} onChange={(event) => updateContact('alias', event.target.value)} required /></div>
                    <div className="field"><label htmlFor="channel">Preferred contact channel</label><select id="channel" value={contact.channel} onChange={(event) => updateContact('channel', event.target.value as Contact['channel'])}><option>Email</option><option>Phone</option></select></div>
                    {contact.channel === 'Email' ? <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" maxLength={254} value={contact.email} onChange={(event) => updateContact('email', event.target.value)} required /></div> : <div className="field"><label htmlFor="phone">Phone number</label><input id="phone" type="tel" maxLength={30} value={contact.phone} onChange={(event) => updateContact('phone', event.target.value)} required /></div>}
                    <div className="field"><label htmlFor="contact-area">Broad county / area (optional)</label><input id="contact-area" maxLength={100} value={contact.area} onChange={(event) => updateContact('area', event.target.value)} placeholder="County or general area only" /></div>
                    <div className="field"><label htmlFor="window">Contact window</label><select id="window" value={contact.window} onChange={(event) => updateContact('window', event.target.value as Contact['window'])}><option>Weekday mornings</option><option>Weekday afternoons</option><option>Weekday evenings</option><option>Email only — no calls</option></select></div>
                  </div>
                  <label className="consent"><input type="checkbox" checked={contact.consent} onChange={(event) => updateContact('consent', event.target.checked)} required /><span>I agree that Enter Sanctum SubTerranean Private Construction may contact me about this request using my selected channel. Required to submit. This does not enroll me in marketing.</span></label>
                  <label className="consent"><input type="checkbox" checked={contact.marketing} onChange={(event) => updateContact('marketing', event.target.checked)} /><span>Optional: send me occasional company or service updates.</span></label>
                  {submissionError && <div className="banner error" role="alert">{submissionError}</div>}
                  <div className="planner-controls"><button type="button" className="button small" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button><button type="submit" className="button primary small" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send consultation request'} <ArrowRight size={15} /></button></div>
                </form>
              </>}
              </div>
              {step < 3 && <div className="planner-controls"><button type="button" className="button small" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={15} /> Back</button><button type="button" className="button primary small" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={15} /></button></div>}
              <div className="save-line"><Check size={12} /> Answers remain in this page only; reloading or closing the tab clears them.</div>
            </>
          )}
        </div>
      </div>
    </section>
  )

  return (
    <main>
      <header className="site-header shell">
        <a className="brand" href="#" aria-label="CommonGround Atlas home"><span className="brand-mark"><Shield size={18} /></span><span className="brand-copy"><span className="brand-name">COMMONGROUND ATLAS</span><span className="brand-suffix">GLOBAL COMMUNITY READINESS</span></span></a>
        <nav className="nav" aria-label="Main navigation"><button type="button" onClick={() => selectWorkspace('community')}>Readiness</button><button type="button" onClick={() => selectWorkspace('research')}>Hazards & sources</button><button type="button" onClick={() => selectWorkspace('design')}>Safety-place studio</button><button type="button" onClick={() => selectWorkspace('sanctuary')}>LLM Sanctuary</button><button className="nav-cta" type="button" onClick={scrollToPlanner}>Community brief <ArrowRight size={14} /></button></nav>
      </header>
      <div className="shell">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <div className="eyebrow">A GLOBAL COMMUNITY READINESS ATLAS</div>
            <h1 id="hero-title">A world that <em>prepares together.</em></h1>
            <p className="hero-copy">A shared starting point for communities to understand risk, include everyone in preparedness, and coordinate trusted next steps across borders. From earthquakes and floods to disease outbreaks, volcanic hazards, meteors, conflict, and unknown events.</p>
            <div className="hero-actions"><button className="button primary" onClick={() => selectWorkspace('community')}>Explore community readiness <ArrowRight size={16} /></button><button className="button" onClick={() => selectWorkspace('sanctuary')}>Build an LLM Sanctuary concept <ArrowDown size={15} /></button></div>
            <div className="hero-note"><FileText size={13} /> The ambition is to help protect every life. This prototype cannot promise that everybody can be saved.</div>
          </div>
          <Blueprint />
        </section>
        <section className="trust-strip" aria-label="Planning commitments">
          <div className="trust-item"><span className="trust-icon"><UsersRound size={17} /></span> Community-led preparedness, not one-size-fits-all plans</div>
          <div className="trust-item"><span className="trust-icon"><FileText size={17} /></span> Official source links—live integrations are not connected</div>
          <div className="trust-item"><span className="trust-icon"><Shield size={17} /></span> Human authorities and qualified experts stay in charge</div>
        </section>
      </div>
      <div className="shell workspace-tab-shell workspace-nav" id="workspace-tabs">
        <div className="workspace-tabs" role="tablist" aria-label="Planning workspaces">
          {workspaces.map((workspace, index) => <button
            key={workspace.id}
            ref={(element) => { workspaceTabRefs.current[index] = element }}
            id={`workspace-tab-${workspace.id}`}
            type="button"
            role="tab"
            aria-selected={activeWorkspace === workspace.id}
            aria-controls={`workspace-panel-${workspace.id}`}
            tabIndex={activeWorkspace === workspace.id ? 0 : -1}
            onClick={() => setActiveWorkspace(workspace.id)}
            onKeyDown={(event) => handleWorkspaceKeyDown(event, index)}
          >{workspace.label}</button>)}
        </div>
      </div>
      <div id="workspace-panel-community" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-community" tabIndex={0} hidden={activeWorkspace !== 'community'}><CommunityPreparednessWorkspace /></div>
      <div id="workspace-panel-design" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-design" tabIndex={0} hidden={activeWorkspace !== 'design'}><SubterraneanDesignStudio /></div>
      <div id="workspace-panel-research" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-research" tabIndex={0} hidden={activeWorkspace !== 'research'}><ComplianceResearchWorkspace /></div>
      <div id="workspace-panel-solutions" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-solutions" tabIndex={0} hidden={activeWorkspace !== 'solutions'}>
        <section className="section shell" aria-labelledby="solutions-title">
          <div className="section-heading"><div><span className="eyebrow">SHELTER & CARPENTRY</span><h2 id="solutions-title">Begin with the right questions.</h2></div><p>Every property is different. Start with plain-language options, then explore the factors that deserve a closer look.</p></div>
          <div className="solution-grid">{solutions.map((solution) => <button className="solution-card" type="button" key={solution.id} onClick={() => { setPlan((current) => ({ ...current, goal: solution.id === 'storm' ? 'Storm shelter' : solution.id === 'room' ? 'Safe room' : 'Custom shelter' })); selectWorkspace('comparison') }}><span className="card-number">{solution.number}</span><h3>{solution.title}</h3><p>{solution.copy}</p><span className="card-link">Explore planning guidance <ChevronRight size={16} /></span></button>)}</div>
        </section>
      </div>
      <div id="workspace-panel-sanctuary" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-sanctuary" tabIndex={0} hidden={activeWorkspace !== 'sanctuary'}><LlmSanctuaryWorkspace /></div>
      <div id="workspace-panel-comparison" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-comparison" tabIndex={0} hidden={activeWorkspace !== 'comparison'}>
        <section className="section shell" aria-labelledby="compare-title">
          <div className="section-heading"><div><span className="eyebrow">STAGE 02 / COMPARISON</span><h2 id="compare-title">Compare the planning landscape.</h2></div><p>Use these broad prompts to prepare for a conversation—not to select a final design.</p></div>
          <div className="disclaimer"><CircleHelp size={16} /> Planning guidance — not an engineered recommendation, code interpretation, site assessment, or guarantee of protection.</div>
          <div className="sticky-filter"><div className="filter-row" role="group" aria-label="Filter comparison criteria"><span className="filter-label">Filter by planning goal</span>{['All goals', 'Tornado', 'Blast', 'Extended stay'].map((item) => <button key={item} className={`chip ${filter === item ? 'selected' : ''}`} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>)}</div></div>
          <div className="table-wrap"><table className="compare-table"><thead><tr><th scope="col">Planning lens</th><th scope="col">Storm shelter</th><th scope="col">Safe room</th><th scope="col">Custom shelter</th></tr></thead><tbody>{displayedRows.map((row) => <tr key={row.id}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={`${row.id}-${index}`}>{value}</td>)}</tr>)}</tbody></table><div className="table-foot">Illustrative categories only / Requirements must be validated with qualified professionals and authorities having jurisdiction.</div></div>
        </section>
      </div>
      <div id="workspace-panel-approach" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-approach" tabIndex={0} hidden={activeWorkspace !== 'approach'}>
        <section className="section shell" aria-labelledby="evidence-title">
          <div className="section-heading"><div><span className="eyebrow">HOW IT'S BUILT / CONCEPTS</span><h2 id="evidence-title">See the idea. Respect the unknowns.</h2></div><p>Concept diagrams help explain a discussion. They are not construction drawings or proof of performance.</p></div>
          <div className="solution-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            {[['01 / ENVELOPE', 'Structure & enclosure', 'Materials, connections, soil conditions, and loads require project-specific design and review.'], ['02 / AIR & UTILITIES', 'Air and utility concepts', 'Filtration, ventilation, backup power, and service life depend on the intended use and designed system.'], ['03 / ACCESS & DRAINAGE', 'Egress and water management', 'Access, drainage, groundwater, and local code requirements need qualified site assessment.']].map(([tag, title, copy]) => <article className="solution-card" key={tag}><span className="card-number">{tag}</span><h3>{title}</h3><p>{copy}</p><span className="card-link"><span className="status-pill">CONCEPT ONLY / SITE-DEPENDENT</span></span></article>)}
          </div>
          <div className="hero-actions"><button className="button small" type="button" onClick={scrollToPlanner}>Explore your planning brief <ArrowRight size={14} /></button><span className="hero-note"><CheckCircle2 size={13} /> Final design and technical claims require qualified review.</span></div>
        </section>
        <PublishedContent />
      </div>
      <div id="workspace-panel-planner" className="workspace-panel" role="tabpanel" aria-labelledby="workspace-tab-planner" tabIndex={0} hidden={activeWorkspace !== 'planner'}>{plannerContent}</div>
      <footer className="footer shell"><div className="footer-row"><strong>COMMONGROUND ATLAS / COMMUNITY READINESS</strong><span>Planning aid—not emergency response or official zone designation.</span><span>Global coordination / concept stage</span></div><div style={{ marginTop: 12 }}>This prototype has no live global hazard feeds, government-agency integrations, verified safety zones, connected AI, or emergency response. Follow instructions from the authorities responsible for your area during real events. The goal is to help communities work toward protecting every life, without promising an outcome no tool can guarantee.</div></footer>
    </main>
  )
}
