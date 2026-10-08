import sharp from 'sharp'
import { NextResponse } from 'next/server'
import { getDatabase, queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'
const maxUploadBytes = 8 * 1024 * 1024

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  const { id } = await params
  if (!/^[1-9]\d{0,17}$/.test(id)) return NextResponse.json({ error: 'Invalid case study id.' }, { status: 400 })
  if (Number(request.headers.get('content-length') ?? 0) > maxUploadBytes + 65_536) {
    return NextResponse.json({ error: 'Image is too large. The limit is 8 MB.' }, { status: 413 })
  }

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('image')
  } catch {
    return NextResponse.json({ error: 'Could not read the uploaded image.' }, { status: 400 })
  }
  if (!(file instanceof File) || file.size === 0 || file.size > maxUploadBytes) {
    return NextResponse.json({ error: 'Choose an image smaller than 8 MB.' }, { status: 400 })
  }

  try {
    const source = Buffer.from(await file.arrayBuffer())
    const image = sharp(source, { limitInputPixels: 40_000_000, failOn: 'error' })
    const metadata = await image.metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '')) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are accepted.' }, { status: 415 })
    }
    const sanitized = await image.rotate().webp({ quality: 84, effort: 5 }).toBuffer()
    const db = getDatabase()
    const caseRows = await queryRows<{ id: string }>('SELECT id FROM case_studies WHERE id=$1', [id])
    if (!caseRows[0]) return NextResponse.json({ error: 'Case study not found.' }, { status: 404 })
    await db.transaction([
      db`INSERT INTO case_study_assets (case_study_id, content_type, image_data)
         VALUES (${id}, 'image/webp', ${sanitized})`,
      db`UPDATE case_studies SET metadata_sanitized=true, updated_at=now() WHERE id=${id}`,
    ])
    return NextResponse.json({ sanitized: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Case-study image processing failed:', error)
    return NextResponse.json({ error: 'The image could not be safely processed.' }, { status: 422 })
  }
}
