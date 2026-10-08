import type { Metadata } from 'next'
import { connection } from 'next/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'Enter Sanctum SubTerranean Private Construction | Central Texas',
  description:
    'Explore private shelter construction planning in Central Texas. Your preliminary plan stays on your device.',
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection()
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
