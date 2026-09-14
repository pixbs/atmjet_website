import { useTranslations } from 'next-intl'

import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

/**
 * The 404 the legacy site never had: an unknown path showed Next's unstyled default, with no
 * chrome and no way back (`docs/legacy-inventory.md` section 2.5).
 *
 * Rendered synchronously, so the words are in the HTML the server sends rather than arriving
 * with the client payload (ADR-0007); `useTranslations` is the server-side reader that does not
 * suspend, unlike `getTranslations`.
 */
export default function NotFound() {
  const t = useTranslations('errors.notFound')

  return (
    <section className="container min-h-svh items-start justify-center gap-6 py-24">
      <h1>{t('title')}</h1>
      <p className="max-w-screen-sm">{t('description')}</p>
      <Link className={buttonVariants({ as: 'link', size: 'middle' })} href="/">
        {t('home')}
      </Link>
    </section>
  )
}
