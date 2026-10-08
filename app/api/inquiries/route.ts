import { createHmac, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { queryRows } from '@/lib/database'
import { encryptPayload } from '@/lib/encryption'

export const runtime = 'nodejs'

const areaOptions = ['', 'Withheld', 'Bastrop County', 'Williamson County', 'Travis County', 'Lee County', 'Other Central Texas area'] as const
const feasibilitySchema = z.strictObject({
  'Soil & drainage': z.enum(['Known', 'Unsure', 'Requires assessment']).optional(),
  'Site access': z.enum(['Known', 'Unsure', 'Requires assessment']).optional(),
  'Utility paths': z.enum(['Known', 'Unsure', 'Requires assessment']).optional(),
  'Mobility & permits': z.enum(['Known', 'Unsure', 'Requires assessment']).optional(),
})
const briefSchema = z.strictObject({
  title: z.literal('Private shelter planning brief'),
  version: z.literal('Guidance rules 1.0'),
  preparedOn: z.iso.date(),
  notice: z.literal('Planning guidance only. Not an engineered recommendation, permit, or safety approval.'),
  goal: z.enum(['', 'Withheld', 'Storm shelter', 'Safe room', 'Custom shelter']),
  projectType: z.enum(['', 'Withheld', 'New build', 'Retrofit', 'Unsure']),
  occupancy: z.enum(['', 'Withheld', '1–2 people', '3–5 people', '6–10 people', 'More than 10', 'Not sure yet']),
  targetDuration: z.enum(['', 'Withheld', 'Hours', 'Overnight', 'Several days', 'Weeks or longer', 'Not sure yet']),
  broadArea: z.enum(areaOptions),
  feasibility: z.union([z.literal('Withheld'), feasibilitySchema]),
  unresolvedItems: z.union([z.literal('Withheld'), z.array(z.enum(['Soil & drainage', 'Site access', 'Utility paths', 'Mobility & permits'])).max(4)]),
  physicalEnvelope: z.union([
    z.literal('Withheld'),
    z.strictObject({
      category: z.enum(['Potential below-grade fit conflict', 'Complex engineering review', 'Standard-methods screening candidate', 'More information needed']),
      flags: z.array(z.string().max(200)).max(8),
      guidance: z.string().max(500),
    }),
  ]),
  ownerPriorities: z.union([z.literal('Withheld'), z.array(z.enum(['Longer duration', 'Air filtration', 'Medical access', 'Daily accessibility', 'Budget', 'Simple installation'])).max(6)]),
})

const intakeSchema = z.strictObject({
  brief: briefSchema,
  contact: z.strictObject({
    alias: z.string().trim().min(1).max(80),
    channel: z.enum(['Email', 'Phone']),
    email: z.union([z.email().max(254), z.literal('')]).optional(),
    phone: z.string().max(30).optional(),
    area: z.enum(areaOptions),
    window: z.enum(['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Email only — no calls']),
    consent: z.literal(true),
    marketing: z.boolean(),
    acknowledgement: z.literal('on_page'),
  }).superRefine((contact, context) => {
    if (contact.channel === 'Email' && !contact.email) context.addIssue({ code: 'custom', path: ['email'], message: 'Email is required for email contact.' })
    if (contact.channel === 'Phone' && !contact.phone?.trim()) context.addIssue({ code: 'custom', path: ['phone'], message: 'Phone is required for phone contact.' })
  }),
})

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

function addBusinessDays(from: Date, days: number) {
  const due = new Date(from)
  let added = 0
  while (added < days) {
    due.setUTCDate(due.getUTCDate() + 1)
    if (due.getUTCDay() !== 0 && due.getUTCDay() !== 6) added++
  }
  return due
}

async function applyRateLimit(request: Request) {
  const key = process.env.RATE_LIMIT_HMAC_KEY
  if (!key) throw new Error('RATE_LIMIT_HMAC_KEY is not configured.')
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
  const digest = createHmac('sha256', key).update(address).digest()
  const rows = await queryRows<{ request_count: number }>(
    `INSERT INTO intake_rate_limits (address_digest, window_started_at, request_count)
     VALUES ($1, now(), 1)
     ON CONFLICT (address_digest) DO UPDATE SET
       window_started_at = CASE
         WHEN intake_rate_limits.window_started_at < now() - interval '1 hour' THEN now()
         ELSE intake_rate_limits.window_started_at
       END,
       request_count = CASE
         WHEN intake_rate_limits.window_started_at < now() - interval '1 hour' THEN 1
         ELSE intake_rate_limits.request_count + 1
       END
     RETURNING request_count`,
    [digest],
  )
  return Number(rows[0]?.request_count ?? 0) <= 5
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return responseError('Cross-origin submission is not allowed.', 403)
  }
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 32_768) return responseError('Request is too large.', 413)

  let data: z.infer<typeof intakeSchema>
  try {
    data = intakeSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return responseError('Please check the submitted details and try again.', 400)
    throw error
  }

  try {
    if (!(await applyRateLimit(request))) return responseError('Too many requests. Please try again later.', 429)
    const referenceKey = randomBytes(32).toString('base64url')
    const referenceSecret = process.env.REFERENCE_KEY_HMAC_SECRET
    if (!referenceSecret) throw new Error('REFERENCE_KEY_HMAC_SECRET is not configured.')
    const keyDigest = createHmac('sha256', referenceSecret).update(referenceKey).digest()
    const { encrypted, iv, tag } = encryptPayload({
      brief: data.brief,
      contact: data.contact,
    })
    const responseDueAt = addBusinessDays(new Date(), 2).toISOString()
    for (let attempt = 0; attempt < 3; attempt++) {
      const year = new Date().getUTCFullYear()
      const suffix = randomBytes(3).toString('hex').toUpperCase()
      const reference = `CTX-${year}-${suffix}`
      const rows = await queryRows<{ reference: string }>(
        `INSERT INTO inquiries
         (reference, encrypted_payload, encryption_iv, encryption_tag, reference_key_digest, consultation_contact_consent, marketing_consent, response_due_at)
         VALUES ($1, $2, $3, $4, $5, true, $6, $7)
         ON CONFLICT (reference) DO NOTHING
         RETURNING reference`,
        [reference, encrypted, iv, tag, keyDigest, data.contact.marketing, responseDueAt],
      )
      if (rows[0]?.reference) {
        return NextResponse.json(
          { reference, referenceKey },
          { status: 201, headers: { 'Cache-Control': 'no-store' } },
        )
      }
    }
    return responseError('We could not assign a reference. Please try again.', 503)
  } catch (error) {
    console.error('Inquiry submission failed:', error)
    return responseError('We could not safely save your request. Please try again later.', 503)
  }
}
