import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getStaffContext, allowedStaffEmails } from '@/lib/staff'
import { queryRows } from '@/lib/database'
import { decryptPayload } from '@/lib/encryption'

export const runtime = 'nodejs'

type StoredInquiry = {
  reference: string
  status: string
  assigned_staff_email: string | null
  encrypted_payload: string
  encryption_iv: string
  encryption_tag: string
  consultation_contact_consent: boolean
  marketing_consent: boolean
  created_at: string
  response_due_at: string
}

function decodeHex(value: string) {
  return Buffer.from(value.startsWith('\\x') ? value.slice(2) : value, 'hex')
}

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const { reference } = await params
  const access = staff.role === 'admin' ? '' : 'AND assigned_staff_email = $2'
  const paramsForQuery = staff.role === 'admin' ? [reference] : [reference, staff.email]
  const rows = await queryRows<StoredInquiry>(
    `SELECT reference, status, assigned_staff_email, encode(encrypted_payload, 'hex') AS encrypted_payload,
       encode(encryption_iv, 'hex') AS encryption_iv, encode(encryption_tag, 'hex') AS encryption_tag,
       consultation_contact_consent, marketing_consent, created_at, response_due_at
     FROM inquiries WHERE reference = $1 ${access} LIMIT 1`,
    paramsForQuery,
  )
  const inquiry = rows[0]
  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 })

  try {
    const payload = decryptPayload(
      decodeHex(inquiry.encrypted_payload),
      decodeHex(inquiry.encryption_iv),
      decodeHex(inquiry.encryption_tag),
    )
    return NextResponse.json({
      ...inquiry,
      encrypted_payload: undefined,
      encryption_iv: undefined,
      encryption_tag: undefined,
      payload,
      overdue: inquiry.status !== 'closed' && new Date(inquiry.response_due_at).getTime() < Date.now(),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Inquiry decryption failed:', error)
    return NextResponse.json({ error: 'Inquiry details are temporarily unavailable.' }, { status: 503 })
  }
}

const updateSchema = z.strictObject({
  status: z.enum(['new', 'assigned', 'clarification_needed', 'contact_scheduled', 'closed']).optional(),
  assignedStaffEmail: z.email().max(254).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid update.' }, { status: 400 })
  }
  if (!body.status && !body.assignedStaffEmail) {
    return NextResponse.json({ error: 'Provide a status or staff assignment.' }, { status: 400 })
  }
  if (body.assignedStaffEmail && staff.role !== 'admin') {
    return NextResponse.json({ error: 'Only administrators can assign inquiries.' }, { status: 403 })
  }
  if (body.assignedStaffEmail && !allowedStaffEmails().includes(body.assignedStaffEmail.toLowerCase())) {
    return NextResponse.json({ error: 'That email is not on the approved staff list.' }, { status: 400 })
  }

  const { reference } = await params
  let rows: { reference: string }[]
  if (body.assignedStaffEmail) {
    rows = await queryRows<{ reference: string }>(
      `UPDATE inquiries SET assigned_staff_email = $1, status = 'assigned'
       WHERE reference = $2 RETURNING reference`,
      [body.assignedStaffEmail.toLowerCase(), reference],
    )
  } else {
    const status = body.status!
    const scopedCondition = staff.role === 'admin' ? '' : 'AND assigned_staff_email = $3'
    const values = staff.role === 'admin' ? [status, reference] : [status, reference, staff.email]
    rows = await queryRows<{ reference: string }>(
      `UPDATE inquiries SET status = $1 WHERE reference = $2 ${scopedCondition} RETURNING reference`,
      values,
    )
  }
  if (!rows[0]) return NextResponse.json({ error: 'Inquiry not found or not assigned to you.' }, { status: 404 })
  return NextResponse.json({ reference, updated: true }, { headers: { 'Cache-Control': 'no-store' } })
}
