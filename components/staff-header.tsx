'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function StaffHeader({ email, role, developmentBypass }: { email: string; role: string; developmentBypass: boolean }) {
  return (
    <header className="staff-header">
      <div>
        <div className="eyebrow">ENTER SANCTUM / STAFF WORKSPACE</div>
        <strong>{role === 'admin' ? 'Administrator' : 'Consultant'} · {email}{developmentBypass && ' · LOCAL DEV ONLY'}</strong>
      </div>
      <div className="staff-actions">
        {role === 'admin' && <Link className="button small" href="/staff/content">Content governance</Link>}
        <Link className="button small" href="/">Public site</Link>
        {!developmentBypass && <button className="button small" onClick={() => signOut({ redirectTo: '/staff/sign-in' })}>Sign out</button>}
      </div>
    </header>
  )
}
