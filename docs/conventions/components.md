# Components

How to add a component to this project (issue #49). The decisions behind it are in `docs/adr/0006-styling-and-motion.md` (styling and motion) and `docs/adr/0007-rendering-strategy.md` (server and client).

## Where code goes

| Folder                     | What lives there                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `src/components/ui`        | primitives with no domain knowledge: button, input, checkbox, carousel arrows            |
| `src/components/motion`    | the animation primitives built on `src/lib/motion.ts`: reveal, line, counter             |
| `src/components/icons`     | the ported SVG artwork, one component per legacy file, all sharing `IconProps`           |
| `src/components/cards`     | a card that renders one document of a collection: empty leg, vehicle, yacht (issue #104) |
| `src/components/sections`  | shells shared by several sections: headers, footers, dialogs                             |
| `src/components/providers` | context providers mounted once in the layout                                             |
| `src/blocks/<Block>`       | a Payload block: `config.ts` (field definitions) next to `Component.tsx` (its UI)        |
| `src/lib`                  | pure helpers, no JSX: `cn`, the motion vocabulary, formatting, parsing                   |

One component per file, named after the file (`button.tsx` exports `Button`). A component that is only used by one block lives next to that block, not in `ui`.

Icons are the one generated corner: the legacy SVG files were converted to components once (issue #109, no SVGR in the build), so they are edited like any other component. An icon takes `size` or a class and draws in `currentColor` wherever the legacy file did; the gradient ones carry their own colours. Every id inside an icon is namespaced with its file name, because two icons rendered side by side would otherwise share a gradient.

## Server by default

Components are server components unless they need an event handler, browser state or a browser API. Add `'use client'` to the leaf that needs it, never to a section or page just to reach one interactive child: pass server-rendered children into the client leaf instead. The initial content of every page must be in the HTML the server sends, which `tests/e2e` asserts for each page.

## Styling

- Tokens only. Every colour, radius, breakpoint and one-off size is a token in `@theme` (`src/app/(frontend)/globals.css`); `bg-[#14323d]` and its kind fail the lint rule. When a ported section needs a value the theme does not have, add the token in the same pull request and record it in the ADR table.
- The legacy global rules (`button`, `input`, `.card`, `.container`, the darkening overlays) live in the parity base layer. A component that reproduces one of those reuses the class the layer styles rather than repeating its declarations, so there is a single place to change it. `eslint.config.mjs` lists those class names; that list is the only exception to "every class is a Tailwind utility", and it does not grow without a matching rule in the base layer.
- Variants with `cva`, merged with `cn()` so a caller's class wins:

```tsx
export const buttonVariants = cva('', {
  variants: { size: { default: '', big: 'big', middle: 'middle' } },
  defaultVariants: { size: 'default' },
})

export function Button({ className, size, type = 'button', ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ size }), className)} type={type} {...props} />
}
```

- Export the `cva` function next to the component (`buttonVariants`) so an element that only looks like the component, such as a link, can carry the same classes without wrapping it.
- Repeated class bundles become a component, not an `@apply` rule. `@apply` is allowed only in the parity base layer.

## Props

- The props interface extends the DOM element it renders (`ButtonHTMLAttributes<HTMLButtonElement>`) plus `VariantProps<typeof …Variants>`, and spreads the rest, so callers can pass `aria-*`, `id` and handlers without a new prop each time.
- Booleans read as state (`isVertical`, `once`), not as instructions (`shouldRepeat`).
- Content comes through `children`; text is never hard-coded in a component (ADR-0003).
- A component that renders a landmark or a section takes `data-section="<name>"`, which the visual tier uses to clip that section out of a page screenshot.

## Tests

Every component ships the tiers it touches (`tests/README.md`):

- unit: the variant function returns the expected classes, and any pure logic the component uses (extract it into `src/lib` first, as `src/lib/count-up.ts` does for the counter);
- e2e: what a visitor can do with it, through a page object;
- visual: the section or page that uses it, against the legacy baseline;
- a11y: pages that contain form controls or dialogs.

## Checklist for a new component

1. Read the legacy reference in `docs/legacy-inventory.md` and copy the class list.
2. Map every class: token, parity class, or a new token added in this pull request.
3. Decide server or client, and keep `'use client'` on the leaf.
4. Variants with `cva`, merge with `cn`, export both.
5. Add the tests above, and the component to `/styleguide` when it is a primitive.
6. `bun run lint` must be clean: no unknown class, no arbitrary value, no conflicting classes.
