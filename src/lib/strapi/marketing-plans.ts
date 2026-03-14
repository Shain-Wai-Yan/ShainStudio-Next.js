/**
 * Marketing Plans Strapi Integration
 * Fetches marketing plan documents from Strapi CMS
 */

import { fetchFromStrapi, extractUrl } from './client';

export interface DocumentFile {
  url?: string;
  data?: {
    attributes?: {
      url: string;
    };
  };
}

export interface CoverImage {
  url?: string;
  data?: {
    attributes?: {
      url: string;
    };
  };
}

export interface MarketingPlan {
  id: number;
  Title: string;
  Description: string;
  Slug: string;
  DocumentFile: DocumentFile | DocumentFile[] | string;
  CoverImage: CoverImage | CoverImage[] | string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingPlansResponse {
  data: MarketingPlan[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Fetches marketing plans from Strapi
 */
export async function fetchMarketingPlans(): Promise<{
  plans: MarketingPlan[];
  error: string | null;
}> {
  try {
    const response = await fetchFromStrapi<MarketingPlansResponse>('marketing-plans', {
      queryParams: {
        'populate': '*',
        'sort': 'createdAt:desc',
      },
    });

    if (response.error) {
      return { plans: [], error: response.error };
    }

    const plans = response.data?.data || [];
    console.log('[Marketing Plans] Fetched:', plans.length, 'plans');

    return {
      plans,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Marketing Plans] Error fetching:', errorMessage);
    return { plans: [], error: errorMessage };
  }
}

/**
 * Transforms a marketing plan for display
 */
export function transformMarketingPlan(plan: MarketingPlan) {
  const documentUrl = extractUrl(plan.DocumentFile);
  const coverImageUrl = extractUrl(plan.CoverImage);

  // Determine file type from URL
  let fileType = '';
  if (documentUrl) {
    const fileExt = documentUrl.split('.').pop()?.toUpperCase();
    fileType = fileExt || '';
  }

  // Format date
  const date = new Date(plan.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return {
    ...plan,
    documentUrl,
    coverImageUrl,
    fileType,
    formattedDate,
  };
}
