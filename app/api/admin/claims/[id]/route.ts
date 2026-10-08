import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

const updateSchema = z.strictObject({
  title: z.string().trim().min(1).max(160),
  claimText: z.string().trim().min(1).max(4000),
  standardReference: z.string().trim().max(500),
  verificationStatus: z.enum(['verified', 'preliminary', 'custom', 'site_dependent', 'under_review']),
  reviewer: z.string().trim().max(254).optional(),
  lastReviewedAt: z.iso.datetime().optional(),
  expiresAt: z.iso.datetime(),
  isPublished: z.boolean(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (staff.role !== 'admin') return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 })
  const { id } = await params
  if (!/^[1-9]\d{0,17}$/.test(id)) return NextResponse.json({ error: 'Invalid claim id.' }, { status: 400 })
  let claim: z.infer<typeof updateSchema>
  try {
    claim = updateSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid claim data.' }, { status: 400 })
  }
  if (claim.isPublished && (!claim.reviewer || !claim.lastReviewedAt || claim.verificationStatus === 'under_review')) {
    return NextResponse.json({ error: 'Published claims require a reviewer, review date, and an active verification status.' }, { status: 400 })
  }
  if (claim.expiresAt <= new Date().toISOString() && claim.isPublished) {
    return NextResponse.json({ error: 'Expired claims cannot be published.' }, { status: 400 })
  }
  const rows = await queryRows<{ id: string }>(
    `UPDATE technical_claims SET title=$1, claim_text=$2, standard_reference=$3, verification_status=$4,
       reviewer=$5, last_reviewed_at=$6, expires_at=$7, is_published=$8, updated_at=now()
     WHERE id=$9 RETURNING id`,
    [claim.title, claim.claimText, claim.standardReference, claim.verificationStatus, claim.reviewer ?? null, claim.lastReviewedAt ?? null, claim.expiresAt, claim.isPublished, id],
  )
  if (!rows[0]) return NextResponse.json({ error: 'Claim not found.' }, { status: 404 })
  return NextResponse.json({ updated: true }, { headers: { 'Cache-Control': 'no-store' } })
}
