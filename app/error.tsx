'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Application rendering error:', error)
  }, [error])

  return (
    <main className="inquiry-page">
      <section className="inquiry-card" role="alert">
        <div className="eyebrow">ENTER SANCTUM SUBTERRANEAN PRIVATE CONSTRUCTION</div>
        <h1>We couldn’t load this page.</h1>
        <p className="step-hint">Your planning information is saved only in this browser. Try loading the page again.</p>
        <button className="button primary" onClick={reset}>Try again</button>
      </section>
    </main>
  )
}
