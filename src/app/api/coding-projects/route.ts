import { publicCacheHeaders } from '@/lib/server/public-cache';
import { boundedInteger } from '@/lib/utils/pagination';
/**
 * Coding Projects API Route
 * Proxies requests to the Strapi CMS so the frontend never exposes the API token directly.
 * Mirrors the /api/marketing-in-motion pattern for consistency.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCodingProject, getCodingProjects } from '@/lib/server/project-data';

const CACHE_HEADERS = publicCacheHeaders();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const language = searchParams.get('language') === 'zh' ? 'zh' : 'en';
  const slug = searchParams.get('slug');
  const page = boundedInteger(searchParams.get('page'), 1, 10000);
  const pageSize = boundedInteger(searchParams.get('pageSize'), 100, 100);

  // ─── Single project by slug ───────────────────────────────────────────────
  if (slug) {
    const { project, error } = await getCodingProject(slug, language);
    if (error) {
      return NextResponse.json({ error }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ data: project }, { headers: CACHE_HEADERS });
  }

  // ─── List with pagination ─────────────────────────────────────────────────
  const { projects, total, error } = await getCodingProjects(page, pageSize, language);
  if (error) {
    return NextResponse.json({ error }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({
    data: projects,
    meta: {
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    },
  }, { headers: CACHE_HEADERS });
}
