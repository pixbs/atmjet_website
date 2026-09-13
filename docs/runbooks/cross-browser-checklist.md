# Cross-browser manual checklist

Every automated tier drives Chromium only (`playwright.config.ts`: the `e2e`, `visual` and `a11y` projects all use `channel: 'chromium'`). This checklist is the manual complement — the engines, devices and OS settings CI never opens. Automated coverage is not repeated here: pixel parity lives in the visual tier (issue #38) and the axe rules in the accessibility tier (issue #42).

Run it:

- at the end of each of E6 (global UI), E7 (blocks) and E8 (pages), against the staging deployment;
- once more before the cutover (E12), against the release candidate;
- after any change to the preloader, the dialog, the header or a hero, which are the parts with engine-specific behaviour.

Record the result of every row in [Results log](#results-log). A row that differs from the legacy site is a parity defect unless `docs/legacy-inventory.md` section 13 lists it as `fix-while-porting`; compare against the legacy site while it is still live, not against expectation.

## Targets

| Key       | Engine | Target                                        | Why it is in the matrix                                             |
| --------- | ------ | --------------------------------------------- | ------------------------------------------------------------------- |
| `safari`  | WebKit | Safari on macOS, current                      | `background-attachment: fixed`, `backdrop-filter`, `svh`            |
| `ios`     | WebKit | Safari on iPhone, current iOS                 | video autoplay policy, scroll lock, dynamic toolbar                 |
| `ipad`    | WebKit | Safari on iPad                                | lands in the `md:` range, where most `bg-fixed` classes switch on   |
| `android` | Blink  | Chrome on Android                             | the majority mobile engine; confirms the Chromium tiers on a device |
| `firefox` | Gecko  | Firefox on desktop                            | `backdrop-filter` and `bg-blend-difference` differences             |
| `320`     | any    | 320 px viewport (iPhone SE width, any engine) | the narrowest width the rewrite supports                            |

Run the whole sweep in `en` and repeat rows 1, 2, 8 and 9 in `ru`: Russian strings are longer and break narrow layouts first (`docs/legacy-inventory.md` section 11).

## Checks

### 1. Fixed-attachment backgrounds and parallax

`docs/legacy-inventory.md` section 10.6 lists every usage. WebKit on iOS does not honour `background-attachment: fixed` the way Blink does, so these are the rows most likely to diverge.

- Plain `bg-fixed`, active at every width: the yacht detail hero band (`yachts/[id]/page.tsx:125`), the basic aircraft detail hero (`aircraft/[id]/old.tsx:95`), the Privilege pattern (`privilege.tsx:75`).
- `md:bg-fixed`, active from 768 px, so `ipad` and desktop only: the EmptyLegs Telegram card (`empty_leg.tsx:50`), the two ContactUs gradient cards (`new_contact_us.tsx:34,53`), the footer section (`footer.tsx:15`, no visual effect — the image is a `fill` `<Image>`), the carousel progress bar (`testimonials_carousel.tsx:29`).
- Gold gradients applied to **text** with `md:bg-fixed` (`why_us_card.tsx:28`, `key_features.tsx:18`, `hero_sales.tsx:13,18`): the gradient is anchored to the viewport, so the gold band shifts across the glyphs while the page scrolls.

Check: the background tracks the viewport rather than the section, there is no repaint tearing while scrolling, and gold text keeps its gradient instead of falling back to a flat fill or transparent glyphs.

### 2. Backdrop blur

- Header once scrolled past 50 px (`bg-gray-100 bg-opacity-20 backdrop-blur-xl`, section 3.2).
- Navbar overlay while the menu is open (`backdrop-blur-xl`, section 3.3).
- Cookie modal (`backdrop-blur-sm`, section 3.7) and BookingDialog (`backdrop-blur-sm`, section 3.9).
- AngleBar toggle (`backdrop-blur-2xl` combined with `bg-blend-difference`, section 3.5) — the blend mode is the fragile part on Gecko and older Blink.
- WhyUsCard and PrivilegeCard sticky stacks (`backdrop-blur-lg`, section 5).

Check: the blur renders, text over it stays legible, and there is no white or black flash as the element enters the viewport.

### 3. Hero video autoplay

Legacy markup (section 5, HeroSection): `<video autoPlay muted loop playsInline preload='auto'>` with a relative source `video/background_full.mp4`.

- `ios`: autoplay requires both `muted` and `playsinline`; Low Power Mode suppresses it regardless. With Low Power Mode on, the first frame or poster must still render behind the `hero-darkening` overlay, and the headline must stay readable.
- `android`: plays inline without a tap, no fullscreen takeover, no audio.
- Confirm the video never takes over the viewport and that the relative source resolves under a locale prefix (`/ru/...`), which is where a missing leading slash breaks.
- On cellular, note the transfer size: section 13 item 84 records a 12.8 MB asset, addressed by E11.6.

### 4. Scroll lock behind overlays

Both overlays lock the page by writing to `document.body.style.overflow`: the dialog sets `hidden` while visible (section 3.9) and the header menu toggles `hidden`/`auto`, resetting to `auto` on every pathname change (section 3.2).

- `ios`: confirm the page behind a fixed overlay does not scroll or rubber-band, which `overflow: hidden` alone does not prevent in WebKit.
- Confirm the scroll position is preserved when the overlay closes.
- Open the menu, then open the dialog from inside it, then close one: the `auto` reset must not unlock the page while the other overlay is still open.
- `320`: the cookie modal is `max-h-svh` with an inner `overflow-auto` (section 3.7) — its sticky footer buttons must stay reachable.

### 5. Small-viewport units

`h-svh` drives the three heroes (HeroSection, HeroSalesSection, HeroYachtsSection, section 5) and `max-h-svh` the cookie modal.

- `ios` and `android`: scroll down and back up so the browser toolbar collapses and expands. The hero must not jump, and content must not be clipped behind the toolbar.
- Confirm no double scrollbar and no viewport taller than the screen on first paint.
- `HeroYachtsSection` carries `min-h-[680]` with no unit, which is not a valid arbitrary value and is dropped; the section is sized by `h-svh` alone. Record the legacy rendering before treating any difference as a regression.

### 6. Keyboard navigation

The legacy build attaches `onClick` to non-interactive elements in two places, so the rewrite necessarily changes behaviour here. Note in the log whether the fix moved a visual baseline.

- BookingDialog (section 3.9): the close control is a bare SVG with `onClick`, so it is not focusable, there is no focus trap and Escape does nothing. The rewrite must give the dialog real semantics: focus moves in on open, Tab stays inside, Escape closes, focus returns to the trigger.
- FAQ accordion (section 6, Accordion): the title is a `motion.p` with `onClick`, with no `aria-expanded` and no focusability. The rewrite must expose a button with the expanded state.
- Sweep the rest with Tab only: header and navbar links, LocaleSwitch, cookie banner and modal, carousel arrows and dots, the airport autocomplete, the phone input country dropdown, every form field and submit.

Check: a visible focus ring on every stop, an order that follows the layout, Enter and Space both activating controls, and no focus stranded on a hidden element behind a closed overlay.

### 7. Reduced motion

ADR-0006 wraps the frontend in `MotionConfig reducedMotion="user"`, and `Counter` shows its final label at once. The visual tier forces reduced motion through Playwright, so this row exercises the OS setting path instead.

Enable Reduce Motion (macOS Accessibility, iOS Accessibility, Android "Remove animations"), then check:

- reveal animations do not translate or fade in; content is present at first paint;
- counters read their final value rather than counting;
- the `Line` separator is drawn at full width;
- carousels remain operable and the preloader (section 3.8) still completes rather than trapping the page.

### 8. 320 px width

Resize to 320 px, or use an iPhone SE profile, and walk the 13 static routes of section 2.1 plus one aircraft detail and one yacht detail.

- No horizontal scrolling anywhere, and no element wider than the viewport.
- The navbar's two halves (section 3.3) stack rather than overlap.
- The airport autocomplete dropdown is `w-80`, which is exactly 320 px, so at this width it overflows the container padding (section 6, AutoComplete). Confirm it is clamped in the rewrite.
- Long Russian labels wrap instead of clipping; the phone input keeps its country dropdown usable.

### 9. Locale and layout sweep

With the sweep repeated in `ru`: confirm the locale switch preserves the current route, `hreflang` and `lang` are correct, and no string overflows its card. `/citizens` is Russian only (section 4).

## Results log

Copy this table into the pull request or the cutover record, one block per run.

| Run                    | Date | Build / commit | Tester |
| ---------------------- | ---- | -------------- | ------ |
| E6 / E7 / E8 / cutover |      |                |        |

| #   | Check                | safari | ios | ipad | android | firefox | 320 | Notes |
| --- | -------------------- | ------ | --- | ---- | ------- | ------- | --- | ----- |
| 1   | Fixed backgrounds    |        |     |      |         |         |     |       |
| 2   | Backdrop blur        |        |     |      |         |         |     |       |
| 3   | Hero video autoplay  |        |     |      |         |         |     |       |
| 4   | Scroll lock          |        |     |      |         |         |     |       |
| 5   | Small-viewport units |        |     |      |         |         |     |       |
| 6   | Keyboard navigation  |        |     |      |         |         |     |       |
| 7   | Reduced motion       |        |     |      |         |         |     |       |
| 8   | 320 px width         |        |     |      |         |         |     |       |
| 9   | Locale sweep         |        |     |      |         |         |     |       |

Use `pass`, `fail #<issue>` or `n/a`. Every `fail` opens an issue that references this checklist and the inventory anchor, and a parity defect blocks the epic it was found in.
