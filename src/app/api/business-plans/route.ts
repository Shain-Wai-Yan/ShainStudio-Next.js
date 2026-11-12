import { localizedSource } from '@/lib/server/localized-content';
import { NextResponse } from 'next/server';
import { fetchBusinessPlans, transformBusinessPlan } from '@/lib/strapi/business-plans';

export async function GET(request: Request) {
  const result = await fetchBusinessPlans(1, 100, localizedSource(new URL(request.url).searchParams.get('language') === 'zh' ? 'zh' : 'en'));
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    data: result.plans.map(transformBusinessPlan),
    meta: { pagination: { total: result.total } },
  }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
