/**
 * Photography Strapi Integration
 *
 * Key fix: category comes back from the API as a plain string (after route.ts transforms it),
 * but mapPhoto now also defensively handles the raw object shape in case anything
 * calls Strapi directly, preventing the "Objects are not valid as a React child" crash.
 */

export interface Photo {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  location: string;
  category?: string;   // always a plain string — never an object
  image: string | null;
  width?: number;      // intrinsic pixel width  — reserves aspect ratio (no CLS)
  height?: number;     // intrinsic pixel height — reserves aspect ratio (no CLS)
  altText?: string;    // dedicated CMS alt text (falls back to title downstream)
  tags?: string[];     // always string[] — never objects
  language: 'en' | 'zh';
  createdAt: string;
  updatedAt: string;
}

/**
 * Safely extracts a plain string from a value that might be:
 * - already a string
 * - a Strapi relation object { id, name, slug, ... }
 */
function toStringField(value: unknown, key = 'name'): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value || undefined;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj[key] === 'string') return obj[key] as string;
    if (typeof obj.slug === 'string') return obj.slug as string;
    // Strapi v4 nested
    const attrs = (obj.data as Record<string, unknown> | undefined)?.attributes as
      | Record<string, unknown>
      | undefined;
    if (attrs && typeof attrs[key] === 'string') return attrs[key] as string;
  }
  return undefined;
}

/**
 * Safely extracts a string[] from tags that might be:
 * - string[]
 * - relation object array [{ id, name, ... }]
 */
function toTagsArray(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags
      .map((t) => {
        if (typeof t === 'string') return t;
        if (typeof t === 'object' && t !== null) {
          const obj = t as Record<string, unknown>;
          if (typeof obj.name === 'string') return obj.name;
          const attrs = obj.attributes as Record<string, unknown> | undefined;
          if (attrs && typeof attrs.name === 'string') return attrs.name;
        }
        return null;
      })
      .filter((t): t is string => t !== null && t !== '');
  }
  if (typeof tags === 'object') {
    const obj = tags as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return (obj.data as Record<string, unknown>[])
        .map((item) => {
          if (typeof item.name === 'string') return item.name;
          const attrs = item.attributes as Record<string, unknown> | undefined;
          return attrs && typeof attrs.name === 'string' ? attrs.name : null;
        })
        .filter((t): t is string => t !== null && t !== '');
    }
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPhoto(p: Record<string, any>): Photo {
  return {
    id: p.id as number,
    documentId: (p.documentId as string) || undefined,
    title: typeof p.title === 'string' ? p.title : 'Untitled',
    description: typeof p.description === 'string' ? p.description : undefined,
    location: typeof p.location === 'string' ? p.location : 'Unknown',
    // Defensively extract — p.category may be a string (from route.ts) or still an object
    category: toStringField(p.category),
    image: (p.image as string | null) ?? null,
    width: typeof p.width === 'number' && p.width > 0 ? p.width : undefined,
    height: typeof p.height === 'number' && p.height > 0 ? p.height : undefined,
    altText: typeof p.altText === 'string' && p.altText ? p.altText : undefined,
    tags: toTagsArray(p.tags),
    language: (p.language as 'en' | 'zh') ?? 'en',
    createdAt: (p.createdAt as string) ?? new Date().toISOString(),
    updatedAt: (p.updatedAt as string) ?? new Date().toISOString(),
  };
}

/**
 * Fetches all photography via the Next.js API route.
 */
export async function fetchAllPhotography(
  language: 'en' | 'zh' = 'en',
  options: { page?: number; pageSize?: number } = {}
): Promise<{
  photos: Photo[];
  total: number;
  pageCount: number;
  error: string | null;
}> {
  try {
    const { page = 1, pageSize = 20 } = options;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(
      `${appUrl}/api/photography?page=${page}&pageSize=${pageSize}&language=${language}`,
      {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      return { photos: [], total: 0, pageCount: 0, error: `API Error: ${res.status}` };
    }

    const data = await res.json();

    return {
      photos: Array.isArray(data.photos) ? data.photos.map(mapPhoto) : [],
      total: data.total || 0,
      pageCount: data.pageCount || 1,
      error: data.error || null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Photography] Fetch error:', errorMessage);
    return { photos: [], total: 0, pageCount: 0, error: errorMessage };
  }
}

export async function fetchPhotosByCategory(
  category: string,
  language: 'en' | 'zh' = 'en',
  options: { page?: number; pageSize?: number } = {}
): Promise<{
  photos: Photo[];
  total: number;
  pageCount: number;
  error: string | null;
}> {
  try {
    const { page = 1, pageSize = 20 } = options;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(
      `${appUrl}/api/photography?category=${encodeURIComponent(category)}&page=${page}&pageSize=${pageSize}&language=${language}`,
      {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      return { photos: [], total: 0, pageCount: 0, error: `API Error: ${res.status}` };
    }

    const data = await res.json();

    return {
      photos: Array.isArray(data.photos) ? data.photos.map(mapPhoto) : [],
      total: data.total || 0,
      pageCount: data.pageCount || 1,
      error: data.error || null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Photography] Fetch by category error:', errorMessage);
    return { photos: [], total: 0, pageCount: 0, error: errorMessage };
  }
}

export async function searchPhotography(
  query: string,
  language: 'en' | 'zh' = 'en',
  options: { page?: number; pageSize?: number } = {}
): Promise<{
  photos: Photo[];
  total: number;
  pageCount: number;
  error: string | null;
}> {
  try {
    const { page = 1, pageSize = 20 } = options;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(
      `${appUrl}/api/photography?search=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&language=${language}`,
      {
        next: { revalidate: 300 },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!res.ok) {
      return { photos: [], total: 0, pageCount: 0, error: `API Error: ${res.status}` };
    }

    const data = await res.json();

    return {
      photos: Array.isArray(data.photos) ? data.photos.map(mapPhoto) : [],
      total: data.total || 0,
      pageCount: data.pageCount || 1,
      error: data.error || null,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Photography] Search error:', errorMessage);
    return { photos: [], total: 0, pageCount: 0, error: errorMessage };
  }
}