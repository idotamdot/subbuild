'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignInPanel({ configured, providerName }: { configured: boolean; providerName: string }) {
  return (
    <main className="sign-in">
      <section className="sign-card">
        <div className="eyebrow">ENTER SANCTUM / STAFF ACCESS</div>
        <h1 style={{ fontFamily: 'var(--head)', fontSize: 29 }}>Staff sign in</h1>
        <p className="step-hint">Private inquiry and content workspaces are limited to approved staff accounts.</p>
        {configured ? (
          <button className="button primary" style={{ width: '100%' }} onClick={() => signIn('workforce-oidc', { redirectTo: '/staff' })}>
            Continue with {providerName}
          </button>
        ) : (
          <div className="banner" role="status">Staff sign-in is not configured yet. Set the Auth.js secret, OIDC issuer/client credentials, and approved staff email allowlists in the Vercel project settings.</div>
        )}
        <Link className="text-link" href="/" style={{ display: 'inline-block', marginTop: 20 }}>Return to the public site</Link>
      </section>
    </main>
  )
}
