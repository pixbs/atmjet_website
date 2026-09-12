import type { Metadata } from 'next'
import React from 'react'

import { Counter } from '@/components/motion/counter'
import { Line } from '@/components/motion/line'
import { Reveal } from '@/components/motion/reveal'
import { Button, buttonVariants } from '@/components/ui/button'

/**
 * Fixture page for the parity base layer (issue #48). It renders every global rule the
 * legacy stylesheet defined, so tests/visual/styleguide.visual.spec.ts can catch a change
 * to the base layer or to a token; ported sections compare against the legacy baselines
 * instead (E6-E8). Server-rendered, unlinked and not indexed.
 */
export const metadata: Metadata = {
  title: 'Styleguide',
  robots: { index: false, follow: false },
}

const GRAPHITE = [
  { token: 'graphite-100', legacy: 'gray-800', className: 'bg-graphite-100' },
  { token: 'graphite-300', legacy: 'gray-700', className: 'bg-graphite-300' },
  { token: 'graphite-400', legacy: 'gray-600', className: 'bg-graphite-400' },
  { token: 'graphite-500', legacy: 'gray-500', className: 'bg-graphite-500' },
  { token: 'graphite-700', legacy: 'gray-400', className: 'bg-graphite-700' },
  { token: 'graphite-800', legacy: 'gray-300', className: 'bg-graphite-800' },
  { token: 'graphite-850', legacy: 'gray-200', className: 'bg-graphite-850' },
  { token: 'graphite-900', legacy: 'gray-100', className: 'bg-graphite-900' },
  { token: 'graphite-950', legacy: 'gray-150', className: 'bg-graphite-950' },
  { token: 'white', legacy: 'gray-900', className: 'bg-white' },
]

const ACCENTS = [
  { token: 'gold-600', className: 'bg-gold-600' },
  { token: 'gold-500', className: 'bg-gold-500' },
  { token: 'gold-300', className: 'bg-gold-300' },
  { token: 'gold-400', className: 'bg-gold-400' },
  { token: 'teal-950', className: 'bg-teal-950' },
  { token: 'green-950', className: 'bg-green-950' },
  { token: 'red-500', className: 'bg-red-500' },
  { token: 'red-50', className: 'bg-red-50' },
  { token: 'orange-200', className: 'bg-orange-200' },
  { token: 'blue-600', className: 'bg-blue-600' },
  { token: 'neutral-900', className: 'bg-neutral-900' },
  { token: 'black', className: 'bg-black' },
]

const RADII = ['rounded-sm', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full']

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="w-32 gap-1">
      <span className={`h-10 w-full border border-graphite-700 ${className}`} />
      <span className="text-graphite-400">{label}</span>
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <div className="gap-16 py-16">
      <section id="typography" className="container items-start gap-4">
        <h1>Heading one</h1>
        <h2>Heading two</h2>
        <h3>Heading three</h3>
        <h4>Heading four</h4>
        <p>
          Body copy at the base size and colour, with an <a href="#typography">inline link</a> in
          it.
        </p>
        <hr className="w-full" />
      </section>

      <section id="buttons" className="container items-start gap-4">
        <h3>Buttons</h3>
        <div className="flex-row items-center gap-4">
          <Button>Default</Button>
          <Button size="big">Big</Button>
          <Button size="middle">Middle</Button>
          <Button size="middle" tone="dark">
            Middle dark
          </Button>
          <span className={buttonVariants()}>Span as button</span>
        </div>
        <div className="flex-row items-center gap-4">
          <Button tone="gold">Gold</Button>
          <span className="bg-gold bg-clip-text text-transparent">Gold text</span>
        </div>
      </section>

      <section id="inputs" className="container items-start gap-4">
        <h3>Inputs</h3>
        <div className="w-full max-w-screen-sm gap-4">
          <input aria-label="Default input" placeholder="Default input" />
          <input aria-label="Dark input" className="dark" placeholder="Dark input" />
        </div>
      </section>

      <section id="surfaces" className="container items-start gap-4">
        <h3>Surfaces</h3>
        <div className="card w-full gap-2 p-6">
          <h4>Card</h4>
          <p>A card is a 3xl radius and a graphite-700 border.</p>
        </div>
        <div className="flex-row gap-4">
          <span className="darkening h-24 w-40" />
          <span className="hero-darkening h-24 w-40" />
          <span className="option-darkening h-24 w-40" />
        </div>
        <div className="flex-row gap-4">
          {RADII.map((radius) => (
            <span key={radius} className={`size-16 bg-graphite-850 ${radius}`} />
          ))}
        </div>
      </section>

      <section id="motion" className="container items-start gap-4">
        <h3>Motion</h3>
        <p>
          The vocabulary in <code>src/lib/motion.ts</code> carries the legacy timings; these are the
          primitives built on it. With reduced motion they render in their final state.
        </p>
        <Line once className="w-full" />
        <div className="flex-row items-baseline gap-8">
          <Counter className="font-serif text-4xl text-white">20+</Counter>
          <Counter className="font-serif text-4xl text-white">1,000 flights</Counter>
        </div>
        <Reveal once className="card w-full gap-2 p-6">
          <h4>Revealed on scroll</h4>
          <p>Fades and rises into place when it enters the viewport, and again when it returns.</p>
        </Reveal>
      </section>

      <section id="palette" className="container items-start gap-4">
        <h3>Palette</h3>
        <div className="flex-row flex-wrap gap-4">
          {GRAPHITE.map((colour) => (
            <Swatch
              key={colour.token}
              className={colour.className}
              label={`${colour.token} (${colour.legacy})`}
            />
          ))}
        </div>
        <div className="flex-row flex-wrap gap-4">
          {ACCENTS.map((colour) => (
            <Swatch key={colour.token} className={colour.className} label={colour.token} />
          ))}
        </div>
      </section>
    </div>
  )
}
