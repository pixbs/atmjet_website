# Localized content in Payload

How a field becomes translatable, what an empty translation renders, and where the locale list lives. The decision behind it is ADR-0003; the routing side is `src/i18n/routing.ts`.

## One list, three consumers

`src/i18n/locales.ts` is the only place a locale is declared:

| Export               | Value                  | Read by                                                                                     |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| `ALL_LOCALES`        | `en`, `ru`, `uk`       | the `Locale` type                                                                           |
| `LOCALE_DEFINITIONS` | code, label, direction | `localization.locales` in `src/payload.config.ts`, the switcher                             |
| `DEFAULT_LOCALES`    | `en`, `ru`             | the `SiteSettings.enabledLocales` default and the fallback when the database is unreachable |
| `DEFAULT_LOCALE`     | `en`                   | all of the above                                                                            |

The module imports nothing from Next or Payload, because the Payload config, the next-intl routing and the Vitest suites all load it and only the last runs outside Next. A unit test asserts the Payload config and the list agree, so the admin selector cannot drift from the public URLs.

Adding a locale means adding one entry to `LOCALE_DEFINITIONS`, a catalogue under `src/messages/`, an admin translation in `i18n.supportedLanguages`, and a migration. Making it public is a separate step, and not a code change at all: an administrator ticks it in `SiteSettings.enabledLocales` (issue #53).

## Which locales the site serves

`src/lib/data/site-settings.ts` reads that setting, and everything that turns a locale into a URL goes through it:

| Consumer                                  | Effect                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `src/proxy.ts`                            | routes and detects only enabled locales; a disabled prefix ends in a 404 |
| `generateStaticParams` (layout and pages) | prerenders the enabled locales only                                      |
| `[locale]/layout.tsx`                     | 404s a request that reaches the route with a disabled locale             |

The proxy holds the setting for a minute rather than reading it per request, so enabling a language takes effect within that minute and without a deploy. English is always in the list, whatever is saved: a site that serves no language has no home page to redirect to. A build that cannot reach the database serves `DEFAULT_LOCALES` rather than failing.

## Fallback

`localization.fallback` is `true` and the fallback target is `DEFAULT_LOCALE`, so:

- reading a document in `ru` returns the English value for any field whose Russian translation is empty;
- the value is **not** copied into the document, so filling the Russian field later changes nothing else;
- the admin marks a field that is showing the fallback, so an editor can tell a translation apart from an inherited value;
- a field that must never inherit needs an explicit empty-string check at the point of use, not a config change.

This means a page is never blank in a locale that has not been translated yet, which is what makes `uk` safe to enter ahead of launch.

## Which fields are localized

Localize anything a visitor reads and a translator would rewrite: headings, body copy, button labels, image `alt`, SEO title and description, slugs only when the URL itself differs per locale (it does not on this site, see ADR-0003).

Do not localize identifiers, relationships, media uploads, numbers, dates, prices, or anything derived from the legacy data. `Media.alt` is localized; the file behind it is not.

```ts
{
  name: 'alt',
  type: 'text',
  required: true,
  localized: true,
}
```

Inside `array` and `blocks` fields, mark the leaf fields rather than the container: localizing the container makes every locale keep its own row order, which breaks parity with the legacy layout.

## Generated types

`localized: true` does not change the generated TypeScript type: `bun run generate:types` still emits `alt: string`, because the Local API resolves one locale per request. Code therefore reads a localized field exactly like a plain one, and the locale comes from the request (`locale` on the Local API call, the URL segment on the frontend).

The exception is `locale: 'all'`, which returns `{ en: string; ru: string; uk: string }` at runtime while the generated type still says `string`. Only the migration and reconciliation scripts pass it, and they narrow the value themselves.

After changing any localized field run `bun run generate:types` and `bun run migrate:create <name>` and commit both (AGENTS.md section 2).
