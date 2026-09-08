/**
 * Marketing in Motion Strapi Integration
 * Fetches and transforms marketing project data from Strapi CMS
 */

import { fetchFromStrapi, extractUrl } from './client';
import { StrapiFile } from '@/types/strapi';

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

export interface StrapiMarketingProject {
  id: number;
  // Strapi v5 flat structure
  Title?: string;
  title?: string;
  slug: string;
  summary?: string;
  fullText?: unknown;
  content?: unknown; // New CKEditor field
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
}

export interface StrapiMarketingProjectsResponse {
  data: StrapiMarketingProject[];
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

export interface MarketingProject {
  id: number;
  title: string;
  slug: string;
  summary: string;
  fullText: string;
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
    'populate[coverImage][fields][0]': 'url',
    'populate[coverImage][fields][1]': 'width',
    'populate[coverImage][fields][2]': 'height',
    'populate[coverImage][fields][3]': 'alternativeText',
    'populate[category][fields][0]': 'name',
    'populate[tags][fields][0]': 'name',
    'populate[tools_useds][fields][0]': 'Tool',
    'populate[project_type][fields][0]': 'ProjectType',
  };
}

// ─── Rich-text ────────────────────────────────────────────────────────────────

function convertInlineElement(el: Record<string, unknown>): string {
  if (typeof el.text === 'string') {
    let t = el.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    if (el.bold) t = `<strong>${t}</strong>`;
    if (el.italic) t = `<em>${t}</em>`;
    if (el.underline) t = `<u>${t}</u>`;
    if (el.strikethrough) t = `<s>${t}</s>`;
    if (el.code) t = `<code>${t}</code>`;
    return t;
  }
  if (el.type === 'link' && typeof el.url === 'string') {
    const children = Array.isArray(el.children)
      ? (el.children as Record<string, unknown>[]).map(convertInlineElement).join('')
      : '';
    const target = el.url.toString().startsWith('http')
      ? ' target="_blank" rel="noopener noreferrer"'
      : '';
    return `<a href="${el.url}"${target}>${children}</a>`;
  }
  if (Array.isArray(el.children)) {
    return (el.children as Record<string, unknown>[]).map(convertInlineElement).join('');
  }
  return '';
}

function convertBlockToHtml(block: Record<string, unknown>): string {
  if (!block?.type) return '';
  const children = Array.isArray(block.children)
    ? (block.children as Record<string, unknown>[]).map(convertInlineElement).join('')
    : '';
  switch (block.type) {
    case 'paragraph':
      return children.trim() ? `<p>${children}</p>` : '';
    case 'heading': {
      const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
      return children.trim() ? `<h${level}>${children}</h${level}>` : '';
    }
    case 'list': {
      const tag = block.format === 'ordered' ? 'ol' : 'ul';
      const items = Array.isArray(block.children)
        ? (block.children as Record<string, unknown>[])
            .map((item) => {
              if (item.type === 'list-item' && Array.isArray(item.children)) {
                const content = (item.children as Record<string, unknown>[])
                  .map(convertInlineElement)
                  .join('');
                return `<li>${content}</li>`;
              }
              return '';
            })
            .filter(Boolean)
            .join('')
        : '';
      return items ? `<${tag}>${items}</${tag}>` : '';
    }
    case 'quote':
      return children.trim() ? `<blockquote>${children}</blockquote>` : '';
    case 'code': {
      const text = Array.isArray(block.children)
        ? (block.children as Record<string, unknown>[]).map((c) => c.text ?? '').join('')
        : '';
      const lang = block.language ? ` class="language-${block.language}"` : '';
      return text.trim() ? `<pre><code${lang}>${text}</code></pre>` : '';
    }
    case 'image': {
      const imgBlock = block as Record<string, unknown> & { image?: { url?: string; alternativeText?: string; caption?: string }; url?: string; alt?: string; caption?: string };
      const src = imgBlock.image?.url || (imgBlock.url as string) || '';
      const alt = imgBlock.image?.alternativeText || (imgBlock.alt as string) || '';
      const caption = imgBlock.image?.caption || (imgBlock.caption as string) || '';
      if (!src) return '';
      const img = `<img src="${src}" alt="${alt}" loading="lazy">`;
      return caption ? `<figure>${img}<figcaption>${caption}</figcaption></figure>` : img;
    }
    default:
      return children.trim() ? `<p>${children}</p>` : '';
  }
}

function convertRichTextToHtml(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.map((b) => convertBlockToHtml(b as Record<string, unknown>)).join('');
}

function calculateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

// ─── Transform ────────────────────────────────────────────────────────────────

export function transformMarketingProject(raw: StrapiMarketingProject): MarketingProject | null {
  if (!raw) return null;

  try {
    const attributes = (raw as StrapiMarketingProject & { attributes?: StrapiMarketingProject }).attributes;
    if (attributes) raw = { ...attributes, id: raw.id };
    const title = raw.Title || raw.title || 'Untitled Project';
    const slug = raw.slug || `project-${raw.id}`;
    const summary = raw.summary || '';
    const projectDate = raw.projectDate || raw.publishedAt || raw.createdAt || '';
    
    // Support both 'content' (new CKEditor field) and 'fullText' (legacy field)
    const rawContent = raw.content || raw.fullText;
    const fullText = convertRichTextToHtml(rawContent);

    // Cover image
    const coverImage =
      extractUrl(raw.coverImage) ||
      '/placeholder.svg?height=400&width=600&text=Marketing+Project';

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
      fullText,
      coverImage,
      imageGallery,
      category,
      toolsUsed,
      tags,
      type,
      isFeatured: raw.isFeatured || false,
      projectDate,
      updatedAt: raw.updatedAt,
      readingTime: calculateReadingTime(fullText),
      seo,
    };
  } catch (err) {
    console.error('[MarketingInMotion] transform error', err, raw);
    return null;
  }
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function fetchMarketingProjects(
  page = 1,
  pageSize = 36,
): Promise<{ projects: MarketingProject[]; total: number; error: string | null }> {
  try {
    const response = await fetchFromStrapi<StrapiMarketingProjectsResponse>(
      'marketing-projects',
      {
        tags: ['strapi', 'marketing-projects'],
        // Cards and filters do not use the article body or gallery. Avoid
        // transferring them for every project on collection pages.
        queryParams: listQueryParams(page, pageSize),
      },
    );

    if (response.error) {
      return { projects: [], total: 0, error: response.error };
    }

    const raw = response.data?.data ?? [];
    const projects = raw
      .map(transformMarketingProject)
      .filter((p): p is MarketingProject => p !== null);

    const total = response.data?.meta?.pagination?.total ?? projects.length;

    return { projects, total, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { projects: [], total: 0, error: msg };
  }
}

export async function fetchMarketingProjectBySlug(
  slug: string,
): Promise<{ project: MarketingProject | null; error: string | null }> {
  try {
    const response = await fetchFromStrapi<StrapiMarketingProjectsResponse>(
      'marketing-projects',
      {
        tags: ['strapi', 'marketing-projects'],
        queryParams: {
          'filters[slug][$eq]': slug,
          populate: '*',
        },
      },
    );

    if (response.error) {
      return { project: null, error: response.error };
    }

    const raw = response.data?.data?.[0];
    if (!raw) return { project: null, error: null };

    const project = transformMarketingProject(raw);
    return { project, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { project: null, error: msg };
  }
}

export async function fetchRelatedMarketingProjects(
  category: string,
  currentSlug: string,
  limit = 3,
  timeout?: number
): Promise<{ projects: MarketingProject[]; error: string | null }> {
  if (!category || category === 'Uncategorized') {
    return { projects: [], error: null };
  }

  try {
    const response = await fetchFromStrapi<StrapiMarketingProjectsResponse>(
      'marketing-projects',
      {
        tags: ['strapi', 'marketing-projects'],
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
      .map(transformMarketingProject)
      .filter((p): p is MarketingProject => p !== null);

    return { projects, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { projects: [], error: msg };
  }
}

// ─── Filter Helpers ───────────────────────────────────────────────────────────

export function extractFilterOptions(projects: MarketingProject[]): FilterOptions {
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

export function formatProjectDate(dateString: string, locale = 'en-US'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Date unavailable';
  }
}

export function filterProjects(
  projects: MarketingProject[],
  search: string,
  filters: { category: string; tools: string; tag: string; type: string },
): MarketingProject[] {
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
