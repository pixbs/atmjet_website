import Image from 'next/image'

import { RequestForm } from '@/components/form/request-form'
import type { Locale } from '@/i18n/locales'
import type { ImageSource } from '@/lib/media'

/**
 * The transfer invitation (issue #115, `docs/legacy-inventory.md` section 5): the photograph
 * across the top of a card on a narrow screen and beside the heading on a wide one, with the
 * flight request form under both.
 */
export function Transfer({
  title,
  image,
  locale,
}: {
  title: string
  image: ImageSource
  locale: Locale
}) {
  return (
    <section data-section="transfer">
      <div className="container">
        <div className="gap-6 rounded-2xl bg-graphite-850 p-8">
          <div className="gap-8 md:flex-row-reverse">
            <div className="relative -mx-8 -mt-8 h-48 items-center justify-center overflow-hidden rounded-t-2xl bg-cover bg-center md:m-0 md:w-full">
              {/* The legacy markup passed the Next 12 `layout='fill'` prop, which section 13
                  entry 80 marks `fix-while-porting`: `fill` is what it is called now. */}
              <Image
                alt={image.alt === '' ? title : image.alt}
                className="absolute object-cover"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                src={image.src}
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent from-50% to-black" />
            </div>
            <h2>{title}</h2>
          </div>
          <RequestForm locale={locale} />
        </div>
      </div>
    </section>
  )
}
