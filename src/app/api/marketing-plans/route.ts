import { NextResponse } from 'next/server';
import { fetchFromStrapi } from '@/lib/strapi/client';

interface MarketingPlansResponse {
  data: unknown[];
  meta?: object;
}

export async function GET() {
  const response = await fetchFromStrapi<MarketingPlansResponse>('marketing-plans', {
    queryParams: {
      populate: '*',
      sort: 'createdAt:desc',
    },
  });

  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 500 });
  }

  return NextResponse.json(response.data, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
