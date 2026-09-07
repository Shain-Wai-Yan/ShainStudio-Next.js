/**
 * Business Plans Strapi Integration
 * Fetches business plan documents from Strapi CMS
 */

import { fetchFromStrapi, extractUrl } from './client';
import { StrapiFile } from '@/types/strapi';


export interface BusinessPlan {
  id: number;
  Title: string;
  Description: string;
  Slug: string;
  DocumentFile: StrapiFile | StrapiFile[] | string;
  CoverImage: StrapiFile | StrapiFile[] | string;
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
export async function fetchBusinessPlans(
  page = 1,
  pageSize = 36
): Promise<{
  plans: BusinessPlan[];
  total: number;
  error: string | null;
}> {
  try {
    const response = await fetchFromStrapi<BusinessPlansResponse>('business-plans', {
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
    console.error('[Business Plans] Error fetching:', errorMessage);
    return { plans: [], total: 0, error: errorMessage };
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
