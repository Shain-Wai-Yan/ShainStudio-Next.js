# Saved editorial preview — Phase 4

Strapi supplies signed saved-entry previews at `/editor-preview?ticket=…`. The
dedicated dynamic route now uses the same page views as published blogs, coding
and marketing projects, artwork, photography, and certificates. Plans use the
existing document-list clients with the selected draft overlaid onto the published
collection. Existing public routes retain their normal loaders and ISR settings.

The preview uses the website header, footer, fonts, themes, rich-text renderer,
galleries, and published related content. A small dismissible overlay identifies
the saved preview and offers refresh. It does not load analytics. Navigation
leaves preview for published pages; the header language switch does the same.
Open each draft locale from Strapi to preview an unpublished translation.

Save changes first, then click Strapi's **Open preview**, or the bilingual panel's
preview action. Strapi embeds this frontend in its standard desktop/mobile Preview
UI; it does not store a second website theme. Changes are saved previews, without
keystroke live sync. An incomplete document can require its mandatory media before
its website view can render. Categories, tags, and project types label other
entries and have no standalone public page.

The frontend forwards a five-minute signed ticket to Strapi's dedicated preview
channel in the `x-portfolio-preview` header, with `cache: no-store`, a bounded
timeout and redirects disabled. It never attaches the published Content API
credential. Strapi verifies signature, identity/locale/status/expiry and fresh
admin/document/field permissions. Missing, invalid or expired access displays an
unavailable message without draft content. Reopen the preview from Strapi.

Set `EDITORIAL_PREVIEW_ENABLED=true` to require the Admin origin configuration during
production builds. Invalid origins now fail with an explicit configuration error.
An unconfigured optional preview keeps the restrictive same-origin policy.

Configure `EDITORIAL_ADMIN_ORIGIN` to the exact Admin origin allowed to embed this
page. The local frontend launcher uses `http://127.0.0.1:1338`. HTTPS or explicit
loopback HTTP origins are accepted. The preview page alone omits SAMEORIGIN and
uses that origin in CSP frame-ancestors. Ordinary public routes keep their normal
security headers. Preview links have no-referrer, noindex/nofollow/noarchive and
private/no-store responses; the preview layout omits analytics and public SEO.

Published and preview routes share presentation components. No public cache tag,
ISR rule, sitemap, or clients availability contract was changed for this preview. Draft data stays in the isolated
preview channel, including when both public language homepages are warm.

Verification:

```
rtk proxy npm test
rtk proxy npm run typecheck
rtk proxy npm run lint
rtk proxy node scripts/editorial-preview.mjs
```

The last script builds and starts real Next.js in production mode with a
controllable loopback CMS, verifies English/Chinese preview rendering and rejected
tickets, safe HTML, no private published token in output, response/frame headers,
and absence of draft-channel reads/data on both public homepages. Evidence is
ignored in `.next-editorial-test-results/`. Production rollout is not authorized.

## Shared website view verification

Local verification for this revision: `npm test` (54 passed), `npm run typecheck`,
`npm run lint` (no warnings), and `node scripts/editorial-preview.mjs` (a real
production build/start with English/Chinese previews, unsafe-markup omission,
rejected access, private/no-store/frame headers and public-cache isolation). The
production check uses a loopback mock CMS and never calls a translation provider.

Browser checks against the real disposable Strapi snapshot rendered all eight
website content types, both Chinese themes at desktop/mobile widths, and the
native embedded Strapi Preview. A native published-version preview was compared
with its actual public article: article markup, hero image URL, and heading
font/size/weight/color matched. These are local checks, not a claim of production
deployment verification. Backend receipts are in
`artifacts/bilingual-phase4/website-preview-result.json` and `parity-result.json`.
