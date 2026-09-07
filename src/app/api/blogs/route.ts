import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/server/blog-data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getBlogPosts(request.nextUrl.searchParams), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('[blogs]', error);
    return NextResponse.json({ posts: [], error: 'CMS unavailable' }, { status: 502 });
  }
}
