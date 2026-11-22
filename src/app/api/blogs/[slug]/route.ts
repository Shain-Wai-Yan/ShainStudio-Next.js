import { publicCacheHeaders } from '@/lib/server/public-cache';
import { NextRequest, NextResponse } from 'next/server';
import { getBlogPost } from '@/lib/server/blog-data';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const post = await getBlogPost(slug, request.nextUrl.searchParams.get('language') === 'zh' ? 'zh' : 'en');
    return post ? NextResponse.json({ post }, {
      headers: publicCacheHeaders(),
    }) : NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[blogs/slug]', error);
    return NextResponse.json({ error: 'CMS unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
