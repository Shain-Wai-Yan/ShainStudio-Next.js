/**
 * Marketing Plans Strapi Integration
 * Fetches marketing plan documents from Strapi CMS
 */

import { fetchFromStrapi, extractUrl } from './client';
import { StrapiFile } from '@/types/strapi';
import { sanitizeDescription } from '@/lib/utils/sanitize-description';


export interface MarketingPlan {
  id: number;
  Title: string;
  Description: string;
  Slug: string;
  DocumentFile: StrapiFile | StrapiFile[] | string;
  CoverImage: StrapiFile | StrapiFile[] | string;
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
export async function fetchMarketingPlans(
  page = 1,
  pageSize = 36
): Promise<{
  plans: MarketingPlan[];
  total: number;
  error: string | null;
}> {
  try {
    const response = await fetchFromStrapi<MarketingPlansResponse>('marketing-plans', {
      revalidate: 3600,
      tags: ['strapi', 'marketing-plans'],
      queryParams: {
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'populate': '*',
        'sort': 'createdAt:desc',
      },
    });

    if (response.error) {
      return { plans: [], total: 0, error: response.error };
    }

    const plans = response.data?.data || [];
    const total = response.data?.meta?.pagination?.total ?? plans.length;

    return {
      plans,
      total,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Marketing Plans] Error fetching:', errorMessage);
    return { plans: [], total: 0, error: errorMessage };
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
    Description: sanitizeDescription(plan.Description || ''),
    documentUrl,
    coverImageUrl,
    fileType,
    formattedDate,
  };
}
