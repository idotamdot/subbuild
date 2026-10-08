import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const items = await queryRows(
      `SELECT c.id, c.title, c.summary,
        COALESCE(json_agg(json_build_object('id', a.id) ORDER BY a.id) FILTER (WHERE a.id IS NOT NULL), '[]') AS assets
       FROM case_studies c LEFT JOIN case_study_assets a ON a.case_study_id=c.id
       WHERE c.is_published AND c.disclosure_cleared AND c.metadata_sanitized
       GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 50`,
    )
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } })
  } catch (error) {
    console.error('Published case studies unavailable:', error)
    return NextResponse.json({ error: 'Published case studies are temporarily unavailable.' }, { status: 503 })
  }
}
