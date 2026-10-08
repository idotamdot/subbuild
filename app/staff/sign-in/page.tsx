import SignInPanel from '@/components/sign-in-panel'
import { isWorkforceSignInConfigured } from '@/auth'
import { isDevelopmentAuthBypassEnabled } from '@/lib/staff'
import { redirect } from 'next/navigation'

export default function StaffSignIn() {
  if (isDevelopmentAuthBypassEnabled()) redirect('/staff')
  return <SignInPanel configured={isWorkforceSignInConfigured} providerName={process.env.AUTH_OIDC_PROVIDER_NAME || 'Organization sign-in'} />
}
