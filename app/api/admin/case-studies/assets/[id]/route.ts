import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  const { id } = await params
  if (!/^[1-9]\d{0,17}$/.test(id)) return NextResponse.json({ error: 'Invalid asset id.' }, { status: 400 })
  const rows = await queryRows<{ image_data: string }>(
    `SELECT encode(a.image_data, 'hex') AS image_data FROM case_study_assets a
     JOIN case_studies c ON c.id=a.case_study_id WHERE a.id=$1`,
    [id],
  )
  if (!rows[0]) return NextResponse.json({ error: 'Asset not found.' }, { status: 404 })
  return new NextResponse(Buffer.from(rows[0].image_data, 'hex'), {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
  })
}
