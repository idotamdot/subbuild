'use client'

import { useEffect, useState } from 'react'

type Claim = {
  title: string
  claim_text: string
  standard_reference: string
  verification_status: string
  reviewer: string | null
  last_reviewed_at: string | null
  expires_at: string
}

type CaseStudy = {
  id: number | string
  title: string
  summary: string
  assets: { id: number | string }[]
}

export default function PublishedContent() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/public/claims', { cache: 'no-store' }),
      fetch('/api/public/case-studies', { cache: 'no-store' }),
    ]).then(async ([claimResponse, caseResponse]) => {
      const [claimData, caseData] = await Promise.all([
        claimResponse.json() as Promise<{ items?: Claim[]; error?: string }>,
        caseResponse.json() as Promise<{ items?: CaseStudy[]; error?: string }>,
      ])
      if (!claimResponse.ok) throw new Error(claimData.error ?? 'Verified claims are temporarily unavailable.')
      if (!caseResponse.ok) throw new Error(caseData.error ?? 'Case studies are temporarily unavailable.')
      if (active) {
        setClaims(claimData.items ?? [])
        setCaseStudies(caseData.items ?? [])
      }
    }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Published content is temporarily unavailable.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  return (
    <section className="section shell" id="published-evidence" aria-labelledby="published-evidence-title">
      <div className="section-heading">
        <div><span className="eyebrow">EVIDENCE / GOVERNED CONTENT</span><h2 id="published-evidence-title">Published guidance & project notes.</h2></div>
        <p>Only currently reviewed claims and disclosure-cleared case studies are shown here. Site conditions and project-specific design still require qualified review.</p>
      </div>
      {error && <div className="banner" role="status">{error}</div>}
      {loading ? <p role="status">Loading reviewed content…</p> : (
        <>
          {claims.length > 0 && <div className="published-claims">
            {claims.map((claim) => <article className="published-claim" key={`${claim.title}-${claim.standard_reference}`}>
              <div className="published-claim-heading"><h3>{claim.title}</h3><span className="status-pill">{claim.verification_status.replaceAll('_', ' ')}</span></div>
              <p>{claim.claim_text}</p>
              {claim.standard_reference && <p className="published-meta"><strong>Evidence reference:</strong> {claim.standard_reference}</p>}
              <p className="published-meta"><strong>Reviewer:</strong> {claim.reviewer ?? 'Not listed'} · <strong>Last reviewed:</strong> {claim.last_reviewed_at ? new Date(claim.last_reviewed_at).toLocaleDateString() : 'Not listed'} · <strong>Review by:</strong> {new Date(claim.expires_at).toLocaleDateString()}</p>
            </article>)}
          </div>}
          {caseStudies.length > 0 && <div className="published-cases">
            {caseStudies.map((item) => <article className="published-case" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              {item.assets.length > 0 && <div className="published-case-images" aria-label={`Sanitized project images for ${item.title}`}>
                {item.assets.map((asset) => <img key={asset.id} src={`/api/public/case-studies/assets/${asset.id}`} alt={`Disclosure-cleared project example: ${item.title}`} loading="lazy" />)}
              </div>}
            </article>)}
          </div>}
          {!error && claims.length === 0 && caseStudies.length === 0 && <p className="step-hint">No public evidence items are currently available. Technical claims are not displayed until review requirements are met.</p>}
        </>
      )}
      <p className="published-disclaimer">Claims are published only while their review window is current. Expired items are excluded from public responses and moved to review; case studies require disclosure clearance and metadata-sanitized images.</p>
    </section>
  )
}
