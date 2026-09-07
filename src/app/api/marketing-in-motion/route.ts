import { boundedInteger } from '@/lib/utils/pagination';
/**
 * Marketing in Motion API Route
 * Proxies requests to the Strapi CMS so the frontend never exposes the API token directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchMarketingProjects,
  fetchMarketingProjectBySlug,
} from '@/lib/strapi/marketing-in-motion';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const slug = searchParams.get('slug');
  const page = boundedInteger(searchParams.get('page'), 1, 10000);
  const pageSize = boundedInteger(searchParams.get('pageSize'), 36, 100);

  // ─── Single project by slug ───────────────────────────────────────────────
  if (slug) {
    const { project, error } = await fetchMarketingProjectBySlug(slug);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  }

  // ─── List with pagination ─────────────────────────────────────────────────
  const { projects, total, error } = await fetchMarketingProjects(page, pageSize);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
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
  });
}
