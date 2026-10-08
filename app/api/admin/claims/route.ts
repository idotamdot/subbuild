import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

const claimSchema = z.strictObject({
  title: z.string().trim().min(1).max(160),
  claimText: z.string().trim().min(1).max(4000),
  standardReference: z.string().trim().max(500),
  verificationStatus: z.enum(['verified', 'preliminary', 'custom', 'site_dependent', 'under_review']),
  reviewer: z.string().trim().max(254).optional(),
  lastReviewedAt: z.iso.datetime().optional(),
  expiresAt: z.iso.datetime(),
  isPublished: z.boolean(),
})

export async function GET() {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  await queryRows(
    `UPDATE technical_claims SET verification_status = 'under_review', is_published = false, updated_at = now()
     WHERE expires_at <= now() AND verification_status <> 'under_review'`,
  )
  const items = await queryRows(
    `SELECT id, title, claim_text, standard_reference, verification_status, reviewer,
       last_reviewed_at, expires_at, expires_at <= now() + interval '30 days' AS expires_soon,
       (expires_at > now() AND verification_status <> 'under_review' AND reviewer IS NOT NULL AND last_reviewed_at IS NOT NULL) AS can_publish,
       is_published, created_at, updated_at
     FROM technical_claims ORDER BY expires_at ASC LIMIT 200`,
  )
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  let claim: z.infer<typeof claimSchema>
  try {
    claim = claimSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid claim data.' }, { status: 400 })
  }
  if (claim.isPublished && (!claim.reviewer || !claim.lastReviewedAt || claim.verificationStatus === 'under_review')) {
    return NextResponse.json({ error: 'Published claims require a reviewer, review date, and an active verification status.' }, { status: 400 })
  }
  if (claim.expiresAt <= new Date().toISOString() && claim.isPublished) {
    return NextResponse.json({ error: 'Expired claims cannot be published.' }, { status: 400 })
  }
  const rows = await queryRows<{ id: number }>(
    `INSERT INTO technical_claims
      (title, claim_text, standard_reference, verification_status, reviewer, last_reviewed_at, expires_at, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [claim.title, claim.claimText, claim.standardReference, claim.verificationStatus, claim.reviewer ?? null, claim.lastReviewedAt ?? null, claim.expiresAt, claim.isPublished],
  )
  return NextResponse.json({ id: rows[0]?.id }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}
