import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

const createSchema = z.strictObject({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(4000),
  disclosureCleared: z.boolean(),
})

export async function GET() {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  const items = await queryRows(
    `SELECT c.id, c.title, c.summary, c.disclosure_cleared, c.metadata_sanitized, c.is_published,
       c.created_at, c.updated_at,
       COALESCE(json_agg(json_build_object('id', a.id) ORDER BY a.id) FILTER (WHERE a.id IS NOT NULL), '[]') AS assets
     FROM case_studies c LEFT JOIN case_study_assets a ON a.case_study_id = c.id
     GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 100`,
  )
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  let input: z.infer<typeof createSchema>
  try {
    input = createSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid case study.' }, { status: 400 })
  }
  const rows = await queryRows<{ id: number }>(
    `INSERT INTO case_studies (title, summary, disclosure_cleared, metadata_sanitized)
     VALUES ($1, $2, $3, true) RETURNING id`,
    [input.title, input.summary, input.disclosureCleared],
  )
  return NextResponse.json({ id: rows[0]?.id }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
