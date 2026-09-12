import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

/**
 * Placeholder home page. Rendered on the server (docs/adr/0007-rendering-strategy.md);
 * the real home page is composed from Payload blocks in E8.1.
 */
export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-center text-4xl font-bold lg:text-6xl">
        {user ? `Welcome back, ${user.email}` : 'Welcome to your new project.'}
      </h1>
      <div className="flex items-center gap-3">
        <a
          className="rounded-sm bg-white px-3 py-1 text-graphite-900"
          href={payloadConfig.routes.admin}
          rel="noopener noreferrer"
          target="_blank"
        >
          Go to admin panel
        </a>
        <a
          className="rounded-sm border border-white px-3 py-1"
          href="https://payloadcms.com/docs"
          rel="noopener noreferrer"
          target="_blank"
        >
          Documentation
        </a>
      </div>
    </div>
  )
}
