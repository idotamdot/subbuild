import NextAuth from 'next-auth'
import type { OAuthConfig } from 'next-auth/providers'

type WorkforceProfile = {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

function configuredProvider(): OAuthConfig<WorkforceProfile> | null {
  const issuer = process.env.AUTH_OIDC_ISSUER
  const clientId = process.env.AUTH_OIDC_CLIENT_ID
  const clientSecret = process.env.AUTH_OIDC_CLIENT_SECRET
  if (!issuer || !clientId || !clientSecret) return null

  return {
    id: 'workforce-oidc',
    name: process.env.AUTH_OIDC_PROVIDER_NAME || 'Organization sign-in',
    type: 'oidc',
    issuer,
    clientId,
    clientSecret,
    checks: ['pkce', 'state'],
  }
}

const provider = configuredProvider()
const administrators = new Set((process.env.ADMIN_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))
const consultants = new Set((process.env.CONSULTANT_EMAILS ?? '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean))

export const isWorkforceSignInConfigured = Boolean(
  process.env.AUTH_SECRET &&
  provider &&
  (administrators.size > 0 || consultants.size > 0),
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: provider ? [provider] : [],
  pages: { signIn: '/staff/sign-in' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  callbacks: {
    async signIn({ user, profile }) {
      if (!isWorkforceSignInConfigured || !user.email || !profile?.sub) return false
      const verifiedProfile = profile as typeof profile & { email_verified?: boolean }
      if (verifiedProfile.email_verified !== true) return false
      const email = user.email.toLowerCase()
      return administrators.has(email) || consultants.has(email)
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      const email = token.email?.toLowerCase()
      token.role = email && administrators.has(email) ? 'admin' : email && consultants.has(email) ? 'consultant' : undefined
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub && (token.role === 'admin' || token.role === 'consultant')) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
  },
})
