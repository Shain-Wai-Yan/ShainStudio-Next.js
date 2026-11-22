# Public response caching and CPU

Vercel's 4-hour Hobby Active CPU allowance is shared by the team. Historical
route-level CPU data was unavailable when this change was made, so no route is
identified as the cause and no amount of savings is assumed.

## Route audit

- Shared CDN cache (successful responses only): sitemap, blog list and detail,
  coding-project and marketing-in-motion list/detail, business and marketing
  plans, and photography collections. Blog requests with a `search` parameter
  remain private. The full URL, including query parameters, must remain part of
  the CDN cache key.
- Not newly shared: photography feed/search (seed and search variants), art
  (filtered/paginated), GitHub (many repository and file variants), and YouTube
  (its existing cache policy is unchanged).
- Never shared: analytics-region (depends on location), health, signed preview,
  and the authenticated revalidation webhook. Error responses are not shared.

The sitemap runs only on requests, retains published-language and image
metadata, and returns 503 with `no-store` if generation fails. On a cache miss
it reads only the two indexing snapshots needed per CMS collection, one per
language, and merges their publication state once. Its successful
response and selected API responses use `Vercel-CDN-Cache-Control` for 60
seconds; browsers revalidate instead of maintaining a separate long-lived cache.
Published CMS snapshots retain their existing refresh intervals (typically five
minutes, and up to an hour for some content). Authenticated CMS webhooks
invalidate snapshot tags, but do **not** purge a CDN response. A warmed
CDN response can therefore remain for its full 60-second TTL after a webhook.
A missed webhook, Next.js stale-while-revalidate behavior, or a failed CMS
refresh can retain older data, so five minutes is an operational target for a
working webhook and healthy CMS, not a hard bound. Existing page ISR has its own revalidation behavior.

## Validation after Vercel restores the account

1. Request each selected URL twice and inspect `x-vercel-cache` and `Age`; repeat
   with different locale and query values to check isolation. Inspect sitemap
   `Server-Timing` for generation time on a cache miss. A CDN hit does not run
   application code, so application-side logs cannot count those hits.
2. Warm caches, publish and unpublish known English and Chinese test content,
   and record the delay until APIs, pages and sitemap each change. Include a
   missed webhook and an unavailable CMS. Do not call the target a hard maximum
   without observing Vercel's actual behavior.
3. In Vercel's available observability dashboard, compare requests, cache hits,
   function invocation counts, per-route active CPU where available, and CPU
   over time. Hobby retention and the account suspension limit historical data.
   Avoid adding per-request logging solely to count cached requests.
4. Profile expensive uncached search/gallery and bilingual transformations with
   representative real data before changing their semantics. This change does
   not claim a measured per-route CPU improvement or eliminate the possibility
   of exceeding the free allowance under high traffic.
