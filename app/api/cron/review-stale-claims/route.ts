import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }
  try {
    const rows = await queryRows<{ id: string }>(
      `UPDATE technical_claims SET verification_status='under_review', is_published=false, updated_at=now()
       WHERE expires_at <= now() AND verification_status <> 'under_review'
       RETURNING id`,
    )
    return NextResponse.json({ reviewed: rows.length })
  } catch (error) {
    console.error('Scheduled claim expiry failed:', error)
    return NextResponse.json({ error: 'Claim review could not be completed.' }, { status: 503 })
  }
}
