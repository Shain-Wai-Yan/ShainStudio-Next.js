import { NextRequest, NextResponse } from 'next/server';
import { getPhotography } from '@/lib/server/photography-data';
export async function GET(request: NextRequest) {
  const started = performance.now();
  try {
    const data = await getPhotography(request.nextUrl.searchParams);
    const isSearch = Boolean(request.nextUrl.searchParams.get('search')?.trim());
    const duration = Math.round(performance.now() - started);
    if (duration > 1000) console.warn(`[Photography API] Slow ${isSearch ? 'search' : 'feed'} request: ${duration}ms`);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': isSearch ? 'private, no-store' : 'public, s-maxage=300, stale-while-revalidate=600',
        'Server-Timing': `photography;dur=${duration}`,
      },
    });
  } catch {
    return NextResponse.json({ photos: [], total: 0, pageCount: 0, error: 'Photography is temporarily unavailable.' }, { status: 502 });
  }
}
