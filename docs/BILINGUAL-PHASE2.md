# Phase 2 local review — bilingual content foundation

Status: implemented on the local `feat/bilingual-phase2-local` branches. Nothing
has been pushed, deployed, migrated in a working database, or sent to Azure.
This is a Phase 2 review, not approval to start Phase 3 or to release production.

## Behavior

Native Strapi localization covers 11 content types. Website `en` maps to CMS
`en`; website `zh` maps to the existing CMS `zh-CN`. Clients and Tools remain
shared. WOWS remains excluded. The source schemas specify each localized text
field; dates, files, URLs and flags stay shared. Chinese versions keep the English
slug and document identity. Use the Content Manager's locale switch on an
existing English document to save a Chinese version. Independent Chinese creates
and clones are rejected to prevent orphan documents.

Chinese text and SEO remain drafts until explicitly published by an editor.
Draft Chinese edits do not replace published text. All 11 Content API routers expose
only collection/detail reads and force published status, including explicit
`status=draft` requests; separate Admin routes retain draft editing. English and Chinese can be
published or unpublished independently. Chinese publication uses published
English assets where available and retains unpublished English asset edits.
Taxonomy relations preserve source identities; the frontend resolves published
Chinese taxonomy labels by document ID, retaining English labels when needed.

The frontend reads every API page into separate tagged locale snapshots. It
merges published translations by document ID before filtering/pagination. The
Chinese site shows labelled English content when no Chinese publication exists;
fallback detail pages use noindex and the English canonical. Published Chinese
versions receive their own canonical and reciprocal hreflang. Sitemap generation
includes actual published Chinese versions, not fallback duplicates, and retrieves
all pages, including photography beyond the first 100 records.

Publication webhooks authenticate and invalidate the specific collection/locale
tag. Draft writes and draft-only deletions are ignored. Exact model matching
prevents WOWS events from invalidating the portfolio blog. Taxonomy publication
also invalidates consumers in that locale. English rendered metadata can refresh
for reciprocal hreflang while its body data cache remains intact. Public API
adapters use `private, no-store` so an independent CDN cache cannot outlive the
aggregate invalidation. Browser URLs include the requested language.

The existing Clients availability contract is preserved: 300-second aggregate,
`revalidateTag('clients', 'max')`, stale data during failed refreshes, no hard
homepage path invalidation, no deployment outbox entries. Other collections retain
their existing publication/deployment workflow. Open browser tabs are not pushed
content updates. A webhook acknowledges invalidation, not completed rendering.

## Snapshot and rollback

The November 1 backup is kept privately in the backend's ignored
`artifacts/backups/` directory. SHA256:
`90b6037aa2dc56e79d9acd1b7b70ac0908e6cb0dc5eb30c47cb52420cd683a72`.
The rehearsal assigns 669 null-locale rows to English, creates no Chinese records,
publishes nothing, and changes zero rows when repeated. All pre-existing content,
IDs, media and relationships remain unchanged apart from the intended locale.
The actual native Strapi startup is fingerprint-checked against restored content
and media. All 209 published photographs remain retrievable.

The runner uses a separate UTF-8 PostgreSQL cluster, explicit loopback URLs,
empty environment files, fresh local secrets and local Admin credentials. It
removes webhook definitions from the disposable copy before starting Strapi.
It subsequently restores the original database and checks every original public
table fingerprint. It always stops and removes the disposable cluster.
The backend branch deliberately refuses remote/unapproved database startup.

**Rollback needs both database and matching application versions.** Disabling
Strapi localization can delete non-default-language rows. Never use a Git revert
alone after Chinese versions have been created.

## Commands and evidence

Run with Node 24.22.1/npm 11 and PostgreSQL 17 tools available in PATH. The shell
commands used the required `rtk` prefix. Frontend checks:

```
rtk proxy npm test
rtk proxy npm run typecheck
rtk proxy npm run lint
rtk proxy npm run audit
rtk proxy node scripts/clients-cache.mjs
```

The cache harness executes a real `next build` and `next start` against a loopback
mock CMS with fake credentials. It tests both `/` and `/zh`, cold failure, complete
pagination, failed page refresh, drafts, authenticated events, empty collections,
server-token exclusion, Chinese detail/list/sitemap/hreflang transitions and
retention of English body snapshots. It also waits 305 seconds for a real
client-cache timed outage test. A final `--skip-timed` run can recheck later source
changes without repeating the already verified five-minute interval.

Backend commands (in its own repository):

```
rtk proxy yarn test
rtk proxy yarn typecheck
rtk proxy python3 artifacts/run-clients-check.py test:clients test:outbox
rtk proxy env PHASE2_FRONTEND_ROOT="/absolute/frontend/path" python3 tests/run-bilingual.py artifacts/backups/daily_strapi-2026-11-01_0603.dump
rtk proxy env BILINGUAL_LOCAL_DB_APPROVED=true DATABASE_URL=postgresql://test:test@127.0.0.1:59999/portfolio_phase2_build NODE_ENV=development ENV_PATH=/dev/null yarn build
```

The backend build uses a deliberately nonexistent loopback database and does not
start the CMS. For the audit, captured `yarn audit --json` into an ignored report,
then ran `node scripts/check-dependency-audit.cjs <report>`.

Actual current results and remaining exceptions are recorded in the final handoff
below. Private migration evidence is in backend `artifacts/bilingual-phase2/`;
production-mode logs and browser screenshots are in frontend
`.next-clients-test-results/`. These private artifacts are ignored by Git.

## Review limits

No real Azure translation, costs, jobs, glossary, usage ledger or editorial preview
controls are implemented; those belong to later phases. Chinese test content is
non-sensitive fixture text, not a quality-reviewed translation of the portfolio.
No production webhook/CDN configuration, primary/standby rollout or real hosting
behavior has been verified. The underlying dependency exception lists still need
release review: backend audit has 11 reviewed advisories, including two high
severity advisories; frontend has one reviewed development-only minimatch
advisory (15 dependency/meta entries), expiring November 7. No dependencies were
added or upgraded in this phase.

Browser checks sampled Chinese project detail/list and the homepage in Chromium
at 1440×1000/light and 390×844/dark with reduced motion. Offsite browser requests
were blocked. No uncaught page errors or horizontal overflow occurred. These
checks do not constitute exhaustive visual or cross-browser coverage.

## Final local verification results — November 1, 2026

| Check | Actual result |
| --- | --- |
| Frontend `npm test` | 54 passed, 0 failed, 0 skipped |
| Frontend typecheck and lint | Passed; lint has 0 warnings |
| Real frontend production build/start | Passed twice against loopback mock CMS |
| Authenticated publication and locale cache checks | Passed both publication and reverse unpublication, including detail/list/sitemap/hreflang; English body snapshot read count unchanged |
| Real 305-second Clients TTL outage | Passed: warm logos retained on both public homepages |
| Frontend dependency policy | Passed with the existing reviewed development-only exception |
| Backend `yarn test:unit` | 53 passed, 0 failed, 0 skipped |
| Backend `yarn test` | Passed, including 16 local Worker tests; its optional database test skipped without a URL and was separately executed below |
| Real client/Admin/import regression | Passed on a separate disposable PostgreSQL database, including two duplicate-free import runs |
| Real deployment outbox test | Passed on disposable PostgreSQL, no skip |
| Snapshot bilingual integration | Passed; native Admin save, publication isolation, original content/media/component/relation fingerprints, all 11 frontend API contracts, 209 photographs, read-only token mutations denied |
| Migration apply/repeat | 669 locale assignments; 0 on repeat; no generated Chinese records or automatic publications |
| Rollback | 75 original public table fingerprints restored exactly |
| Backend typecheck/build | Passed; build logged a nonfatal unavailable `ioreg` environment probe |
| Backend dependency policy | Passed with 11 existing reviewed advisories; release review remains necessary |
| Browser sampling | 6 page/viewport scenarios passed, no uncaught page errors or horizontal overflow |
| Both `git diff --check` | Passed |

The isolated integration CMS warns that its disposable admin encryption key is
missing; it uses generated test secrets and is destroyed afterward. Production
secrets were not read into these instances or altered. Initial local harness
failures (UTF-8 initialization, driver parser comparison and fixtures expecting
retired slug-prefix filtering/path invalidation) were corrected and the affected
checks rerun. No failed check is being treated as a pass.

Neither branch is committed or pushed. Changes are available for local diff
review. Test servers and disposable PostgreSQL clusters have been stopped.
The approval gate remains in place before Phase 3 and before any production work.
