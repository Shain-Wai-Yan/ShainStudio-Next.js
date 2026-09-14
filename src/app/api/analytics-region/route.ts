import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Clarity and Google's regional consent requirements cover the EEA, UK and
// Switzerland. Treating the whole European continent as opt-in is deliberately
// conservative and avoids maintaining an incomplete country list.
export function GET(request: NextRequest) {
  const continent = request.headers.get('x-vercel-ip-continent')?.toUpperCase();
  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase();
  const isLocal = process.env.NODE_ENV !== 'production';
  const consentRequired = isLocal || !country || !continent || continent === 'EU';

  return NextResponse.json(
    { consentRequired },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        Vary: 'X-Vercel-IP-Country, X-Vercel-IP-Continent',
      },
    },
  );
}
