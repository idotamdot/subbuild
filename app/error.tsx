'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Application rendering error:', error)
  }, [error])

  return (
    <main className="inquiry-page">
      <section className="inquiry-card" role="alert">
        <div className="eyebrow">COMMONGROUND ATLAS / COMMUNITY READINESS PROTOTYPE</div>
        <h1>We couldn’t load this page.</h1>
        <p className="step-hint">Unsaved planning information may be lost. Try loading the page again.</p>
        <button className="button primary" onClick={reset}>Try again</button>
      </section>
    </main>
  )
}
