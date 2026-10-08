import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'
import { decryptPayload, encryptPayload } from '@/lib/encryption'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

const sitePayloadSchema = z.strictObject({
  parcelId: z.string().max(100),
  propertyAddress: z.string().max(300),
  gateOrAccessNotes: z.string().max(1000),
  assessmentNotes: z.string().max(8000),
})

const engagementSchema = z.strictObject({
  ndaConfirmed: z.literal(true),
  ndaReference: z.string().trim().min(1).max(200),
  siteDetails: sitePayloadSchema,
})

async function accessContext(reference: string, email: string, role: string) {
  const rows = await queryRows<{ id: string; assigned_staff_email: string | null }>(
    'SELECT id, assigned_staff_email FROM inquiries WHERE reference=$1',
    [reference],
  )
  const inquiry = rows[0]
  if (!inquiry || (role !== 'admin' && inquiry.assigned_staff_email !== email)) return null
  return inquiry
}

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const { reference } = await params
  const inquiry = await accessContext(reference, staff.email, staff.role)
  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found or not assigned to you.' }, { status: 404 })
  const rows = await queryRows<{
    nda_reference: string
    nda_confirmed_by: string
    nda_confirmed_at: string
    encrypted_site_payload: string
    site_encryption_iv: string
    site_encryption_tag: string
  }>(
    `SELECT nda_reference, nda_confirmed_by, nda_confirmed_at,
       encode(encrypted_site_payload, 'hex') AS encrypted_site_payload,
       encode(site_encryption_iv, 'hex') AS site_encryption_iv,
       encode(site_encryption_tag, 'hex') AS site_encryption_tag
     FROM engaged_site_assessments WHERE inquiry_id=$1`,
    [inquiry.id],
  )
  if (!rows[0]) return NextResponse.json({ error: 'No executed-NDA assessment record exists.' }, { status: 404 })
  try {
    const record = rows[0]
    const fromHex = (value: string) => Buffer.from(value.startsWith('\\x') ? value.slice(2) : value, 'hex')
    const siteDetails = decryptPayload(
      fromHex(record.encrypted_site_payload),
      fromHex(record.site_encryption_iv),
      fromHex(record.site_encryption_tag),
      'SITE_ASSESSMENT_ENCRYPTION_KEY',
    )
    return NextResponse.json({
      ndaReference: record.nda_reference,
      ndaConfirmedBy: record.nda_confirmed_by,
      ndaConfirmedAt: record.nda_confirmed_at,
      siteDetails,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Engaged site assessment decryption failed:', error)
    return NextResponse.json({ error: 'Restricted assessment details are unavailable.' }, { status: 503 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const { reference } = await params
  const inquiry = await accessContext(reference, staff.email, staff.role)
  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found or not assigned to you.' }, { status: 404 })
  let data: z.infer<typeof engagementSchema>
  try {
    data = engagementSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'An executed-agreement reference and complete site assessment are required.' }, { status: 400 })
  }
  try {
    const { encrypted, iv, tag } = encryptPayload(data.siteDetails, 'SITE_ASSESSMENT_ENCRYPTION_KEY')
    await queryRows(
      `INSERT INTO engaged_site_assessments
       (inquiry_id, assigned_staff_email, nda_reference, nda_confirmed_by, encrypted_site_payload, site_encryption_iv, site_encryption_tag)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (inquiry_id) DO UPDATE SET assigned_staff_email=$2, nda_reference=$3,
         nda_confirmed_by=$4, nda_confirmed_at=now(), encrypted_site_payload=$5,
         site_encryption_iv=$6, site_encryption_tag=$7, updated_at=now()`,
      [inquiry.id, inquiry.assigned_staff_email ?? staff.email, data.ndaReference, staff.email, encrypted, iv, tag],
    )
    return NextResponse.json({ recorded: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Engaged site assessment could not be encrypted and stored:', error)
    return NextResponse.json({ error: 'Restricted assessment details could not be safely saved.' }, { status: 503 })
  }
}
