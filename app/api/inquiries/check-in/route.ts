import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'

export const runtime = 'nodejs'

const checkInSchema = z.strictObject({
  reference: z.string().regex(/^CTX-\d{4}-[A-F0-9]{6}$/),
  referenceKey: z.string().min(40).max(60),
})

export async function POST(request: Request) {
  let input: z.infer<typeof checkInSchema>
  try {
    input = checkInSchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'The one-time receipt key is invalid.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  const secret = process.env.REFERENCE_KEY_HMAC_SECRET
  if (!secret) return NextResponse.json({ error: 'Receipt check-in is unavailable.' }, { status: 503 })
  const digest = createHmac('sha256', secret).update(input.referenceKey).digest()
  try {
    const rows = await queryRows<{ status: string; response_due_at: string }>(
      `UPDATE inquiries SET reference_key_digest=NULL
       WHERE reference=$1 AND reference_key_digest=$2
       RETURNING status, response_due_at`,
      [input.reference, digest],
    )
    if (!rows[0]) {
      return NextResponse.json({ error: 'This one-time receipt key has already been used or is not valid.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    }
    return NextResponse.json({ received: true, status: rows[0].status, responseDueAt: rows[0].response_due_at }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Receipt check-in failed:', error)
    return NextResponse.json({ error: 'Receipt check-in is temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
