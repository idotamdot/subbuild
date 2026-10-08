import ContentGovernance from '@/components/content-governance'
import { requireStaffRole } from '@/lib/staff'

export default async function ContentPage() {
  await requireStaffRole('admin')
  return <ContentGovernance />
}
