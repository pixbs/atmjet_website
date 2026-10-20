import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'

/**
 * The form's zod resolver, with the schema fetched the first time the form is judged, so zod is
 * not part of the initial load of every page carrying a form (issue #428).
 *
 * Rules that could not be fetched are a root error rather than a throw, which would leave the
 * form submitting for good; the next judgement fetches them again.
 */
export function lazyZodResolver<T extends FieldValues>(
  schema: () => Promise<ZodType<T, T>>,
): Resolver<T> {
  return async (values, context, options) => {
    const rules = await schema().catch(() => null)
    if (rules === null) {
      return { values: {}, errors: { root: { type: 'unavailable' } } as FieldErrors<T> }
    }

    return zodResolver(rules)(values, context, options)
  }
}
