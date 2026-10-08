'use client'

import { useState } from 'react'
import { z } from 'zod'
import { comparePriorities } from '@/lib/planning'
import { decryptCoReview, encryptCoReview } from '@/lib/local-vault'

const priorityOptions = ['Longer duration', 'Air filtration', 'Medical access', 'Daily accessibility', 'Budget', 'Simple installation'] as const
const packageSchema = z.object({
  type: z.literal('esspt-co-review'),
  version: z.literal(1),
  brief: z.record(z.string(), z.unknown()),
  ownerPriorities: z.array(z.enum(priorityOptions)).max(priorityOptions.length),
})
type ReviewPackage = z.infer<typeof packageSchema>

function downloadFile(content: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'private-co-review-response.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function CoReviewWorkspace() {
  const [fileText, setFileText] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [reviewPackage, setReviewPackage] = useState<ReviewPackage | null>(null)
  const [coPriorities, setCoPriorities] = useState<string[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const openPackage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const parsed = packageSchema.parse(await decryptCoReview<unknown>(fileText, passphrase))
      setReviewPackage(parsed)
    } catch {
      setError('The file could not be opened. Check that it is a valid co-review file and that the passphrase is correct.')
    }
  }

  const exportResponse = async () => {
    if (!reviewPackage) return
    setError('')
    try {
      const alignment = comparePriorities(reviewPackage.ownerPriorities, coPriorities)
      const response = await encryptCoReview({
        type: 'esspt-co-review',
        version: 1,
        brief: reviewPackage.brief,
        ownerPriorities: reviewPackage.ownerPriorities,
        coReviewerPriorities: coPriorities,
        alignment,
        note: 'Differences are topics to resolve together in consultation, not an implied disagreement or consensus.',
      }, passphrase)
      downloadFile(response)
      setNotice('Encrypted co-review response downloaded. Return it to the owner using a separate private channel.')
      setReviewPackage(null)
      setCoPriorities([])
      setFileText('')
      setPassphrase('')
    } catch {
      setError('The encrypted response could not be generated.')
    }
  }

  const brief = reviewPackage?.brief
  const alignment = reviewPackage ? comparePriorities(reviewPackage.ownerPriorities, coPriorities) : null

  return (
    <main className="co-review-shell">
      <div className="eyebrow">ENTER SANCTUM / PRIVATE CO-REVIEW</div>
      <h1>Make room for both perspectives.</h1>
      <p className="step-hint">Open the encrypted file from the project owner. This workspace runs in your browser; the file and your choices are not sent to the carpenter or stored on a server.</p>
      {!reviewPackage ? (
        <form className="co-review-card" onSubmit={openPackage}>
          <label className="field">Encrypted co-review file<input type="file" accept="application/json,.json" required onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            if (file.size > 64 * 1024) {
              setError('The review file exceeds the 64 KB limit.')
              return
            }
            setFileText(await file.text())
            setError('')
          }} /></label>
          <label className="field">Passphrase shared separately<input type="password" minLength={12} maxLength={200} autoComplete="off" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} required /></label>
          {error && <div className="banner error" role="alert">{error}</div>}
          <button className="button primary" type="submit" disabled={!fileText}>Unlock review file</button>
        </form>
      ) : (
        <section className="co-review-card">
          <span className="eyebrow">CONTACT-FREE PROJECT BRIEF</span>
          <dl className="co-brief">{Object.entries(brief ?? {}).filter(([key]) => !['title', 'notice', 'feasibility', 'physicalEnvelope'].includes(key)).map(([key, value]) => <div key={key}><dt>{key.replaceAll(/([A-Z])/g, ' $1')}</dt><dd>{Array.isArray(value) ? value.join(' · ') : typeof value === 'string' ? value : JSON.stringify(value)}</dd></div>)}</dl>
          <h2>Your independent priorities</h2>
          <p className="step-hint">Choose what matters to you. You don’t need to match the owner’s selections.</p>
          <div className="priority-options">{priorityOptions.map((priority) => <label className="redaction" key={priority}><input type="checkbox" checked={coPriorities.includes(priority)} onChange={(event) => setCoPriorities((current) => event.target.checked ? [...current, priority] : current.filter((item) => item !== priority))} />{priority}</label>)}</div>
          {alignment && <div className="alignment-grid">
            <article><h3>Shared priorities</h3><p>{alignment.shared.length ? alignment.shared.join(' · ') : 'None selected by both yet'}</p></article>
            <article><h3>Owner priorities</h3><p>{alignment.ownerOnly.length ? alignment.ownerOnly.join(' · ') : 'No owner-only priorities'}</p></article>
            <article><h3>Your priorities</h3><p>{alignment.coReviewerOnly.length ? alignment.coReviewerOnly.join(' · ') : 'No co-reviewer-only priorities'}</p></article>
            {(alignment.ownerOnly.length > 0 || alignment.coReviewerOnly.length > 0) && <div className="disclaimer alignment-tension">Topics to resolve together in consultation. Different priorities are not a conflict, approval, or consensus.</div>}
          </div>}
          {error && <div className="banner error" role="alert">{error}</div>}
          {notice && <div className="banner success" role="status">{notice}</div>}
          <div className="hero-actions"><button className="button primary" onClick={() => void exportResponse()}>Encrypt and download alignment</button><button className="button" onClick={() => { setReviewPackage(null); setCoPriorities([]); setFileText(''); setPassphrase('') }}>Close review</button></div>
        </section>
      )}
      <p className="step-hint">This tool creates discussion topics only. It does not provide engineering guidance or make a decision for either participant.</p>
    </main>
  )
}
