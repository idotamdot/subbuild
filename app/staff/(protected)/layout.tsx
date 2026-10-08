import type { ReactNode } from 'react'
import StaffHeader from '@/components/staff-header'
import { isDevelopmentAuthBypassEnabled, requireStaffRole } from '@/lib/staff'

export default async function StaffWorkspaceLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaffRole()
  return (
    <main className="staff-shell">
      <StaffHeader email={staff.email} role={staff.role} developmentBypass={isDevelopmentAuthBypassEnabled()} />
      {children}
    </main>
  )
}
