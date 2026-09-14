'use client'

import { AnimatePresence, m } from 'motion/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type ReactNode } from 'react'

import { BurgerMenu, Close, Logo } from '@/components/icons'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { spin } from '@/lib/motion'

/**
 * The bar the whole site is read under (`docs/legacy-inventory.md` section 3.2, issue #88):
 * transparent over the hero, blurred once the page has moved, gone while the visitor scrolls
 * down and back the moment they scroll up. The menu it opens is passed in already rendered, so
 * this file holds the three pieces of state and nothing else (ADR-0007).
 *
 * Two behaviours are kept as they were (`docs/legacy-inventory.md` section 13, entry 79): the
 * icons spin as they swap, and the bar stays put while the menu is open however the page moves.
 * Escape closes the menu, which the legacy header did not offer: a menu that covers the viewport
 * and can only be closed by pointer is one a keyboard cannot leave.
 */

/** Past this many pixels the legacy bar turned from transparent to blurred. */
const BLUR_AFTER = 50

export function HeaderBar({ menu }: { menu: ReactNode }) {
  const t = useTranslations('common')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [shownAt, setShownAt] = useState(pathname)

  // The legacy header closed the menu on every navigation; `usePathname` changes on a link and
  // on the back button alike. Reset while rendering rather than in an effect, so the menu is
  // never painted over the page it has just opened.
  if (shownAt !== pathname) {
    setShownAt(pathname)
    setIsOpen(false)
  }

  useEffect(() => {
    let lastY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      setIsScrolled(y > BLUR_AFTER)
      // Shown at the top of the page and whenever the visitor scrolls back up.
      setIsVisible(y <= BLUR_AFTER || y < lastY)
      lastY = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <>
      <section
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-700',
          isScrolled ? 'bg-graphite-900/20 backdrop-blur-xl' : 'bg-transparent',
          isVisible || isOpen ? 'translate-y-0' : '-translate-y-full',
        )}
        data-section="header"
      >
        <div className="container my-8!">
          <header className="flex flex-row justify-between">
            <button
              aria-expanded={isOpen}
              aria-label={isOpen ? t('closeMenu') : t('openMenu')}
              // Open, the button keeps the white pill of the base layer around the dark icon;
              // closed, it is a white burger on nothing at all.
              className={cn('p-2', !isOpen && 'bg-transparent text-white')}
              onClick={() => setIsOpen((open) => !open)}
              type="button"
            >
              <m.span
                animate="visible"
                className="flex"
                initial="hidden"
                key={isOpen ? 'close' : 'open'}
                variants={spin}
              >
                {isOpen ? <Close className="h-8" /> : <BurgerMenu className="h-8" />}
              </m.span>
            </button>
            <Link aria-label={t('logo')} href="/">
              <Logo className="h-8 text-white" />
            </Link>
          </header>
        </div>
      </section>
      <AnimatePresence>{isOpen && menu}</AnimatePresence>
    </>
  )
}
