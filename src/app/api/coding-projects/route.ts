/**
 * Coding Projects API Route
 * Proxies requests to the Strapi CMS so the frontend never exposes the API token directly.
 * Mirrors the /api/marketing-in-motion pattern for consistency.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchCodingProjects,
  fetchCodingProjectBySlug,
} from '@/lib/strapi/coding-projects';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const slug = searchParams.get('slug');
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '100');

  // ─── Single project by slug ───────────────────────────────────────────────
  if (slug) {
    const { project, error } = await fetchCodingProjectBySlug(slug);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  }

  // ─── List with pagination ─────────────────────────────────────────────────
  const { projects, total, error } = await fetchCodingProjects(page, pageSize);
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
