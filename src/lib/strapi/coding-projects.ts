/**
 * Coding Projects Strapi Integration
 * Fetches and transforms coding project data from Strapi CMS
 */

import { fetchFromStrapi, extractUrl } from './client';
import { StrapiFile } from '@/types/strapi';

const CODING_PROJECTS_ENDPOINT = 'coding-projects';

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ─── Raw Strapi Shapes ────────────────────────────────────────────────────────

export interface StrapiToolsUsed {
  id: number;
  Tool: string;
}

export interface StrapiProjectType {
  id: number;
  ProjectType: string;
}

export interface StrapiSeoBlock {
  id: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  structuredData?: unknown;
}

export interface StrapiCodingProject {
  id: number;
  Title?: string;
  title?: string;
  slug: string;
  summary?: string;
  content?: string; // CK Editor HTML is named 'content' in Strapi
  coverImage?: StrapiFile;
  imageGallery?: StrapiFile[];
  category?: string | { name?: string; data?: { attributes?: { name: string } } };
  tools_useds?: StrapiToolsUsed[];
  tags?: string[] | Array<{ name?: string }> | { data?: Array<{ attributes: { name: string } }> };
  project_type?: StrapiProjectType;
  type?: string;
  isFeatured?: boolean;
  projectDate?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  seo?: StrapiSeoBlock | StrapiSeoBlock[];
  githubUrl?: string;
  liveDemoUrl?: string;
}

export interface StrapiCodingProjectsResponse {
  data: StrapiCodingProject[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ─── Transformed Shape ────────────────────────────────────────────────────────

export interface CodingProject {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  imageGallery: string[];
  category: string;
  toolsUsed: string[];
  tags: string[];
  type: string;
  isFeatured: boolean;
  projectDate: string;
  updatedAt?: string;
  readingTime: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    canonicalUrl: string;
  };
}

export interface FilterOptions {
  categories: string[];
  tools: string[];
  tags: string[];
  types: string[];
}

function listQueryParams(page: number, pageSize: number): Record<string, string | number | boolean> {
  return {
    'pagination[page]': page,
    'pagination[pageSize]': pageSize,
    'sort': 'projectDate:desc',
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'summary',
    'fields[3]': 'projectDate',
    'fields[4]': 'isFeatured',
    'fields[5]': 'updatedAt',
    'fields[6]': 'githubUrl',
    'fields[7]': 'liveDemoUrl',
    'populate[coverImage][fields][0]': 'url',
    'populate[coverImage][fields][1]': 'width',
    'populate[coverImage][fields][2]': 'height',
    'populate[coverImage][fields][3]': 'alternativeText',
    'populate[category][fields][0]': 'name',
    'populate[tags][fields][0]': 'name',
    'populate[tools_useds][fields][0]': 'Tool',
  };
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function calculateReadingTime(html: string): string {
  if (!html) return '1 min read';
  // Robust HTML stripping for server-side (DOMParser not available)
  const text = html.replace(/<[^>]*>?/gm, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function formatProjectDate(dateString: string, locale = 'en-US'): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (err) {
    console.error(`[CodingProjects] Failed to format date "${dateString}":`, err);
    return 'Date unavailable';
  }
}

// ─── Transform ────────────────────────────────────────────────────────────────

export function transformCodingProject(raw: StrapiCodingProject): CodingProject | null {
  if (!raw) return null;

  try {
    const attributes = (raw as StrapiCodingProject & { attributes?: StrapiCodingProject }).attributes;
    if (attributes) raw = { ...attributes, id: raw.id };
    const title = raw.Title || raw.title || 'Untitled Project';
    const slug = raw.slug || `project-${raw.id}`;
    const summary = raw.summary || '';
    const projectDate = raw.projectDate || raw.publishedAt || raw.createdAt || '';
    const content = typeof raw.content === 'string' ? raw.content : '';

    // Cover image
    const coverImage =
      extractUrl(raw.coverImage) ||
      '/placeholder.svg?height=400&width=600&text=Coding+Project';

    // Gallery
    const imageGallery: string[] = [];
    if (Array.isArray(raw.imageGallery)) {
      raw.imageGallery.forEach((img) => {
        const u = extractUrl(img);
        if (u) imageGallery.push(u);
      });
    }

    // Category
    let category = 'Uncategorized';
    if (typeof raw.category === 'string') {
      category = raw.category;
    } else if (raw.category && typeof raw.category === 'object') {
      const c = raw.category as { name?: string; data?: { attributes?: { name: string } } };
      category = c.name || c.data?.attributes?.name || 'Uncategorized';
    }

    // Tools
    const toolsUsed: string[] = [];
    if (Array.isArray(raw.tools_useds)) {
      raw.tools_useds.forEach((t) => {
        if (t?.Tool) toolsUsed.push(t.Tool.trim());
      });
    }

    // Tags
    const tags: string[] = [];
    if (Array.isArray(raw.tags)) {
      (raw.tags as Array<string | { name?: string }>).forEach((tag) => {
        if (typeof tag === 'string') tags.push(tag.trim());
        else if (tag?.name) tags.push(tag.name.trim());
      });
    } else if (
      raw.tags &&
      typeof raw.tags === 'object' &&
      'data' in (raw.tags as object)
    ) {
      const tagData = (raw.tags as { data?: Array<{ attributes: { name: string } }> }).data;
      tagData?.forEach((t) => {
        if (t.attributes?.name) tags.push(t.attributes.name.trim());
      });
    }

    // Type
    const type = raw.project_type?.ProjectType || raw.type || 'General';

    // SEO
    const seoRaw = Array.isArray(raw.seo) ? raw.seo[0] : raw.seo;
    const seo = {
      metaTitle: seoRaw?.metaTitle || title,
      metaDescription: seoRaw?.metaDescription || summary,
      ogImage: coverImage,
      canonicalUrl: seoRaw?.canonicalUrl || '',
    };

    return {
      id: raw.id,
      title,
      slug,
      summary,
      content,
      coverImage,
      imageGallery,
      category,
      toolsUsed,
      tags,
      type,
      isFeatured: raw.isFeatured || false,
      projectDate,
      updatedAt: raw.updatedAt,
      readingTime: calculateReadingTime(content),
      githubUrl: raw.githubUrl,
      liveDemoUrl: raw.liveDemoUrl,
      seo,
    };
  } catch (err) {
    console.error('[CodingProjects] transform error', err, raw);
    return null;
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function fetchCodingProjects(
  page = 1,
  pageSize = 100,
): Promise<{ projects: CodingProject[]; total: number; error: string | null }> {
  try {
    const response = await fetchFromStrapi<StrapiResponse<StrapiCodingProject[]>>(
      CODING_PROJECTS_ENDPOINT,
      {
        tags: ['strapi', 'coding-projects'],
        // Collection pages only need card and filter data. Detail content and
        // galleries are fetched by slug when a project is opened.
        queryParams: listQueryParams(page, pageSize),
      },
    );

    if (response.error) {
      return { projects: [], total: 0, error: response.error };
    }

    const responseData = response.data;
    if (!responseData) return { projects: [], total: 0, error: 'No data received from Strapi' };
    
    const raw = responseData.data ?? [];
    const meta = responseData.meta;
    const total = meta?.pagination?.total ?? raw.length;

    // Pagination limit warning
    if (meta?.pagination && meta.pagination.total > pageSize) {
      console.warn(
        `[CodingProjects] Only fetched ${pageSize} of ${meta.pagination.total} projects. Increase pageSize if needed.`
      );
    }
    const projects = raw
      .map(transformCodingProject)
      .filter((p): p is CodingProject => !!p);

    return { projects, total, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { projects: [], total: 0, error: msg };
  }
}

export async function fetchCodingProjectBySlug(
  slug: string,
): Promise<{ project: CodingProject | null; error: string | null }> {
  try {
    const response = await fetchFromStrapi<StrapiCodingProjectsResponse>(
      'coding-projects',
      {
        tags: ['strapi', 'coding-projects'],
        queryParams: {
          'filters[slug][$eq]': slug,
          populate: '*',
        },
      },
    );

    if (response.error) {
      return { project: null, error: response.error };
    }

    const responseData = response.data;
    if (!responseData) return { project: null, error: 'No data received from Strapi' };
    
    const raw = responseData.data;
    if (!raw || raw.length === 0) return { project: null, error: null };

    // Slug uniqueness guard
    if (raw.length > 1) {
      console.warn(`[CodingProjects] Multiple projects found for slug "${slug}". Using the first one.`);
    }

    const project = transformCodingProject(raw[0]);
    return { project, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { project: null, error: msg };
  }
}

export async function fetchRelatedCodingProjects(
  category: string,
  currentSlug: string,
  limit = 3,
  timeout?: number
): Promise<{ projects: CodingProject[]; error: string | null }> {
  if (!category || category === 'Uncategorized') {
    return { projects: [], error: null };
  }

  try {
    const response = await fetchFromStrapi<StrapiCodingProjectsResponse>(
      'coding-projects',
      {
        tags: ['strapi', 'coding-projects'],
        queryParams: {
          ...listQueryParams(1, limit),
          'filters[category][name][$eq]': category,
          'filters[slug][$ne]': currentSlug,
        },
        timeout,
      },
    );

    if (response.error) {
      return { projects: [], error: response.error };
    }

    const raw = response.data?.data ?? [];
    const projects = raw
      .map(transformCodingProject)
      .filter((p): p is CodingProject => !!p);

    return { projects, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { projects: [], error: msg };
  }
}

// ─── Filter Helpers ───────────────────────────────────────────────────────────

export function extractFilterOptions(projects: CodingProject[]): FilterOptions {
  const categories = new Set<string>();
  const tools = new Set<string>();
  const tags = new Set<string>();
  const types = new Set<string>();

  projects.forEach((p) => {
    if (p.category) categories.add(p.category.trim());
    p.toolsUsed.forEach((t) => tools.add(t.trim()));
    p.tags.forEach((t) => tags.add(t.trim()));
    if (p.type) types.add(p.type.trim());
  });

  return {
    categories: Array.from(categories).sort(),
    tools: Array.from(tools).sort(),
    tags: Array.from(tags).sort(),
    types: Array.from(types).sort(),
  };
}

export function filterProjects(
  projects: CodingProject[],
  search: string,
  filters: { category: string; tools: string; tag: string; type: string },
): CodingProject[] {
  let result = [...projects];

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.toolsUsed.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (filters.category) {
    const fc = filters.category.toLowerCase().trim();
    result = result.filter((p) => p.category.toLowerCase().trim() === fc);
  }
  if (filters.tools) {
    const ft = filters.tools.toLowerCase().trim();
    result = result.filter((p) =>
      p.toolsUsed.some((t) => t.toLowerCase().trim() === ft),
    );
  }
  if (filters.tag) {
    const ftag = filters.tag.toLowerCase().trim();
    result = result.filter((p) =>
      p.tags.some((t) => t.toLowerCase().trim() === ftag),
    );
  }
  if (filters.type) {
    const ftype = filters.type.toLowerCase().trim();
    result = result.filter((p) => p.type.toLowerCase().trim() === ftype);
  }

  return result;
}
