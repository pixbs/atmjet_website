/**
 * What `bun run db:reset` is allowed to destroy (issue #22). Kept free of the Payload config so
 * the unit tier can load it on its own, as `deploy-migrations.ts` is.
 */
import path from 'node:path'

export const RESET_OVERRIDE = 'DB_RESET_ALLOW_PRODUCTION'

/**
 * A reset drops the schema, so production is refused rather than warned about: finding out
 * afterwards is not a recoverable way to learn it. The override exists for the one case the seed
 * has one for too — a staging environment that calls itself production.
 */
export function resetsOn(nodeEnv: string | undefined, override: string | undefined): boolean {
  return nodeEnv !== 'production' || override === '1'
}

/**
 * The uploads go with the rows, but only where they are this machine's. An environment with S3
 * configured keeps them there, and a `staticDir` pointing outside the project is somebody's
 * choice rather than this command's to undo.
 */
export function clearableUploads(root: string, staticDir: string | undefined): string | null {
  const resolved = path.resolve(root, staticDir ?? 'media')

  return resolved.startsWith(`${path.resolve(root)}${path.sep}`) ? resolved : null
}
