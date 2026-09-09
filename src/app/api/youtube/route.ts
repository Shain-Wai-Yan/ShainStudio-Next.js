import { NextRequest, NextResponse } from 'next/server';
import { boundedInteger } from '@/lib/utils/pagination';
import { getYouTubeChannelConfig } from '@/lib/youtube-channels';
import { getYouTubeWorkerHeaders, getYouTubeWorkerUrl } from '@/lib/server/youtube-worker';

/**
 * Unified YouTube Channel API Route (AMV, Gaming & Future Channels)
 * Proxies YouTube API requests through Cloudflare Worker with channel allowlisting.
 */

const PAGE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    const channelParam = searchParams.get('channel') || searchParams.get('channelId');
    const channelConfig = getYouTubeChannelConfig(channelParam);

    if (channelParam && !channelConfig) {
      return NextResponse.json(
        { error: 'Unauthorized channel' },
        { status: 403 }
      );
    }

    const channelId = channelConfig?.channelId ?? 'UCV4ZLWfXF15d4tyzdJTkzpw';
    const workerUrl = new URL(getYouTubeWorkerUrl());

    switch (endpoint) {
      case 'channel':
        workerUrl.pathname = '/api/youtube/channel';
        workerUrl.searchParams.set('channelId', channelId);
        break;

      case 'videos': {
        const maxResults = boundedInteger(searchParams.get('maxResults'), 50, 50);
        const pageToken = searchParams.get('pageToken') || '';
        if (pageToken && !PAGE_TOKEN_PATTERN.test(pageToken)) {
          return NextResponse.json({ error: 'Invalid pageToken' }, { status: 400 });
        }
        workerUrl.pathname = '/api/youtube/videos';
        workerUrl.searchParams.set('channelId', channelId);
        workerUrl.searchParams.set('maxResults', String(maxResults));
        if (pageToken) {
          workerUrl.searchParams.set('pageToken', pageToken);
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 });
    }

    const response = await fetch(workerUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
      headers: getYouTubeWorkerHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();
    if (data?.fallback || !Array.isArray(data?.items)) {
      throw new Error('Worker returned an invalid or fallback response');
    }

    return NextResponse.json(data, {
      headers: {
        // Short cache: 5 min fresh, then serve stale while revalidating
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[YouTube API] Error:', error);

    return NextResponse.json(
      {
        items: [],
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
