import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'consultant' | 'admin'
    } & NonNullable<Session['user']>
  }
}
