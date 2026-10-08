import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/database'
import { getStaffContext } from '@/lib/staff'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const staff = await getStaffContext()
  if (!staff) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const status = new URL(request.url).searchParams.get('status')
  const validStatuses = ['new', 'assigned', 'clarification_needed', 'contact_scheduled', 'closed']
  if (status && !validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status filter.' }, { status: 400 })

  const staffCondition = staff.role === 'admin' ? '' : 'AND assigned_staff_email = $1'
  const statusCondition = status ? `AND status = $${staff.role === 'admin' ? 1 : 2}` : ''
  const parameters = staff.role === 'admin'
    ? (status ? [status] : [])
    : (status ? [staff.email, status] : [staff.email])
  const items = await queryRows<{
    reference: string
    status: string
    assigned_staff_email: string | null
    created_at: string
    response_due_at: string
    overdue: boolean
  }>(
    `SELECT reference, status, assigned_staff_email, created_at, response_due_at,
       (response_due_at < now() AND status <> 'closed') AS overdue
     FROM inquiries WHERE true ${staffCondition} ${statusCondition}
     ORDER BY response_due_at ASC LIMIT 100`,
    parameters,
  )
  return NextResponse.json({ items, role: staff.role }, { headers: { 'Cache-Control': 'no-store' } })
}
