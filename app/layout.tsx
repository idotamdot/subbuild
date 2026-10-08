import type { Metadata } from 'next'
import { connection } from 'next/server'
import './globals.css'

export const metadata: Metadata = {
  title: 'CommonGround Atlas | Global Community Readiness',
  description:
    'Explore an early-stage community preparedness prototype with all-hazards discussion prompts, official-source links, and a conceptual safety-place studio.',
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
