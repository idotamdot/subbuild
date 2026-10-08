import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const items = await queryRows(
      `SELECT title, claim_text, standard_reference, verification_status, reviewer, last_reviewed_at, expires_at
       FROM technical_claims
       WHERE is_published AND verification_status <> 'under_review' AND expires_at > now()
       ORDER BY title ASC`,
    )
    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Published claims unavailable:', error)
    return NextResponse.json({ error: 'Verified content is temporarily unavailable.' }, { status: 503 })
  }
}
