import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Node, not jsdom: these suites are pure logic and Payload calls, and the upload pipeline's
    // file-type sniffing (the MIME allowlist on Media) does not work under jsdom. A future
    // component test opts back in with a `@vitest-environment jsdom` docblock.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // `.tsx` for the suites that render a component (the error boundary of issue #56).
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/int/**/*.int.spec.ts'],
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
      // Fixed thresholds (ADR-0008): change them only in a pull request that says why.
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
})
