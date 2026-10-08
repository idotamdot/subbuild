'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type Inquiry = {
  reference: string
  status: string
  assigned_staff_email: string | null
  created_at: string
  response_due_at: string
  overdue: boolean
}
type InquiryDetails = Inquiry & {
  payload: {
    brief: Record<string, unknown>
    contact: {
      alias: string
      channel: string
      email?: string
      phone?: string
      area: string
      window: string
      consent: boolean
      marketing: boolean
    }
  }
}
type SiteAssessmentDetails = {
  parcelId: string
  propertyAddress: string
  gateOrAccessNotes: string
  assessmentNotes: string
}
type SiteAssessment = {
  ndaReference: string
  ndaConfirmedBy: string
  ndaConfirmedAt: string
  siteDetails: SiteAssessmentDetails
}
const emptySiteDetails: SiteAssessmentDetails = {
  parcelId: '',
  propertyAddress: '',
  gateOrAccessNotes: '',
  assessmentNotes: '',
}

const statuses = [
  ['new', 'New'],
  ['assigned', 'Assigned'],
  ['clarification_needed', 'Clarification needed'],
  ['contact_scheduled', 'Contact scheduled'],
  ['closed', 'Closed'],
] as const

export default function StaffQueue() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [filter, setFilter] = useState('')
  const [role, setRole] = useState<'consultant' | 'admin'>('consultant')
  const [selected, setSelected] = useState<InquiryDetails | null>(null)
  const [assignEmail, setAssignEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<SiteAssessment | null>(null)
  const [siteDetails, setSiteDetails] = useState<SiteAssessmentDetails>(emptySiteDetails)
  const [ndaReference, setNdaReference] = useState('')
  const [ndaConfirmed, setNdaConfirmed] = useState(false)
  const [assessmentError, setAssessmentError] = useState('')
  const [assessmentNotice, setAssessmentNotice] = useState('')
  const [assessmentBusy, setAssessmentBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/inquiries/queue${filter ? `?status=${encodeURIComponent(filter)}` : ''}`, { cache: 'no-store' })
      const data = await response.json() as { items?: Inquiry[]; role?: 'consultant' | 'admin'; error?: string }
      if (!response.ok) throw new Error(data.error ?? 'Queue unavailable.')
      setItems(data.items ?? [])
      setRole(data.role ?? 'consultant')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Queue unavailable.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { void load() }, [load])

  const openInquiry = async (reference: string) => {
    setSelected(null)
    setError('')
    setAssessment(null)
    setSiteDetails(emptySiteDetails)
    setNdaReference('')
    setNdaConfirmed(false)
    setAssessmentError('')
    setAssessmentNotice('')
    try {
      const response = await fetch(`/api/inquiries/${encodeURIComponent(reference)}`, { cache: 'no-store' })
      const data = await response.json() as InquiryDetails & { error?: string }
      if (!response.ok) throw new Error(data.error ?? 'Inquiry unavailable.')
      setSelected(data)
      setAssignEmail(data.assigned_staff_email ?? '')
      const assessmentResponse = await fetch(`/api/inquiries/${encodeURIComponent(reference)}/engagement`, { cache: 'no-store' })
      if (assessmentResponse.status !== 404) {
        const assessmentData = await assessmentResponse.json() as SiteAssessment & { error?: string }
        if (!assessmentResponse.ok) throw new Error(assessmentData.error ?? 'Restricted assessment could not be loaded.')
        setAssessment(assessmentData)
        setSiteDetails(assessmentData.siteDetails)
        setNdaReference(assessmentData.ndaReference)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Inquiry unavailable.')
    }
  }

  const saveSiteAssessment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    setAssessmentBusy(true)
    setAssessmentError('')
    setAssessmentNotice('')
    try {
      const response = await fetch(`/api/inquiries/${encodeURIComponent(selected.reference)}/engagement`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ndaConfirmed, ndaReference, siteDetails }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Restricted assessment could not be saved.')
      const assessmentResponse = await fetch(`/api/inquiries/${encodeURIComponent(selected.reference)}/engagement`, { cache: 'no-store' })
      const saved = await assessmentResponse.json() as SiteAssessment & { error?: string }
      if (!assessmentResponse.ok) throw new Error(saved.error ?? 'Saved assessment could not be reloaded.')
      setAssessment(saved)
      setSiteDetails(saved.siteDetails)
      setNdaReference(saved.ndaReference)
      setNdaConfirmed(false)
      setAssessmentNotice('NDA-gated site assessment saved in its separate encrypted record.')
    } catch (saveError) {
      setAssessmentError(saveError instanceof Error ? saveError.message : 'Restricted assessment could not be saved.')
    } finally {
      setAssessmentBusy(false)
    }
  }

  const updateInquiry = async (body: { status?: string; assignedStaffEmail?: string }) => {
    if (!selected) return
    setError('')
    try {
      const response = await fetch(`/api/inquiries/${encodeURIComponent(selected.reference)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Inquiry update failed.')
      await load()
      await openInquiry(selected.reference)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Inquiry update failed.')
    }
  }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">CONSULTANT WORKSPACE</span><h1 style={{ font: '500 32px var(--head)', margin: '8px 0' }}>Inquiry triage</h1></div><button className="button small" onClick={() => void load()}>Refresh queue</button></div>
      <p className="step-hint">{role === 'admin' ? 'Administrator view: all requests and overdue response deadlines.' : 'You can view only inquiries assigned to your staff email.'}</p>
      {error && <div role="alert" className="banner error">{error}</div>}
      <div className="filter-row" aria-label="Inquiry status filter" style={{ margin: '18px 0' }}>
        <button className={`chip ${filter === '' ? 'selected' : ''}`} onClick={() => setFilter('')}>All</button>
        {statuses.map(([value, label]) => <button key={value} className={`chip ${filter === value ? 'selected' : ''}`} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
      {loading ? <p role="status">Loading queue…</p> : items.length === 0 ? <div className="banner">No matching inquiries. Only assigned items appear in a consultant view.</div> : (
        <div className="staff-table-wrap"><table className="staff-table"><thead><tr><th>Reference</th><th>Status</th><th>Assigned to</th><th>Response due</th><th>Action</th></tr></thead><tbody>
          {items.map((item) => <tr key={item.reference}><td>{item.reference}</td><td><span className={`status-pill ${item.overdue ? 'overdue' : ''}`}>{item.overdue ? 'OVERDUE / ' : ''}{item.status.replaceAll('_', ' ')}</span></td><td>{item.assigned_staff_email ?? 'Unassigned'}</td><td>{new Date(item.response_due_at).toLocaleString()}</td><td><button className="button small" onClick={() => void openInquiry(item.reference)}>Open inquiry</button></td></tr>)}
        </tbody></table></div>
      )}
      {selected && <section className="inquiry-panel" aria-labelledby="inquiry-heading">
        <div className="section-heading"><div><span className="eyebrow">ENCRYPTED INQUIRY / DECRYPTED FOR AUTHORIZED STAFF</span><h2 id="inquiry-heading">{selected.reference}</h2></div><button className="button small" onClick={() => setSelected(null)}>Close</button></div>
        <div className="staff-grid">
          <article className="metric"><span>Preferred name</span><strong>{selected.payload.contact.alias}</strong></article>
          <article className="metric"><span>Contact preference</span><strong>{selected.payload.contact.channel} · {selected.payload.contact.window}</strong></article>
          <article className="metric"><span>Response SLA</span><strong>{selected.overdue ? 'OVERDUE' : new Date(selected.response_due_at).toLocaleDateString()}</strong></article>
        </div>
        <p>Contact details: {selected.payload.contact.channel === 'Email' ? selected.payload.contact.email : selected.payload.contact.phone}</p>
        <p>Broad area: {selected.payload.contact.area || 'Not provided'}</p>
        <pre className="brief-data">{JSON.stringify(selected.payload.brief, null, 2)}</pre>
        <div className="staff-actions">
          <label className="field"><span>Update status</span><select value={selected.status} onChange={(event) => void updateInquiry({ status: event.target.value })}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {role === 'admin' && <label className="field"><span>Assign to approved staff email</span><span className="assign-controls"><input type="email" value={assignEmail} onChange={(event) => setAssignEmail(event.target.value)} placeholder="staff@yourdomain.com" /><button className="button small" onClick={() => void updateInquiry({ assignedStaffEmail: assignEmail })}>Assign</button></span></label>}
        </div>
        <section className="governance-section" aria-labelledby="site-assessment-heading">
          <h3 id="site-assessment-heading">Restricted site assessment</h3>
          <p className="step-hint">Exact parcel, address, and access details are stored separately from the general inquiry and encrypted with a dedicated key. Do not enter them until an NDA has been executed and recorded through the business's approved process.</p>
          {assessment && <div className="banner"><strong>NDA attestation recorded:</strong> {assessment.ndaReference} · {assessment.ndaConfirmedBy} · {new Date(assessment.ndaConfirmedAt).toLocaleString()}</div>}
          {assessmentNotice && <div className="banner success" role="status">{assessmentNotice}</div>}
          {assessmentError && <div className="banner error" role="alert">{assessmentError}</div>}
          <form className="claim-form" onSubmit={saveSiteAssessment}>
            <label className="field">Executed NDA / agreement reference<input required maxLength={200} value={ndaReference} onChange={(event) => setNdaReference(event.target.value)} /></label>
            <label className="consent"><input type="checkbox" checked={ndaConfirmed} onChange={(event) => setNdaConfirmed(event.target.checked)} /><span>I confirm that the referenced agreement has already been executed and is retained through the approved business process. This checkbox is an internal staff attestation, not an e-signature.</span></label>
            <label className="field">Parcel identifier<input maxLength={100} value={siteDetails.parcelId} onChange={(event) => setSiteDetails({ ...siteDetails, parcelId: event.target.value })} /></label>
            <label className="field">Property address<input maxLength={300} autoComplete="off" value={siteDetails.propertyAddress} onChange={(event) => setSiteDetails({ ...siteDetails, propertyAddress: event.target.value })} /></label>
            <label className="field">Gate / access notes<textarea maxLength={1000} autoComplete="off" value={siteDetails.gateOrAccessNotes} onChange={(event) => setSiteDetails({ ...siteDetails, gateOrAccessNotes: event.target.value })} /></label>
            <label className="field">Assessment notes<textarea maxLength={8000} autoComplete="off" value={siteDetails.assessmentNotes} onChange={(event) => setSiteDetails({ ...siteDetails, assessmentNotes: event.target.value })} /></label>
            <button className="button primary small" type="submit" disabled={assessmentBusy || !ndaConfirmed || !ndaReference.trim()}>{assessmentBusy ? 'Saving securely…' : assessment ? 'Update restricted assessment' : 'Save restricted assessment'}</button>
          </form>
        </section>
      </section>}
      {role === 'admin' && <p><Link className="text-link" href="/staff/content">Open content governance →</Link></p>}
    </section>
  )
}
