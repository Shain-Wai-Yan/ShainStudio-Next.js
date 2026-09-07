import { NextRequest, NextResponse } from 'next/server';
import { getPhotography } from '@/lib/server/photography-data';
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getPhotography(request.nextUrl.searchParams), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ photos: [], total: 0, pageCount: 0, error: 'Photography is temporarily unavailable.' }, { status: 502 });
  }
}
