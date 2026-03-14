/**
 * Business Plans Strapi Integration
 * Fetches business plan documents from Strapi CMS
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

export interface BusinessPlan {
  id: number;
  Title: string;
  Description: string;
  Slug: string;
  DocumentFile: DocumentFile | DocumentFile[] | string;
  CoverImage: CoverImage | CoverImage[] | string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPlansResponse {
  data: BusinessPlan[];
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
 * Fetches business plans from Strapi
 */
export async function fetchBusinessPlans(): Promise<{
  plans: BusinessPlan[];
  error: string | null;
}> {
  try {
    const response = await fetchFromStrapi<BusinessPlansResponse>('business-plans', {
      queryParams: {
        'populate': '*',
        'sort': 'createdAt:desc',
      },
    });

    if (response.error) {
      return { plans: [], error: response.error };
    }

    const plans = response.data?.data || [];
    console.log('[Business Plans] Fetched:', plans.length, 'plans');

    return {
      plans,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Business Plans] Error fetching:', errorMessage);
    return { plans: [], error: errorMessage };
  }
}

/**
 * Transforms a business plan for display
 */
export function transformBusinessPlan(plan: BusinessPlan) {
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
