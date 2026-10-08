import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

const updateSchema = z.strictObject({
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(4000),
  disclosureCleared: z.boolean(),
  isPublished: z.boolean(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  const { id } = await params
  if (!/^[1-9]\d{0,17}$/.test(id)) return NextResponse.json({ error: 'Invalid case study id.' }, { status: 400 })
  let input: z.infer<typeof updateSchema>
  try {
    input = updateSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid case study update.' }, { status: 400 })
  }
  if (input.isPublished && !input.disclosureCleared) {
    return NextResponse.json({ error: 'Disclosure clearance is required before publishing.' }, { status: 400 })
  }
  const rows = await queryRows<{ id: string }>(
    `UPDATE case_studies SET title=$1, summary=$2, disclosure_cleared=$3, is_published=$4, updated_at=now()
     WHERE id=$5 AND (NOT $4 OR metadata_sanitized) RETURNING id`,
    [input.title, input.summary, input.disclosureCleared, input.isPublished, id],
  )
  if (!rows[0]) {
    const existing = await queryRows<{ metadata_sanitized: boolean }>('SELECT metadata_sanitized FROM case_studies WHERE id=$1', [id])
    if (existing[0] && input.isPublished && !existing[0].metadata_sanitized) {
      return NextResponse.json({ error: 'Run every image through the metadata-stripping upload pipeline before publishing.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Case study not found.' }, { status: 404 })
  }
  return NextResponse.json({ updated: true }, { headers: { 'Cache-Control': 'no-store' } })
}
