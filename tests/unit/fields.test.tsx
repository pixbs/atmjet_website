import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

/**
 * The form primitives (issue #96, `docs/legacy-inventory.md` section 6). What the legacy site
 * rendered is the contract; what it left out — the tie between a label and its field — is the
 * one thing that changes, and it is asserted here rather than described.
 */

describe('Input', () => {
  it('names the field it labels, which the legacy label did not', () => {
    // The legacy label was positioned over the box with no `htmlFor`, so a screen reader read
    // the field as unlabelled and clicking the label focused nothing.
    const html = renderToStaticMarkup(<Input id="from" label="From" />)

    expect(html).toContain('for="from"')
    expect(html).toContain('id="from"')
  })

  it('leaves room above the value for the label to sit in', () => {
    const html = renderToStaticMarkup(<Input id="from" label="From" />)

    expect(html).toMatch(/<label[^>]*class="[^"]*absolute[^"]*"/)
    expect(html).toMatch(/<input[^>]*class="[^"]*pt-9[^"]*"/)
  })

  it('draws the white panel the legacy inverted ramp called gray-900', () => {
    const html = renderToStaticMarkup(<Input id="from" label="From" />)

    expect(html).toMatch(/<div class="[^"]*bg-white[^"]*"/)
    // `rounded-sm` pointed at an undefined variable on the legacy site, so the box is square.
    expect(html).not.toMatch(/class="[^"]*rounded/)
  })

  it('passes a caller a way to reach the control and the panel apart', () => {
    const html = renderToStaticMarkup(
      <Input id="from" label="From" className="h-16" wrapperClassName="rounded-t-xl" />,
    )

    expect(html).toMatch(/<div class="[^"]*rounded-t-xl[^"]*"/)
    expect(html).toMatch(/<input[^>]*class="[^"]*h-16[^"]*"/)
  })

  it('spreads what an input takes, so a form can register it', () => {
    const html = renderToStaticMarkup(
      <Input id="date" label="Date" type="date" name="date" required />,
    )

    expect(html).toContain('type="date"')
    expect(html).toContain('name="date"')
    expect(html).toContain('required')
  })
})

describe('Select', () => {
  const options = (
    <>
      <option value="size">Size</option>
      <option value="range">Range</option>
    </>
  )

  it('renders the choices the page gives it', () => {
    const html = renderToStaticMarkup(
      <Select id="sort" label="Sort by">
        {options}
      </Select>,
    )

    expect(html).toContain('<option value="size">Size</option>')
    expect(html).toContain('<option value="range">Range</option>')
  })

  it('hides the browser arrow and outline, as the legacy select did', () => {
    const html = renderToStaticMarkup(
      <Select id="sort" label="Sort by">
        {options}
      </Select>,
    )

    expect(html).toMatch(/<select[^>]*class="[^"]*appearance-none[^"]*"/)
    expect(html).toMatch(/<select[^>]*class="[^"]*outline-hidden[^"]*"/)
  })

  it('names the field it labels', () => {
    const html = renderToStaticMarkup(
      <Select id="sort" label="Sort by">
        {options}
      </Select>,
    )

    expect(html).toContain('for="sort"')
    expect(html).toMatch(/<select[^>]*id="sort"/)
  })
})

describe('Checkbox', () => {
  it('is a real checkbox with its own appearance taken away', () => {
    const html = renderToStaticMarkup(<Checkbox id="consent" />)

    expect(html).toContain('type="checkbox"')
    expect(html).toMatch(/<input[^>]*class="[^"]*appearance-none[^"]*"/)
  })

  it('shows the tick only once the box is checked', () => {
    const html = renderToStaticMarkup(<Checkbox id="consent" />)

    // No state and no script: `peer-checked` is what the legacy box used too.
    expect(html).toMatch(/<svg[^>]*class="[^"]*hidden[^"]*peer-checked:block[^"]*"/)
  })

  it('keeps the tick out of the way of the box it sits on', () => {
    const html = renderToStaticMarkup(<Checkbox id="consent" />)

    expect(html).toMatch(/<svg[^>]*class="[^"]*pointer-events-none[^"]*"/)
  })
})
