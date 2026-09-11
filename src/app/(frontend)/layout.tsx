import type { Metadata } from 'next'
import React from 'react'

import { MotionProvider } from '@/components/providers/motion-provider'

import './globals.css'

export const metadata: Metadata = {
  title: 'ATM JET',
  description: 'Private jet charter, yachts and cargo. Rebuilt on Payload 3 and Next.js 16.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-surface font-sans text-on-surface antialiased">
        <MotionProvider>
          <main>{children}</main>
        </MotionProvider>
      </body>
    </html>
  )
}
