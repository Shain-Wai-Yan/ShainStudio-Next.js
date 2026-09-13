import { NextRequest, NextResponse } from 'next/server';
import { getArtPieces, getArtPieceBySlug } from '@/lib/server/art-data';
import { boundedInteger } from '@/lib/utils/pagination';

export async function GET(request: NextRequest) {
  const started = performance.now();
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      const piece = await getArtPieceBySlug(slug);
      if (!piece) {
        return NextResponse.json({ error: 'Art piece not found' }, { status: 404 });
      }
      return NextResponse.json(piece, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Server-Timing': `art;dur=${Math.round(performance.now() - started)}`,
        },
      });
    }

    const rawPage = searchParams.get('page');
    const rawPageSize = searchParams.get('pageSize');
    const page = boundedInteger(rawPage, 1, 10_000);
    const pageSize = boundedInteger(rawPageSize, 50, 100);
    if ((rawPage && String(page) !== rawPage) || (rawPageSize && String(pageSize) !== rawPageSize)) {
      return NextResponse.json(
        { error: 'page and pageSize must be positive integers within the supported range' },
        { status: 400, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    const featured = searchParams.get('featured') === 'true';

    const data = await getArtPieces({ page, pageSize, featured });
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Server-Timing': `art;dur=${Math.round(performance.now() - started)}`,
      },
    });
  } catch (error) {
    console.error('[Art API] Error handling request:', error);
    return NextResponse.json(
      { arts: [], total: 0, pageCount: 0, error: 'Art collection is temporarily unavailable.' },
      { status: 502 }
    );
  }
}
