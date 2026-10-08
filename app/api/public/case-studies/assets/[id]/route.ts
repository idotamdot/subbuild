import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/database'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[1-9]\d{0,17}$/.test(id)) return NextResponse.json({ error: 'Image not found.' }, { status: 404 })
  try {
    const rows = await queryRows<{ image_data: string }>(
      `SELECT encode(a.image_data, 'hex') AS image_data FROM case_study_assets a
       JOIN case_studies c ON c.id=a.case_study_id
       WHERE a.id=$1 AND c.is_published AND c.disclosure_cleared AND c.metadata_sanitized`,
      [id],
    )
    if (!rows[0]) return NextResponse.json({ error: 'Image not found.' }, { status: 404 })
    return new NextResponse(Buffer.from(rows[0].image_data, 'hex'), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Published case-study image unavailable:', error)
    return NextResponse.json({ error: 'Image unavailable.' }, { status: 503 })
  }
}
