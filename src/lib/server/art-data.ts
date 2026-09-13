import 'server-only';
import { fetchFromStrapi } from '@/lib/strapi/client';
import { STRAPI_ORIGIN_URL } from '@/lib/strapi/config';
import { sanitizeDescription } from '@/lib/utils/sanitize-description';
import type { ArtPiece, ArtFeedPage, ArtQueryOptions } from '@/lib/strapi/art';

/**
 * Resolves a Strapi media object to a flat absolute URL string.
 * Handles both Strapi v5 (.url) and v4 (.data.attributes.url) structures.
 */
interface NormalizedMedia {
  url: string;
  width?: number;
  height?: number;
  alternativeText?: string;
}

function normalizeMedia(media: unknown): NormalizedMedia | null {
  if (!media) return null;
  if (typeof media === 'string') {
    if (media.startsWith('http://') || media.startsWith('https://') || media.startsWith('data:')) {
      return { url: media };
    }
    return { url: new URL(media, `${STRAPI_ORIGIN_URL}/`).toString() };
  }
  if (typeof media === 'object') {
    const obj = media as Record<string, unknown>;
    const nested = obj.data as Record<string, unknown> | null | undefined;
    const file = (nested?.attributes as Record<string, unknown> | undefined) ?? nested ?? obj;
    let url = typeof file.url === 'string' ? file.url : undefined;
    if (!url && file.formats && typeof file.formats === 'object') {
      const formats = file.formats as Record<string, { url?: string }>;
      for (const size of ['large', 'medium', 'small', 'thumbnail']) {
        if (formats[size]?.url) {
          url = formats[size].url;
          break;
        }
      }
    }
    if (!url) return null;
    const absoluteUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')
      ? url
      : new URL(url, `${STRAPI_ORIGIN_URL}/`).toString();
    return {
      url: absoluteUrl,
      width: typeof file.width === 'number' ? file.width : undefined,
      height: typeof file.height === 'number' ? file.height : undefined,
      alternativeText: typeof file.alternativeText === 'string' ? file.alternativeText : undefined,
    };
  }
  return null;
}

/**
 * Transforms a raw Strapi art document into a type-safe ArtPiece.
 */
function transformArtPiece(raw: Record<string, unknown>): ArtPiece | null {
  if (!raw) return null;
  try {
    const data = (raw.attributes as Record<string, unknown>) || raw;
    const title = String(data.title ?? data.Title ?? 'Untitled Artwork');
    const slug = String(data.slug ?? data.Slug ?? `art-${raw.id}`);

    const media = normalizeMedia(data.image ?? data.Image);
    if (!media) return null;

    const altText =
      typeof data.alt_text === 'string' && data.alt_text.trim()
        ? data.alt_text
        : typeof data.altText === 'string' && data.altText.trim()
          ? data.altText
          : media.alternativeText?.trim() || title;

    const rawDesc = typeof data.description === 'string' ? data.description : '';
    const description = rawDesc ? sanitizeDescription(rawDesc) : '';

    return {
      id: Number(raw.id),
      documentId: typeof raw.documentId === 'string' ? raw.documentId : undefined,
      title,
      slug,
      image: media.url,
      width: media.width,
      height: media.height,
      altText,
      dateCreated:
        typeof data.date_created === 'string'
          ? data.date_created
          : typeof data.dateCreated === 'string'
            ? data.dateCreated
            : undefined,
      description,
      isFeatured: Boolean(data.is_featured ?? data.isFeatured),
      createdAt: String(data.createdAt ?? ''),
      updatedAt: String(data.updatedAt ?? ''),
      publishedAt: typeof data.publishedAt === 'string' ? data.publishedAt : undefined,
    };
  } catch (error) {
    console.error('[ArtData] Failed to transform art item:', error);
    return null;
  }
}

/**
 * Fetches art pieces with pagination and fails explicitly when the CMS is unavailable.
 */
export async function getArtPieces(options: ArtQueryOptions = {}): Promise<ArtFeedPage> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 50));

  try {
    const queryParams: Record<string, string | number | boolean> = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      populate: '*',
      'sort[0]': 'date_created:desc',
      'sort[1]': 'createdAt:desc',
    };

    if (options.featured) {
      queryParams['filters[is_featured][$eq]'] = true;
    }

    const response = await fetchFromStrapi<{
      data: Record<string, unknown>[];
      meta?: { pagination?: { total?: number; pageCount?: number } };
    }>('arts', {
      queryParams,
      revalidate: 3600,
      tags: ['strapi', 'arts'],
    });

    if (response.error) throw new Error(response.error);

    if (response.data && Array.isArray(response.data.data)) {
      const arts = response.data.data
        .map(transformArtPiece)
        .filter((item): item is ArtPiece => item !== null);

      return {
        arts,
        page,
        pageCount: response.data.meta?.pagination?.pageCount ?? 0,
        total: response.data.meta?.pagination?.total ?? arts.length,
      };
    }
    throw new Error('Invalid art collection response');
  } catch (error) {
    console.error('[ArtData] Strapi fetch failed:', error);
    throw error;
  }
}

/**
 * Fetches an individual art piece by slug. A healthy CMS miss returns null.
 */
export async function getArtPieceBySlug(slug: string): Promise<ArtPiece | null> {
  if (!slug || slug.length > 200) return null;

  try {
    const response = await fetchFromStrapi<{ data: Record<string, unknown>[] }>('arts', {
      queryParams: {
        'filters[slug][$eq]': slug,
        populate: '*',
        'pagination[pageSize]': 1,
      },
      revalidate: 3600,
      tags: ['strapi', 'arts'],
    });

    if (response.error) throw new Error(response.error);
    if (response.data?.data?.[0]) {
      const piece = transformArtPiece(response.data.data[0]);
      if (piece) return piece;
    }
    return null;
  } catch (error) {
    console.error(`[ArtData] Failed to fetch art piece "${slug}":`, error);
    throw error;
  }
}

/**
 * Gets total art count for navigation metrics or hub display.
 */
export async function getTotalArtCount(): Promise<number> {
  const feed = await getArtPieces({ pageSize: 1 });
  return feed.total;
}
