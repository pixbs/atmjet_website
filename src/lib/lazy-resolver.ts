import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import type { ZodType } from 'zod'

/**
 * The form's zod resolver, with the schema fetched the first time the form is judged, so zod is
 * not part of the initial load of every page carrying a form (issue #428).
 */
export function lazyZodResolver<T extends FieldValues>(
  schema: () => Promise<ZodType<T, T>>,
): Resolver<T> {
  return async (values, context, options) => zodResolver(await schema())(values, context, options)
}
