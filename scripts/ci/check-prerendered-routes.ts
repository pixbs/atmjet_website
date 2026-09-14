/**
 * Fails the build when the site it just built has pages missing (issue #178).
 *
 *   bun run scripts/ci/check-prerendered-routes.ts
 *
 * Runs after `bun run build`, against `.next/prerender-manifest.json`.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { expectedRoutes, missingRoutes, routesFromManifest } from './prerendered-routes'

const manifestPath = path.join(process.cwd(), '.next', 'prerender-manifest.json')

function main(): void {
  let manifest: unknown

  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    console.error(`::error::${manifestPath} is missing or unreadable; run the build first.`)
    console.error(error)
    process.exit(1)
  }

  const prerendered = routesFromManifest(manifest)
  const missing = missingRoutes(expectedRoutes(), prerendered)

  if (missing.length > 0) {
    console.error(
      `::error::The build prerendered ${prerendered.length} routes and left out ${missing.length}: ${missing.join(', ')}. A build against an empty database looks exactly like this.`,
    )
    process.exit(1)
  }

  console.log(`check-prerendered-routes: all ${expectedRoutes().length} expected routes are there.`)
}

main()
