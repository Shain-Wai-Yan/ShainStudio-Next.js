import { fetchFromStrapi } from './strapi/client';

const GITHUB_USERNAME = 'Shain-Wai-Yan';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

/**
 * Fetches GitHub repository count.
 * - With GITHUB_TOKEN: uses GraphQL API (authenticated, higher rate limits)
 * - Without token: falls back to the unauthenticated REST API
 * Both paths work on Vercel without needing localhost.
 */
async function fetchGithubRepoCount(): Promise<number> {
  // Authenticated GraphQL path (preferred)
  if (GITHUB_TOKEN) {
    const query = `query($login: String!) { user(login: $login) { repositories(privacy: PUBLIC) { totalCount } } }`;
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-Counter',
      },
      body: JSON.stringify({ query, variables: { login: GITHUB_USERNAME } }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const json = await res.json() as { data?: { user?: { repositories?: { totalCount?: number } } }; errors?: unknown[] };
      if (!json.errors) {
        return json.data?.user?.repositories?.totalCount ?? 0;
      }
    }
    console.warn('[getPortfolioCounts] GitHub GraphQL failed, falling back to REST');
  }

  // Unauthenticated REST fallback (works without a token, 60 req/hour limit)
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
    headers: { 'User-Agent': 'Portfolio-Counter', Accept: 'application/vnd.github.v3+json' },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`GitHub REST error: ${res.status}`);
  const user = await res.json() as { public_repos?: number };
  return user.public_repos ?? 0;
}

const YOUTUBE_WORKER_URL = 'https://youtube-api-fetcher.shainwaiyan2002.workers.dev';
const YOUTUBE_CHANNEL_ID = 'UCV4ZLWfXF15d4tyzdJTkzpw';

export interface PortfolioCounts {
  businessPlans: number;
  marketingPlans: number;
  marketingInMotion: number;
  codingProjects: number;
  photography: number;
  amvEditing: number;
}

function fetchCount(endpoint: string) {
  return fetchFromStrapi<Record<string, unknown>>(endpoint, { queryParams: { 'pagination[pageSize]': 1, 'fields[0]': 'createdAt' } });
}

export async function getPortfolioCounts(): Promise<PortfolioCounts> {
  const results = await Promise.allSettled([
    fetchCount('business-plans'),
    fetchCount('marketing-plans'),
    fetchCount('marketing-projects'),
    // Ping Strapi directly for photography count (Safer than local API route)
    fetchCount('photographies'),
    fetchGithubRepoCount(),
    fetchYouTubeCount(),
  ]);

  return {
    businessPlans: getStrapiTotal(results[0]),
    marketingPlans: getStrapiTotal(results[1]),
    marketingInMotion: getStrapiTotal(results[2]),
    // Photography is now a direct Strapi response (has .meta.pagination.total)
    photography: getStrapiTotal(results[3]),
    // GitHub: direct count (plain number)
    codingProjects: getSimpleValue(results[4] as PromiseSettledResult<number>),
    amvEditing: getSimpleValue(results[5] as PromiseSettledResult<number>),
  };
}

async function fetchYouTubeCount(): Promise<number> {
  try {
    const url = `${YOUTUBE_WORKER_URL}/api/youtube/channel?channelId=${YOUTUBE_CHANNEL_ID}`;
    const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return 0;
    
    interface YouTubeResponse {
      items?: Array<{
        statistics?: {
          videoCount?: string;
        };
      }>;
      statistics?: {
        videoCount?: string;
      };
    }
    
    const data = await response.json() as YouTubeResponse;
    // YouTube API returns an array of items
    const stats = data.items?.[0]?.statistics || data.statistics;
    return parseInt(stats?.videoCount || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Extracts total from a raw Strapi response: data.meta.pagination.total
 */
function getStrapiTotal(result: PromiseSettledResult<unknown>): number {
  if (result.status === 'fulfilled' && result.value && typeof result.value === 'object') {
    interface StrapiRawMeta {
      data?: {
        meta?: {
          pagination?: {
            total?: number;
          };
        };
      };
      total?: number;
    }
    const val = result.value as StrapiRawMeta;
    const total = val?.data?.meta?.pagination?.total;
    if (typeof total === 'number') return total;
    
    // Also check root in case it was already mapped
    if (typeof val?.total === 'number') return val.total;
  }
  return 0;
}

function getSimpleValue(result: PromiseSettledResult<number>): number {
  if (result.status === 'fulfilled' && typeof result.value === 'number') {
    return result.value;
  }
  return 0;
}
