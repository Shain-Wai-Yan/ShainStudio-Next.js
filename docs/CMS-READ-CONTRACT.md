# Headless CMS read contract

`src/lib/strapi/content-contract.ts` defines the approved collections, public
population fields and SEO component presence. The same map drives published
reads, localized collection selection and webhook model resolution. The CMS's
native integration compares its entries with actual schemas when
`PHASE2_FRONTEND_ROOT` points to this workspace.

The public client permits GET only, explicit collection/document paths, published
status and `en`/`zh-CN` content locales. It rejects arbitrary paths and redirects
before private headers can be forwarded, and bounds JSON responses. Client-side
code must call the website API routes. Signed saved-entry preview is a separate
no-store transport, not an option on the public reader.

Use the server-only `STRAPI_API_URL` override when appropriate; it must identify
the established API/proxy path with the existing origin protection. Do not point
it at an origin that requires an authentication header the frontend does not
provide. Public media still uses `NEXT_PUBLIC_STRAPI_URL`/the public API origin,
so a separately configured server API hostname does not leak into relative image
URLs. Keep tokens in server secret variables, never `NEXT_PUBLIC_*` or
`next.config.env`. `.env.example` contains names and safe defaults only.

Wildcard population is expanded through the contract. Reverse taxonomy
collections and unrelated WOWS data are not included. Narrow listing indexes,
page-scoped bodies, conservative size limits and locale cache tags remain in
force. The frontend stays a consumer; translation, budgets and editorial
approval belong in Strapi.

`/api/health` is a cheap no-store liveness endpoint. It does not query Strapi or
certify database/content readiness. CI's production preview and cache-isolation
checks complement unit tests and the CMS's native integration.
