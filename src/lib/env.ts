import { z } from 'zod'

/**
 * The two variables the site cannot start without (issue #19, `docs/environment.md`).
 *
 * Everything else `.env.example` carries is optional by design and says so where it is read: a
 * site without `TELEGRAM_BOT_TOKEN` still takes leads and records the delivery as failed (#161),
 * one without `NEXT_PUBLIC_SITE_URL` describes itself as localhost (`src/lib/urls.ts`), and one
 * without the `S3_*` group keeps its uploads on disk (`src/lib/storage.ts`). These two have no
 * such answer: without them `payload.config.ts` used to hand the adapter an empty string and the
 * failure arrived later, as a connection error or an unsigned cookie, naming neither variable.
 */

/**
 * The value `.env.example` ships. It is in the repository, so it is not a secret anywhere, and
 * a deployment that copied the file has no signing key at all. `tests/unit/env.test.ts` reads the
 * file and holds this to what it says.
 */
const PLACEHOLDER_SECRET = 'change-me-to-a-long-random-string'

/**
 * Short enough for a throwaway value in CI, long enough that a word or a date is refused. What
 * production should hold is a generated 32-byte string; `docs/environment.md` says so.
 */
const SECRET_MIN_LENGTH = 16

/** What Postgres connection strings begin with; the adapter accepts either spelling. */
const POSTGRES_SCHEMES = ['postgres:', 'postgresql:']

const isPostgresUrl = (value: string): boolean => {
  try {
    return POSTGRES_SCHEMES.includes(new URL(value).protocol)
  } catch {
    return false
  }
}

// A blank value is one problem, not two: zod runs every check unless one aborts, so the checks
// meant for a value that is there are skipped once "is not set" has fired.
const environmentSchema = z.object({
  DATABASE_URL: z
    .string({ error: 'is not set' })
    .trim()
    .min(1, { error: 'is not set', abort: true })
    .refine(isPostgresUrl, 'is not a postgres:// or postgresql:// connection string'),
  PAYLOAD_SECRET: z
    .string({ error: 'is not set' })
    .trim()
    .min(1, { error: 'is not set', abort: true })
    .refine((value) => value !== PLACEHOLDER_SECRET, 'is the placeholder from .env.example')
    .refine(
      (value) => value.length >= SECRET_MIN_LENGTH,
      `is shorter than ${SECRET_MIN_LENGTH} characters`,
    ),
})

type Environment = z.infer<typeof environmentSchema>

/**
 * The environment, or one error naming every variable that is wrong.
 *
 * Every problem at once, because a person fixing a fresh deployment should not learn about the
 * second missing variable only after setting the first.
 */
export function readEnvironment(
  // `Record` rather than `NodeJS.ProcessEnv`, which requires `NODE_ENV`: what this reads is a
  // bag of names, and a test supplies two of them.
  source: Record<string, string | undefined> = process.env,
): Environment {
  const parsed = environmentSchema.safeParse(source)
  if (parsed.success) return parsed.data

  const problems = parsed.error.issues.map(
    (issue) => `  - ${String(issue.path[0] ?? 'the environment')} ${issue.message}`,
  )

  throw new Error(
    [
      'The environment is not configured:',
      ...problems,
      'Set them in .env for development (see .env.example), or in the Vercel environment.',
      'What each variable is for, and which environments hold it: docs/environment.md.',
    ].join('\n'),
  )
}
