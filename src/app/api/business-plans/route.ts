import { NextResponse } from 'next/server';
import { fetchBusinessPlans, transformBusinessPlan } from '@/lib/strapi/business-plans';

export async function GET() {
  const result = await fetchBusinessPlans(1, 100);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: result.plans.map(transformBusinessPlan),
    meta: { pagination: { total: result.total } },
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
