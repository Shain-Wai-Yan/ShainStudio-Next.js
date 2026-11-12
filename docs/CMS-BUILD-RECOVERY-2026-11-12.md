# CMS build and outage recovery — November 12, 2026

The sitemap now waits for an incoming request before loading published CMS data.
A failed CMS connection therefore no longer aborts the deployment build. Sitemap
requests still fail on unavailable/incomplete data, rather than publishing an
empty or partial sitemap. Existing locale snapshot caching and publication tags
are retained. The sitemap response itself is now generated at request time.

A broader cold-outage test exposed a second issue: the coding-project listing
could be prerendered as an empty collection during an outage and remain stale
after Chinese publication. That listing now uses on-demand ISR, and failed data
reads throw instead of being cached as a successful empty collection. Successful
empty collections remain valid. The normal published data cache is retained.

## Network findings

From this machine, the custom API and website domains resolve to the expected
Cloudflare addresses (also confirmed through Google DNS), but both TCP/TLS
connections time out. Node and curl reproduce the failure. Google and the npm
registry are reachable. The verified Northflank origin health endpoint responds
200, and the direct Vercel website, API and sitemap endpoints respond 200.
Unauthenticated origin content reads still return 403, as intended.

These observations distinguish local custom-domain reachability from a crashed
CMS origin. No DNS, WAF, origin authentication, cloud resource, quota or billing
configuration was changed. The local network path itself has not been repaired
by changing application code.

## Verification

- 64 frontend unit tests pass, including deferred sitemap reads, locale links,
  and refusal to publish a partial sitemap on a failed CMS response.
- Lint and TypeScript checks pass.
- Production-mode fixture checks pass build-time outage, honest runtime errors,
  recovery, Chinese publication/unpublication, reciprocal hreflang and English
  cache isolation. The real five-minute expiry check also passed: a failed
  time-based refresh retained the last valid aggregate, then genuine empty
  publication removed the client strip correctly. No token leaked into browser
  JavaScript or rendered HTML.
- The final normal production build passed after the fixture server stopped,
  replacing mock build output with the normal configuration. Existing fallback
  pages still logged CMS timeout warnings because the local custom-domain
  network path remains unavailable; a build pass is not proof of end-to-end
  content availability from this machine.

This change touches application code and regression tests only. Strapi dependency
forks and the Router 7 override remain reverted; package manifests and lockfiles
match the pre-fork release candidates. The seven advisory fixes are deferred as
requested, without changing the audit policy or creating new exceptions.

No production deployment or production data migration was performed. Raw receipts
and a focused review patch are in `artifacts/cms-build-fix-2026-11-12/`.
