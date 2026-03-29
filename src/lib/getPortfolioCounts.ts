import { fetchBusinessPlans } from './strapi/business-plans';
import { fetchMarketingPlans } from './strapi/marketing-plans';
import { fetchMarketingProjects } from './strapi/marketing-in-motion';
import { fetchGithubUser } from './github-api';
import { fetchFromStrapi } from './strapi/client';

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

export async function getPortfolioCounts(): Promise<PortfolioCounts> {
  const results = await Promise.allSettled([
    fetchBusinessPlans(1, 1),
    fetchMarketingPlans(1, 1),
    fetchMarketingProjects(1, 1),
    // Ping Strapi directly for photography count (Safer than local API route)
    fetchFromStrapi<Record<string, unknown>>('photographies', { queryParams: { 'pagination[pageSize]': 1 } }),
    fetchGithubUser(),
    fetchYouTubeCount(),
  ]);

  return {
    businessPlans: getNestedValue(results[0], 'total'),
    marketingPlans: getNestedValue(results[1], 'total'),
    marketingInMotion: getNestedValue(results[2], 'total'),
    // Photography is now a direct Strapi response (has .meta.pagination.total)
    photography: getStrapiTotal(results[3]),
    // GitHub: data.repositories.totalCount (now at index 4)
    codingProjects: getGithubValue(results[4]),
    amvEditing: getSimpleValue(results[5]),
  };
}

async function fetchYouTubeCount(): Promise<number> {
  try {
    const url = `${YOUTUBE_WORKER_URL}/api/youtube/channel?channelId=${YOUTUBE_CHANNEL_ID}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
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
 * Extracts 'total' from root of result.value (Used by high-level fetchers)
 */
function getNestedValue(result: PromiseSettledResult<unknown>, key: string): number {
  if (result.status === 'fulfilled' && result.value && typeof result.value === 'object') {
    const val = result.value as Record<string, unknown>;
    if (typeof val[key] === 'number') return val[key] as number;
    // Fallback for different casing if needed
    if (typeof val.total === 'number') return val.total as number;
  }
  return 0;
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

// Special for GitHub
function getGithubValue(result: PromiseSettledResult<unknown>): number {
  if (result.status === 'fulfilled' && result.value && typeof result.value === 'object') {
    interface GithubCountResult {
      repositories?: {
        totalCount?: number;
      };
    }
    const val = result.value as GithubCountResult;
    if (val.repositories) {
      const count = val.repositories.totalCount;
      return typeof count === 'number' ? count : 0;
    }
  }
  return 0;
}





