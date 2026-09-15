import { getTranslations } from 'next-intl/server'

import { BookingForm } from '@/components/form/booking-form'
import { ArrowTr } from '@/components/icons'
import { Reveal } from '@/components/motion/reveal'
import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/cn'
import { defaultCountry } from '@/lib/countries'
import { getSiteContact, getSocialLinks } from '@/lib/data/site-settings'
import { mailtoHref, telHref } from '@/lib/links'
import { contactBlock } from '@/lib/motion'

/**
 * The contact section every legacy page ended with (issue #129, `docs/legacy-inventory.md`
 * section 5): the two messenger cards, the booking form, and the card with the address and the
 * telephone number on it.
 *
 * The legacy section was a client component whole, watching itself with
 * `react-intersection-observer`; here the reveals and the form are the only islands (ADR-0007),
 * and the four delays are the legacy's, kept in the shared vocabulary as `contactBlock`.
 */

/**
 * What a messenger card is, but for the colour it ends on. The legacy list also carried
 * `border-0` and a hover border colour, both of which lose to the unlayered `.card` rule — on
 * the legacy site as here — so the border is the card's own and does not change (ADR-0006).
 */
const CARD =
  'card flex flex-col items-start gap-4 bg-linear-to-b from-graphite-900 from-15% p-10 transition-all ease-out hover:from-25% md:bg-fixed'

/** The address and the number, which fade as the pointer rests on them. */
const CONTACT = 'transition-opacity duration-300 ease-in-out hover:opacity-40'

export interface ContactUsProps {
  telegram: { title: string; description: string }
  whatsapp: { title: string; description: string }
  hours: string
  /** What a lead from this form is traced back to; the legacy sent an empty string. */
  source: string
  locale: Locale
}

export async function ContactUs({ telegram, whatsapp, hours, source, locale }: ContactUsProps) {
  const [social, contact, t] = await Promise.all([
    getSocialLinks(),
    getSiteContact(),
    getTranslations({ locale, namespace: 'booking' }),
  ])

  const messengers = [
    { href: social.telegram, tint: 'to-teal-950', ...telegram },
    { href: social.whatsapp, tint: 'to-green-950', ...whatsapp },
  ]

  return (
    <section data-section="contact-us">
      <div className="container gap-10 py-20">
        <div className="gap-10 lg:flex-row">
          {messengers.map((card) => (
            <Reveal
              className="w-full"
              key={card.title}
              once
              // The legacy gave both cards the same delay and read them from one observer.
              variants={contactBlock(0.3)}
            >
              {/* An address outside this site, so a plain anchor rather than `Link` (issue #262).
                  The legacy arrow carried `peer-hover:translate-x-10` on a descendant of the
                  element it named `peer`, which moves nothing, so it stands still here too. */}
              <a className={cn(CARD, card.tint)} href={card.href}>
                <h3>{card.title}</h3>
                <p className="text-white">{card.description}</p>
                <ArrowTr className="mt-5 h-5 stroke-none text-white" />
              </a>
            </Reveal>
          ))}
        </div>
        <div className="gap-10 lg:flex-row">
          <Reveal className="card w-full p-10 lg:w-2/3 lg:p-16" once variants={contactBlock(0.6)}>
            <BookingForm
              // Where the phone field opens: the home country of the language, until the
              // request can say where the visitor is (issue #160).
              defaultCountry={defaultCountry(null, locale)}
              formType="contact-us-inline"
              locale={locale}
              source={source}
              tags={[t('tagPartnership'), t('tagPress'), t('tagOther')]}
            />
          </Reveal>
          <Reveal
            className="card w-full justify-center gap-4 p-10 lg:w-1/3"
            once
            variants={contactBlock(0)}
          >
            {contact && (
              <>
                <a className={CONTACT} href={mailtoHref(contact.email)}>
                  <h3>{contact.email}</h3>
                </a>
                {/* The legacy `tel:` dialled a different number from the one it printed
                    (section 13, entry 73); here both come from the one an editor wrote. */}
                <a className={CONTACT} href={telHref(contact.phone)}>
                  <h3>{contact.phone}</h3>
                </a>
              </>
            )}
            <p>{hours}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
