import { NextRequest, NextResponse } from 'next/server';
import { getBlogPost } from '@/lib/server/blog-data';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/i.test(slug) || slug.length > 200) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  try {
    const post = await getBlogPost(slug);
    return post ? NextResponse.json({ post }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('[blogs/slug]', error);
    return NextResponse.json({ error: 'CMS unavailable' }, { status: 502 });
  }
}
