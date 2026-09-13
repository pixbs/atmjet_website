# Localized content in Payload

How a field becomes translatable, what an empty translation renders, and where the locale list lives. The decision behind it is ADR-0003; the routing side is `src/i18n/routing.ts`.

## One list, three consumers

`src/i18n/locales.ts` is the only place a locale is declared:

| Export               | Value                  | Read by                                                         |
| -------------------- | ---------------------- | --------------------------------------------------------------- |
| `ALL_LOCALES`        | `en`, `ru`, `uk`       | the `Locale` type                                               |
| `LOCALE_DEFINITIONS` | code, label, direction | `localization.locales` in `src/payload.config.ts`, the switcher |
| `ROUTED_LOCALES`     | `en`, `ru`             | `src/i18n/routing.ts`, so only public locales get a URL         |
| `DEFAULT_LOCALE`     | `en`                   | both of the above                                               |

The module imports nothing from Next or Payload, because the Payload config, the next-intl routing and the Vitest suites all load it and only the last runs outside Next. A unit test asserts the Payload config and the list agree, so the admin selector cannot drift from the public URLs.

Adding a locale means adding one entry to `LOCALE_DEFINITIONS`, a catalogue under `src/messages/`, an admin translation in `i18n.supportedLanguages`, and a migration. Making it public is a separate step: it joins `ROUTED_LOCALES` (issue #53 moves that decision into `SiteSettings.enabledLocales`).

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
