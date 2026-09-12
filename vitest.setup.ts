// Vitest setup (issue #40, ADR-0004): environment variables from .env, a fixed time zone so date
// formatting is deterministic. Database state is owned by each suite through tests/helpers/payload.ts.
import 'dotenv/config'

process.env.TZ = 'UTC'
