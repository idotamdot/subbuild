import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export type StaffRole = 'consultant' | 'admin'

export function isDevelopmentAuthBypassEnabled() {
  return process.env.NODE_ENV === 'development' && process.env.DEV_AUTH_BYPASS === 'true'
}

export async function getStaffContext() {
  if (isDevelopmentAuthBypassEnabled()) {
    return { email: 'local-admin@localhost', subject: 'local-development', role: 'admin' as const }
  }
  if (!process.env.AUTH_SECRET) return null
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  const subject = session?.user?.id
  if (!email || !subject) return null

  const admins = new Set((process.env.ADMIN_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))
  const consultants = new Set((process.env.CONSULTANT_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))
  const role: StaffRole | null = admins.has(email) ? 'admin' : consultants.has(email) ? 'consultant' : null
  return role ? { email, subject, role } : null
}

export async function requireStaffRole(role?: StaffRole) {
  const staff = await getStaffContext()
  if (!staff) redirect('/staff/sign-in')
  if (role === 'admin' && staff.role !== 'admin') redirect('/staff')
  return staff
}

export function allowedStaffEmails(role?: StaffRole) {
  const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  const consultants = (process.env.CONSULTANT_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
  return role === 'admin' ? admins : [...new Set([...admins, ...consultants])]
}
