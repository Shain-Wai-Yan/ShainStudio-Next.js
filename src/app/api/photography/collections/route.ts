import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/server/photography-data';

export async function GET(request: NextRequest) {
  try {
    const language = request.nextUrl.searchParams.get('language') === 'zh' ? 'zh' : 'en';
    const collections = await repository.getCollections(language);
    return NextResponse.json({ collections }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ collections: [] }, { status: 502 });
  }
}
