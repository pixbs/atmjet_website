'use client'

import { m, useInView, useReducedMotion } from 'motion/react'
import Image, { type ImageProps } from 'next/image'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'

import { Words } from '@/components/motion/words'
import { fadeIn, fadeUp, gild, settle, unveil } from '@/lib/motion'

/**
 * The ways an element can arrive, by name: a server component cannot hand variants to a client
 * one, because their states are functions.
 */
const ARRIVALS = { fadeUp, fadeIn, unveil, gild }

/**
 * Where an element is in its arrival (docs/legacy-inventory.md section 13, entry 101): `rest` as
 * the server drew it, `held` back while it is still below the screen, `arrived` once it has
 * scrolled into view. Only the browser holds anything back, and only what nobody can see yet, so
 * the server, a visitor who asks for less motion and whatever is already on screen stay at rest.
 */
function useArrival(
  target: RefObject<Element | null>,
  { byParent = false, amount = 0.2 }: { byParent?: boolean; amount?: number | 'some' } = {},
) {
  const isCalm = useReducedMotion()
  const [isHeld, setIsHeld] = useState(false)
  // A clipped element shows the observer no area at all, so it would never be seen arriving:
  // one that is uncovered rather than moved is watched through the box it sits in.
  const watched = useRef<Element | null>(null)
  const inView = useInView(watched, { once: true, amount })

  useLayoutEffect(() => {
    const element = target.current
    watched.current = byParent ? (element?.parentElement ?? null) : element
    if (isCalm || !element) return

    // Measured before the first paint: an element already on screen is never taken off it.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a layout read decides it
    if (element.getBoundingClientRect().top > window.innerHeight) setIsHeld(true)
  }, [byParent, isCalm, target])

  if (!isHeld) return 'rest'

  return inView ? 'arrived' : 'held'
}

/**
 * The elements an arrival can be drawn on. Typed as the div they all behave like for motion's
 * purposes, so one component can render any of them.
 */
const TAGS = { div: m.div, p: m.p, h2: m.h2, h3: m.h3, span: m.span } as Record<
  string,
  typeof m.div
>

/** An element that arrives as it scrolls into view: rising as it fades in, unless told otherwise. */
export function Arrive({
  as = 'div',
  variant = 'fadeUp',
  wait = 0,
  hover = false,
  whenPeeking = false,
  className,
  style,
  children,
}: {
  as?: 'div' | 'p' | 'h2' | 'h3' | 'span'
  variant?: keyof typeof ARRIVALS
  /** Seconds after it comes into view before it arrives. */
  wait?: number
  /** Arrives at its first pixel on screen: a slide peeking in at the edge is part of the design. */
  whenPeeking?: boolean
  /** Leans whatever inside it has a `hover` state towards the pointer. */
  hover?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const arrival = useArrival(ref, {
    byParent: variant === 'unveil' || variant === 'gild',
    amount: whenPeeking ? 'some' : undefined,
  })
  const Tag = TAGS[as]!

  return (
    <Tag
      // At rest there is nothing to animate to, so it is drawn with no motion values at all.
      animate={arrival === 'rest' ? undefined : arrival === 'held' ? 'hidden' : 'visible'}
      className={className}
      custom={wait}
      initial={false}
      ref={ref}
      style={style}
      variants={ARRIVALS[variant]}
      whileHover={hover ? 'hover' : undefined}
    >
      {children}
    </Tag>
  )
}

/** A heading whose words rise into their line, one after the other, as it scrolls into view. */
export function RiseText({
  as = 'h2',
  wait = 0,
  className,
  children,
}: {
  as?: 'h2' | 'h3' | 'span'
  wait?: number
  className?: string
  /** A heading may be left empty and still keep its place, as the legacy cards did. */
  children?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const arrival = useArrival(ref)
  // Whole again once every word is in its line: split words can size a box a fraction of a
  // pixel differently, and at rest the heading is exactly the text the server sent.
  const [hasRisen, setHasRisen] = useState(false)
  const Tag = as

  return (
    <Tag className={className} ref={ref}>
      {arrival === 'rest' || hasRisen || !children ? (
        children
      ) : (
        <Words
          isShown={arrival === 'arrived'}
          onRisen={() => setHasRisen(true)}
          text={children}
          wait={wait}
        />
      )}
    </Tag>
  )
}

const MotionImage = m.create(Image)

/** What a photograph here is drawn from: the image's own props, less its DOM event handlers. */
type Photo = Pick<ImageProps, 'alt' | 'className' | 'fill' | 'height' | 'sizes' | 'src' | 'width'>

/**
 * A photograph uncovered from its foot up, never moved or scaled. It follows the arrival of the
 * card it sits in, `wait` seconds behind it.
 */
export function UnveilImage({ wait = 0, ...props }: Photo & { wait?: number }) {
  return <MotionImage {...props} custom={wait} variants={unveil} />
}

/**
 * A photograph filling a card: uncovered from its foot up as the card arrives, `wait` seconds
 * behind it, settling from large as it is, and leaning in under the pointer. The card has to
 * clip it.
 */
export function SettleImage({ wait = 0, ...props }: Photo & { wait?: number }) {
  return <MotionImage {...props} custom={wait} variants={settle} />
}
