/**
 * AMV Editing API Route
 * Proxies YouTube API requests through Cloudflare Worker.
 * FIX: passes nextPageToken through in the response so the client
 *      can paginate and load ALL videos from the channel playlist.
 */

import { NextRequest, NextResponse } from 'next/server';

const WORKER_BASE_URL =
  'https://youtube-api-fetcher.shainwaiyan2002.workers.dev';
const CHANNEL_ID = 'UCV4ZLWfXF15d4tyzdJTkzpw';

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

    let workerUrl = '';

    switch (endpoint) {
      case 'channel':
        workerUrl = `${WORKER_BASE_URL}/api/youtube/channel?channelId=${CHANNEL_ID}`;
        break;

      case 'videos': {
        const maxResults = searchParams.get('maxResults') || '50';
        const pageToken = searchParams.get('pageToken') || '';
        workerUrl = `${WORKER_BASE_URL}/api/youtube/videos?channelId=${CHANNEL_ID}&maxResults=${maxResults}`;
        if (pageToken) {
          workerUrl += `&pageToken=${encodeURIComponent(pageToken)}`;
        }
        break;
      }

      case 'video-details': {
        const videoId = searchParams.get('videoId');
        if (!videoId) {
          return NextResponse.json(
            { error: 'Missing videoId parameter' },
            { status: 400 }
          );
        }
        workerUrl = `${WORKER_BASE_URL}/api/youtube/video-details?videoId=${videoId}`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 });
    }

    const response = await fetch(workerUrl, {
      // Avoid stale worker cache during pagination
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) {
      throw new Error(`Worker error: ${response.status}`);
    }

    const data = await response.json();

    // ── KEY FIX ───────────────────────────────────────────────────────────────
    // Make sure nextPageToken is always forwarded to the client so page.tsx can
    // keep fetching until all pages are exhausted.
    // The YouTube Data API (and therefore the Cloudflare Worker) returns
    // `nextPageToken` at the top level of the playlist-items response.
    // We preserve it verbatim in our JSON response.
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json(data, {
      headers: {
        // Short cache: 5 min fresh, then serve stale while revalidating
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('[AMV API] Error:', error);

    return NextResponse.json(
      {
        items: [],
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
    }

    const analyticsUrl = `${WORKER_BASE_URL}/api/analytics/track`;

    const response = await fetch(analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventType,
        data: data || {},
        page: 'amv-portfolio',
        timestamp: new Date().toISOString(),
        user_agent: request.headers.get('user-agent'),
      }),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[AMV Analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}