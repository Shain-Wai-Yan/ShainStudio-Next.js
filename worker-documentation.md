# Enterprise Strapi Failover Worker (v5.2.0)

This document provides a comprehensive overview of the Enterprise Cloudflare Worker Architecture designed to seamlessly route traffic between Primary and Backup Strapi CMS instances. It ensures zero-downtime content delivery, sub-second failovers, zero-latency caching, and hardened edge security.

## 🚀 High-Level Architecture

At its core, the worker sits immediately in front of all HTTP requests destined for your Strapi CMS. When a browser or client requests data, the request hits the Cloudflare Edge network closest to them.

1. **Edge Pre-flight (Fast Path)**: Automatically handles CORS and Rate Limiting instantly.
2. **Zero-Latency Cache Check**: Looks up the requested endpoint in the Cloudflare Cache. If a slightly stale version exists, it serves it immediately to the user while silently kicking off a background refresh (`Stale-While-Revalidate`).
3. **KV Circuit Breaker Check**: Checks if the global network has marked the Primary Server as dead.
4. **Origin Proxy**: If the cache is empty or expired, the worker confidently fetches from the Primary. If this fetch fails consecutive times, the global circuit is tripped, and all subsequent requests are routed to the Backup rendering instance. 

---

## 💎 Core Features

### 1. Global KV Circuit Breaker
Unlike standard workers which isolate failure state to their single geographic data center, this worker utilizes **Cloudflare KV (`FAILOVER_KV`)**. When one region (e.g., London) detects the primary server has died, it writes `"circuit_broken": true` to the global KV store. Instantly, all other regions worldwide sync their local states to Backup Mode, ensuring no other user experiences a failed server load.
* It auto-heals: When a background fetch eventually succeeds against the Primary, the key is gracefully deleted, synchronizing all isolates back to normal operation. 

### 2. Stale-While-Revalidate Edge Caching (SWR)
Provides absolute optimal performance. When caching is enabled, if a user requests data that has hit its TTL (expired), the worker does *not* slow down their request to fetch fresh data. Instead, it serves the expired cache immediately (Zero-Latency) and utilizes `ctx.waitUntil()` to asynchronously update the cache behind the scenes.

### 3. Edge CORS Preflight Termination
Browsers frequently send heavily repetitive `OPTIONS` requests before making actual API calls. To save massive latency and Strapi database load, the worker intercepts these requests and responds with `204 No Content` instantly at the very edge of the network.

### 4. Native Cloudflare Edge Compression
By stripping conflicting `Accept-Encoding` metadata overrides, the worker perfectly delegates Brotli and Gzip compression optimizations directly to Cloudflare’s CDN native proxy engines without breaking browser decoding locks.

### 5. Automated Health/Webhook Observability
Fully integrated tracking for server downtime and Discord webhooks seamlessly sent in the background upon status transitions (Primary Failure detected, Global Circuit Tripped, Backup Mode recovery). 

---

## ⚙️ Function Breakdown

### `export default { fetch }` (Entry Point)
The ES Modules handler wrapper. Catches execution errors preventing obscure 500s.

### `handleRequest()` (Main Router)
Orchestrates the lifecycle of the request:
1. Validates Methods (`validateRequest`).
2. Edge rate limiting (`applyRateLimit`).
3. Intercepts `/api/health` queries.
4. Processes Administrative bypass (`isAdminOnlyEndpoint`). 
5. Runs `checkStaleWhileRevalidateCache()` for eligible GET routes.
6. Determines routing destiny (`shouldUseBackupMode`) and calls `routeToBackup` or `handlePrimaryFirst`.

### `shouldUseBackupMode()` (State Synchronizer)
1. Checks local fast-memory isolate limits.
2. Interrogates the global `FAILOVER_KV` binding. 
3. Synchronizes KV truth down into local memory to prevent unnecessary KV reads on subsequent identical requests.

### `handlePrimaryFirst()` & `routeToBackup()` 
Executes requests to the target origin using the `fetchWithRetry` network helper. Responsible for recording failure timestamps, kicking off Webhook notifications, interacting with caching endpoints, and assigning custom operational headers (`X-Served-By: backup`).

### `withSecurityHeaders()`
A pure response transformer wrapped universally outside the router. Uses a body-lock guard (`try...catch`) to safely override headers, injecting hardened flags like `Strict-Transport-Security`, `X-XSS-Protection`, and `X-Content-Type-Options: nosniff`. 

---

## 🛠️ Configuration variables

Modify the defaults within the code or supply Environment Variables via the Cloudflare dashboard:

- `PRIMARY_STRAPI`: URL to your active, main CMS.
- `BACKUP_STRAPI`: URL to your fallback, secondary CMS.
- `FAILOVER_KV`: (Required Binding) Key-Value namespace used by the circuit breaker.
- `WEBHOOK_URL`: Discord/Slack Webhook URL for server status alerts. 

### Fine-Tuning Constants
- `TIMEOUT_MS`: (15000) Maximum wait to give rendering Cold-starts grace.
- `FAILOVER_CONFIG.maxConsecutiveFailures`: Number of absolute sequential misses before throwing the switch.
- `CACHE_CONFIG.swrTtl`: Max lifespan window of a broken/stale cache before it actively denies serving a user (default 24h).

---

## 🚦 Route Protections

| Endpoint Target | Cache Handling | Backup Support |
| --- | --- | --- |
| `/api/business-plans` | ✅ Cached + SWR | ✅ Permitted |
| `/api/blogs` | ✅ Cached + SWR | ✅ Permitted |
| `/admin/*` | ❌ Bypassed | ❌ Blocked (Primary Only) |
| `/api/upload` | ❌ Bypassed | ❌ Blocked (Primary Only) |
| `POST`/`PUT`/`DELETE` | ❌ Bypassed | ❌ (Blocked gracefully if Backup is active) |

*(Note: Write mutations to your database are intentionally killed with a `503 Service Unavailable` if the Primary is down to avoid data fragmentation across your two independent CMS nodes. Login endpoints `/api/auth` are safely excluded from this).*
