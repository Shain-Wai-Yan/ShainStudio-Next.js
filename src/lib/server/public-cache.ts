import 'server-only';

// Browser requests revalidate normally; only Vercel's shared CDN caches the
// response. Publishing webhooks invalidate the CMS snapshot independently.
export function publicCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
  };
}
