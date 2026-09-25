import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * The reconciliation tier (issue #44): importers run against the legacy fixture and the checks
 * of `scripts/migrate/reconcile.ts` compare the two. One file at a time, because every spec
 * loads the same fixture schema into the database the integration tier shares.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/reconcile/**/*.reconcile.spec.ts'],
    fileParallelism: false,
  },
})
