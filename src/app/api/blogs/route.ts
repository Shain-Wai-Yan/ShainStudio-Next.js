import { publicCacheHeaders } from '@/lib/server/public-cache';
import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/server/blog-data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await getBlogPosts(request.nextUrl.searchParams), {
      headers: request.nextUrl.searchParams.has('search') ? { 'Cache-Control': 'private, no-store' } : publicCacheHeaders(),
    });
  } catch (error) {
    console.error('[blogs]', error);
    return NextResponse.json({ posts: [], error: 'CMS unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
