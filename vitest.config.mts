import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/int/**/*.int.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      // Logic that must be unit/integration tested. UI components are covered by
      // the Playwright tiers instead (docs/adr/0004-testing-and-ci-strategy.md).
      include: [
        'src/collections/**',
        'src/lib/**',
        'src/utils/**',
        'src/hooks/**',
        'src/access/**',
      ],
      exclude: ['**/*.d.ts'],
      // Ratchet: these numbers may only go up. Raise them in the PR that adds tests.
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
})
