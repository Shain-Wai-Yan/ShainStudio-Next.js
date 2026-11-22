import sitemap from '@/lib/server/sitemap';
import { publicCacheHeaders } from '@/lib/server/public-cache';
import { renderSitemap } from '@/lib/server/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = performance.now();
  try {
    const xml = renderSitemap(await sitemap());
    return new Response(xml, { headers: { ...publicCacheHeaders(), 'Content-Type': 'application/xml; charset=utf-8', 'Server-Timing': `sitemap;dur=${Math.round(performance.now() - started)}` } });
  } catch (error) {
    console.error('[sitemap] Generation failed:', error);
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
