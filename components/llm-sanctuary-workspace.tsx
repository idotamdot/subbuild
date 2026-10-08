'use client'

import { useState } from 'react'
import { ArrowDownToLine, Cpu, DatabaseBackup, Power, RadioTower, Snowflake, UsersRound } from 'lucide-react'

const deploymentOptions = [
  { id: 'hosted', label: 'Managed cloud', summary: 'Hosted model services with provider-dependent availability and connectivity.' },
  { id: 'local', label: 'Community-hosted', summary: 'A locally operated model environment with on-site power, cooling, network, and support needs.' },
  { id: 'hybrid', label: 'Hybrid continuity', summary: 'A planned combination of hosted and local services with explicit degraded-mode behavior.' },
] as const

const assistantRoles = [
  'Preparedness information guide',
  'Accessible-language and translation helper',
  'Community meeting summarizer',
  'Exercise and scenario facilitator',
  'Research source organizer',
] as const

const infrastructureDependencies = [
  { id: 'power', label: 'Power and backup', Icon: Power },
  { id: 'cooling', label: 'Cooling and ventilation', Icon: Snowflake },
  { id: 'network', label: 'Network and external connectivity', Icon: RadioTower },
  { id: 'compute', label: 'Compute and service capacity', Icon: Cpu },
  { id: 'recovery', label: 'Data backup and recovery', Icon: DatabaseBackup },
] as const

type DeploymentMode = typeof deploymentOptions[number]['id']
type AssistantRole = typeof assistantRoles[number]
type DependencyId = typeof infrastructureDependencies[number]['id']

export default function LlmSanctuaryWorkspace() {
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('hybrid')
  const [selectedRoles, setSelectedRoles] = useState<AssistantRole[]>([assistantRoles[0]])
  const [dependencies, setDependencies] = useState<DependencyId[]>([])
  const [communityPurpose, setCommunityPurpose] = useState('')
  const [downloadNotice, setDownloadNotice] = useState('')
  const selectedDeployment = deploymentOptions.find((option) => option.id === deploymentMode) ?? deploymentOptions[2]

  const toggleRole = (role: AssistantRole) => {
    setSelectedRoles((current) => current.includes(role)
      ? current.filter((item) => item !== role)
      : [...current, role])
  }

  const toggleDependency = (dependency: DependencyId) => {
    setDependencies((current) => current.includes(dependency)
      ? current.filter((item) => item !== dependency)
      : [...current, dependency])
  }

  const downloadConcept = () => {
    const concept = {
      title: 'Community LLM Sanctuary planning concept',
      version: 1,
      communityPurpose: communityPurpose.trim() || 'Purpose not specified',
      deploymentMode: {
        id: selectedDeployment.id,
        label: selectedDeployment.label,
        description: selectedDeployment.summary,
      },
      assistantRoles: selectedRoles,
      infrastructureDependencies: dependencies,
      humanOversight: [
        'Assign a responsible human owner for every assistant before any future deployment.',
        'Require evaluation, human approval for external actions, and a pause/rollback path.',
        'Do not permit an assistant to issue emergency orders, designate a safe zone, or replace official guidance.',
      ],
      limitations: [
        'This is a planning concept only. No LLM, agent, model hosting, or agency integration is connected.',
        'No server sizing, power capacity, cooling design, security architecture, cost estimate, or continuity guarantee is produced.',
        'Obtain qualified electrical, mechanical, networking, accessibility, emergency-management, and worker-safety review before implementation.',
      ],
    }
    const file = new Blob([JSON.stringify(concept, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'community-llm-sanctuary-concept.json'
    link.click()
    URL.revokeObjectURL(url)
    setDownloadNotice('Concept downloaded. It is a planning brief, not an AI deployment or facility design.')
  }

  return (
    <section className="sanctuary-section" aria-labelledby="llm-sanctuary-title">
      <div className="shell section">
        <div className="section-heading sanctuary-heading">
          <div>
            <span className="eyebrow">PEOPLE + AI CONTINUITY / CONCEPT WORKSPACE</span>
            <h2 id="llm-sanctuary-title">Build a sanctuary for people and the models that support them.</h2>
          </div>
          <p>Plan the role, operating model, and dependencies of a future community AI environment. Human safety and local authority stay in charge; model availability is never a life-safety guarantee.</p>
        </div>

        <div className="sanctuary-notice" role="note">
          <UsersRound size={18} aria-hidden="true" />
          <p><strong>Planning concept only.</strong> This workspace does not connect to an LLM, host models, receive emergency feeds, or operate equipment. Do not use AI output as an alert or emergency instruction.</p>
        </div>

        <div className="sanctuary-layout">
          <section className="sanctuary-card sanctuary-configuration" aria-labelledby="sanctuary-configuration-title">
            <span className="card-number">01 / COMMUNITY PURPOSE</span>
            <h3 id="sanctuary-configuration-title">What should this environment help with?</h3>
            <label className="field">Community purpose<textarea maxLength={600} value={communityPurpose} onChange={(event) => setCommunityPurpose(event.target.value)} placeholder="Example: help organizers find and summarize current official preparedness resources for community exercises." /></label>

            <fieldset className="sanctuary-fieldset">
              <legend>Choose bounded assistant roles to consider</legend>
              <div className="sanctuary-role-list">
                {assistantRoles.map((role) => (
                  <label className="redaction" key={role}>
                    <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)} />
                    {role}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="sanctuary-fieldset">
              <legend>How might models be operated?</legend>
              <div className="deployment-options">
                {deploymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`deployment-option${deploymentMode === option.id ? ' selected' : ''}`}
                    aria-pressed={deploymentMode === option.id}
                    onClick={() => setDeploymentMode(option.id)}
                  >
                    <strong>{option.label}</strong><span>{option.summary}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          <aside className="sanctuary-card sanctuary-continuity" aria-labelledby="sanctuary-continuity-title">
            <div className="sanctuary-continuity-head">
              <span className="sanctuary-icon"><Cpu size={21} /></span>
              <div><span className="card-number">02 / CONTINUITY BY DESIGN</span><h3 id="sanctuary-continuity-title">What could fail?</h3></div>
            </div>
            <p className="preparedness-copy">Record which dependencies need a human-owned fallback. Selection does not confirm adequacy or redundancy.</p>
            <div className="continuity-options">
              {infrastructureDependencies.map(({ id, label, Icon }) => (
                <label className="continuity-option" key={id}>
                  <input type="checkbox" checked={dependencies.includes(id)} onChange={() => toggleDependency(id)} />
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <div className="sanctuary-principle"><strong>Offline-first fallbacks</strong><span>Keep printed plans, official contact routes, human facilitation, and non-AI workflows available when model or network service is unavailable.</span></div>
            <div className="sanctuary-principle"><strong>Human authority</strong><span>AI may help organize approved information. It does not issue warnings, select evacuation destinations, or determine that a place is safe.</span></div>
            <button className="button primary preparedness-download" type="button" onClick={downloadConcept}><ArrowDownToLine size={15} /> Download sanctuary concept</button>
            {downloadNotice && <p className="preparedness-notice" role="status">{downloadNotice}</p>}
          </aside>
        </div>
      </div>
    </section>
  )
}
