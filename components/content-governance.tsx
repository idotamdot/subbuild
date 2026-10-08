'use client'

import { useCallback, useEffect, useState } from 'react'

type Claim = {
  id: string
  title: string
  claim_text: string
  standard_reference: string
  verification_status: 'verified' | 'preliminary' | 'custom' | 'site_dependent' | 'under_review'
  reviewer: string | null
  last_reviewed_at: string | null
  expires_at: string
  expires_soon: boolean
  can_publish: boolean
  is_published: boolean
}
type CaseStudy = {
  id: number
  title: string
  summary: string
  disclosure_cleared: boolean
  metadata_sanitized: boolean
  is_published: boolean
  assets: { id: number }[]
}
type ClaimForm = {
  title: string
  claimText: string
  standardReference: string
  verificationStatus: Claim['verification_status']
  reviewer: string
  lastReviewedAt: string
  expiresAt: string
  isPublished: boolean
}

const emptyClaim: ClaimForm = {
  title: '',
  claimText: '',
  standardReference: '',
  verificationStatus: 'preliminary',
  reviewer: '',
  lastReviewedAt: '',
  expiresAt: '',
  isPublished: false,
}

export default function ContentGovernance() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [cases, setCases] = useState<CaseStudy[]>([])
  const [claimForm, setClaimForm] = useState<ClaimForm>(emptyClaim)
  const [caseTitle, setCaseTitle] = useState('')
  const [caseSummary, setCaseSummary] = useState('')
  const [caseDisclosure, setCaseDisclosure] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setError('')
    try {
      const [claimResponse, caseResponse] = await Promise.all([
        fetch('/api/admin/claims', { cache: 'no-store' }),
        fetch('/api/admin/case-studies', { cache: 'no-store' }),
      ])
      const claimData = await claimResponse.json() as { items?: Claim[]; error?: string }
      const caseData = await caseResponse.json() as { items?: CaseStudy[]; error?: string }
      if (!claimResponse.ok) throw new Error(claimData.error ?? 'Claims could not be loaded.')
      if (!caseResponse.ok) throw new Error(caseData.error ?? 'Case studies could not be loaded.')
      setClaims(claimData.items ?? [])
      setCases(caseData.items ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Content could not be loaded.')
    }
  }, [])

  useEffect(() => { void reload() }, [reload])

  const submitClaim = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    setError('')
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...claimForm,
          lastReviewedAt: claimForm.lastReviewedAt ? new Date(`${claimForm.lastReviewedAt}T12:00:00.000Z`).toISOString() : undefined,
          expiresAt: new Date(`${claimForm.expiresAt}T23:59:59.000Z`).toISOString(),
        }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Claim was not saved.')
      setClaimForm(emptyClaim)
      setNotice('Claim saved. Expired claims are hidden from public content and moved to Under Review.')
      await reload()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Claim was not saved.')
    } finally {
      setBusy(false)
    }
  }

  const publishClaim = async (claim: Claim, publish: boolean) => {
    setError('')
    const lastReviewedAt = claim.last_reviewed_at
      ? new Date(claim.last_reviewed_at).toISOString()
      : undefined
    try {
      const response = await fetch(`/api/admin/claims/${claim.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: claim.title,
          claimText: claim.claim_text,
          standardReference: claim.standard_reference,
          verificationStatus: claim.verification_status,
          reviewer: claim.reviewer ?? undefined,
          lastReviewedAt,
          expiresAt: new Date(claim.expires_at).toISOString(),
          isPublished: publish,
        }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Claim update failed.')
      setNotice(publish ? 'Claim published.' : 'Claim unpublished.')
      await reload()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Claim update failed.')
    }
  }

  const createCase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/case-studies', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: caseTitle, summary: caseSummary, disclosureCleared: caseDisclosure }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Case study was not saved.')
      setCaseTitle('')
      setCaseSummary('')
      setCaseDisclosure(false)
      setNotice('Case study draft created.')
      await reload()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Case study was not saved.')
    } finally {
      setBusy(false)
    }
  }

  const uploadAsset = async (caseId: number, file: File) => {
    setError('')
    const form = new FormData()
    form.set('image', file)
    try {
      const response = await fetch(`/api/admin/case-studies/${caseId}/assets`, { method: 'POST', body: form })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Image could not be sanitized.')
      setNotice('Image re-encoded to WebP; EXIF and embedded metadata were stripped.')
      await reload()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image could not be sanitized.')
    }
  }

  const updateCase = async (item: CaseStudy, isPublished: boolean) => {
    setError('')
    try {
      const response = await fetch(`/api/admin/case-studies/${item.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          summary: item.summary,
          disclosureCleared: item.disclosure_cleared,
          isPublished,
        }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'Case study update failed.')
      setNotice(isPublished ? 'Case study published.' : 'Case study unpublished.')
      await reload()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Case study update failed.')
    }
  }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">ADMINISTRATOR WORKSPACE</span><h1 style={{ font: '500 32px var(--head)', margin: '8px 0' }}>Content governance</h1></div><button className="button small" onClick={() => void reload()}>Refresh</button></div>
      <p className="step-hint">Public claims fail closed at their expiry date. Public case studies require disclosure clearance and metadata-sanitized assets.</p>
      {notice && <div className="banner success" role="status">{notice}</div>}
      {error && <div className="banner error" role="alert">{error}</div>}

      <section className="governance-section">
        <h2>Technical claims & verification dates</h2>
        <form className="claim-form" onSubmit={submitClaim}>
          <label className="field">Claim title<input required maxLength={160} value={claimForm.title} onChange={(event) => setClaimForm({ ...claimForm, title: event.target.value })} /></label>
          <label className="field">Plain-language claim<textarea required maxLength={4000} value={claimForm.claimText} onChange={(event) => setClaimForm({ ...claimForm, claimText: event.target.value })} /></label>
          <label className="field">Standard / evidence reference<input maxLength={500} value={claimForm.standardReference} onChange={(event) => setClaimForm({ ...claimForm, standardReference: event.target.value })} placeholder="Standard identifier and edition / supplier test reference" /></label>
          <div className="content-form-grid">
            <label className="field">Verification status<select value={claimForm.verificationStatus} onChange={(event) => setClaimForm({ ...claimForm, verificationStatus: event.target.value as ClaimForm['verificationStatus'] })}><option value="preliminary">Preliminary</option><option value="verified">Verified</option><option value="custom">Custom</option><option value="site_dependent">Site-dependent</option><option value="under_review">Under review</option></select></label>
            <label className="field">Reviewing professional<input maxLength={254} value={claimForm.reviewer} onChange={(event) => setClaimForm({ ...claimForm, reviewer: event.target.value })} /></label>
            <label className="field">Last reviewed<input type="date" value={claimForm.lastReviewedAt} onChange={(event) => setClaimForm({ ...claimForm, lastReviewedAt: event.target.value })} /></label>
            <label className="field">Next review / expiry<input type="date" required value={claimForm.expiresAt} onChange={(event) => setClaimForm({ ...claimForm, expiresAt: event.target.value })} /></label>
          </div>
          <label className="consent"><input type="checkbox" checked={claimForm.isPublished} onChange={(event) => setClaimForm({ ...claimForm, isPublished: event.target.checked })} /><span>Publish after review. A reviewer and review date are required; expired claims cannot be published.</span></label>
          <button className="button primary small" disabled={busy}>Save claim</button>
        </form>
        <div className="staff-table-wrap"><table className="staff-table"><thead><tr><th>Claim</th><th>Status</th><th>Reviewer / last reviewed</th><th>Review by</th><th>Visibility</th><th>Action</th></tr></thead><tbody>
          {claims.map((claim) => <tr key={claim.id}><td><strong>{claim.title}</strong><br /><span className="muted-cell">{claim.standard_reference}</span><br />{claim.claim_text}</td><td>{claim.verification_status.replaceAll('_', ' ')}</td><td>{claim.reviewer ?? 'Not assigned'}<br />{claim.last_reviewed_at ? new Date(claim.last_reviewed_at).toLocaleDateString() : 'No review date'}</td><td>{new Date(claim.expires_at).toLocaleDateString()}{claim.expires_soon && <strong className="expiry-warning">Review due within 30 days</strong>}</td><td>{claim.is_published ? 'Public' : 'Hidden'}</td><td><button className="button small" disabled={!claim.is_published && !claim.can_publish} onClick={() => void publishClaim(claim, !claim.is_published)}>{claim.is_published ? 'Unpublish' : 'Publish'}</button></td></tr>)}
        </tbody></table></div>
      </section>

      <section className="governance-section">
        <h2>Disclosure-cleared case studies</h2>
        <form className="claim-form" onSubmit={createCase}>
          <label className="field">Case study title<input required maxLength={160} value={caseTitle} onChange={(event) => setCaseTitle(event.target.value)} /></label>
          <label className="field">Redacted summary<textarea required maxLength={4000} value={caseSummary} onChange={(event) => setCaseSummary(event.target.value)} /></label>
          <label className="consent"><input type="checkbox" checked={caseDisclosure} onChange={(event) => setCaseDisclosure(event.target.checked)} /><span>I confirm the written summary is disclosure-cleared and contains no identifying site information.</span></label>
          <button className="button primary small" disabled={busy}>Create case study draft</button>
        </form>
        <div className="case-list">{cases.map((item) => <article className="case-governance-card" key={item.id}>
          <h3>{item.title}</h3><p>{item.summary}</p>
          <div className="case-checks"><span>{item.disclosure_cleared ? 'Disclosure cleared' : 'Disclosure not cleared'}</span><span>{item.metadata_sanitized ? 'Images sanitized' : 'Image review pending'}</span><span>{item.is_published ? 'Published' : 'Draft'}</span></div>
          <label className="field">Add an image (JPEG, PNG, WebP; max 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadAsset(item.id, file); event.target.value = '' }} /></label>
          <div className="case-previews">{item.assets.map((asset) => <img key={asset.id} src={`/api/admin/case-studies/assets/${asset.id}`} alt={`Sanitized image for ${item.title}`} width="140" height="90" />)}</div>
          <button className="button small" disabled={item.is_published ? false : !item.disclosure_cleared || !item.metadata_sanitized} onClick={() => void updateCase(item, !item.is_published)}>{item.is_published ? 'Unpublish' : 'Publish case study'}</button>
        </article>)}</div>
      </section>
    </section>
  )
}
