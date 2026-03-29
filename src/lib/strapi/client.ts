/**
 * Strapi API Client Configuration
 * Handles authentication, error handling, and data fetching from Strapi CMS
 * Supports both Strapi v5 flat structure and v4 nested structure
 */

const STRAPI_API_URL = (process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.shainwaiyan.com/api').replace(/\/$/, '');

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const API_TIMEOUT = 10000; // 10 seconds

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  queryParams?: Record<string, string | number | boolean>;
  timeout?: number;
}

interface FetchResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetches data from Strapi API with error handling and timeout
 */
export async function fetchFromStrapi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  try {
    const { method = 'GET', queryParams = {}, timeout = API_TIMEOUT } = options;

    // Build query string from params object
    const queryString = Object.keys(queryParams)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(queryParams[key]))}`)
      .join('&');

    const url = `${STRAPI_API_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;

    // console.log(`[Strapi Client] Fetching from: ${url}`);

    // Prepare headers with authentication if token is available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }

    // VIP secret key for bypassing rate limit on Strapi backend and Cloudflare worker
    const VIP_SECRET_KEY = process.env.VIP_SECRET_KEY;
    if (VIP_SECRET_KEY) {
      headers['x-shain-secret'] = VIP_SECRET_KEY;
    }

    // Add timeout to fetch to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        // Ensure Next.js caches bypass VIP requests correctly if needed,
        // though typically Strapi fetch caching is handled elsewhere.
      });

      clearTimeout(timeoutId);

      // Handle common HTTP error codes
      if (response.status === 403) {
        console.error('[Strapi Client] Authentication error: You need a valid API token');
        return {
          data: null,
          error: 'Authentication required. Please check your API token.',
        };
      }

      if (response.status === 404) {
        console.error(`[Strapi Client] API endpoint not found: ${url}`);
        return {
          data: null,
          error: 'API endpoint not found. Please check the collection name.',
        };
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      // console.log('[Strapi Client] API Response:', data);
      return { data: data as T, error: null };
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          data: null,
          error: 'Request timed out. The API server might be unreachable.',
        };
      }
      throw fetchError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Strapi Client] Error fetching from Strapi:', errorMessage);

    if (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('timed out')
    ) {
      return {
        data: null,
        error: 'Network error: Please check if the Strapi server is running and accessible.',
      };
    }

    return { data: null, error: errorMessage };
  }
}

import { StrapiFile } from '@/types/strapi';

/**
 * Extracts URL from various Strapi data structures
 * Handles both v5 flat structure and v4 nested structure
 */
export function extractUrl(
  fileObject: StrapiFile | StrapiFile[] | null | undefined,
  fallbackUrl: string = ''
): string {
  if (!fileObject) return fallbackUrl;

  // Handle variety of array shapes from Strapi
  if (Array.isArray(fileObject)) {
    if (fileObject.length === 0) return fallbackUrl;
    // Recursively extract the first item if it's an array
    return extractUrl(fileObject[0], fallbackUrl);
  }

  let url = '';

  // Handle direct string URL
  if (typeof fileObject === 'string') {
    url = fileObject;
  }
  // Handle Strapi v4 nested structure (data.attributes.url)
  else if (fileObject && typeof fileObject === 'object' && 'data' in fileObject) {
    const v4 = fileObject as { data?: { attributes?: { url?: string } } };
    if (v4.data?.attributes?.url) {
      url = v4.data.attributes.url;
    }
  }
  // Handle array format
  else if (Array.isArray(fileObject) && fileObject.length > 0) {
    const file = fileObject[0];
    if (typeof file === 'string') {
      url = file;
    } else if (file && typeof file === 'object' && 'url' in file) {
      url = (file as { url: string }).url;
    } else if (file && typeof file === 'object' && 'data' in file) {
      const v4File = file as { data?: { attributes?: { url?: string } } };
      if (v4File.data?.attributes?.url) {
        url = v4File.data.attributes.url;
      }
    }
  }
  // Handle Strapi v5 flat structure (direct object with url)
  else if (fileObject && typeof fileObject === 'object' && 'url' in fileObject && (fileObject as { url: string }).url) {
    url = (fileObject as { url: string }).url;
  }

  // Ensure URL is absolute
  if (url && !url.startsWith('http') && !url.startsWith('data:')) {
    const baseUrl = STRAPI_API_URL.replace('/api/', '');
    url = `${baseUrl}${url}`;
  }

  return url || fallbackUrl;
}
