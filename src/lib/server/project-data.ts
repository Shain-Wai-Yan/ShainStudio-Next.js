import 'server-only';
import { unstable_cache } from 'next/cache';
import {
  fetchMarketingProjectBySlug,
  fetchMarketingProjects,
} from '@/lib/strapi/marketing-in-motion';
import {
  fetchCodingProjectBySlug,
  fetchCodingProjects,
} from '@/lib/strapi/coding-projects';

const CACHE_SECONDS = 300;

const loadMarketingProjects = unstable_cache(
  async (page: number, pageSize: number) => {
    const result = await fetchMarketingProjects(page, pageSize);
    if (result.error) throw new Error(result.error);
    return result;
  },
  ['strapi-marketing-projects'],
  { revalidate: CACHE_SECONDS, tags: ['strapi', 'marketing-projects'] },
);

const loadMarketingProject = unstable_cache(
  async (slug: string) => {
    const result = await fetchMarketingProjectBySlug(slug);
    if (result.error) throw new Error(result.error);
    return result.project;
  },
  ['strapi-marketing-project'],
  { revalidate: CACHE_SECONDS, tags: ['strapi', 'marketing-projects'] },
);

const loadRelatedMarketingProjects = unstable_cache(
  async (category: string, currentSlug: string, limit: number) => {
    const result = await loadMarketingProjects(1, 100);
    return result.projects
      .filter(project => project.slug !== currentSlug && project.category === category)
      .slice(0, limit);
  },
  ['strapi-related-marketing-projects'],
  { revalidate: CACHE_SECONDS, tags: ['strapi', 'marketing-projects'] },
);

const loadCodingProjects = unstable_cache(
  async (page: number, pageSize: number) => {
    const result = await fetchCodingProjects(page, pageSize);
    if (result.error) throw new Error(result.error);
    return result;
  },
  ['strapi-coding-projects'],
  { revalidate: CACHE_SECONDS, tags: ['strapi', 'coding-projects'] },
);

const loadCodingProject = unstable_cache(
  async (slug: string) => {
    const result = await fetchCodingProjectBySlug(slug);
    if (result.error) throw new Error(result.error);
    return result.project;
  },
  ['strapi-coding-project'],
  { revalidate: CACHE_SECONDS, tags: ['strapi', 'coding-projects'] },
);

const loadRelatedCodingProjects = unstable_cache(
  async (category: string, currentSlug: string, limit: number) => {
    const result = await loadCodingProjects(1, 100);
    return result.projects
      .filter(project => project.slug !== currentSlug && project.category === category)
      .slice(0, limit);
  },
  ['strapi-related-coding-projects'],
  { revalidate: CACHE_SECONDS, tags: ['strapi', 'coding-projects'] },
);

export async function getMarketingProjects(page = 1, pageSize = 36) {
  try {
    return await loadMarketingProjects(page, pageSize);
  } catch (error) {
    return { projects: [], total: 0, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getMarketingProject(slug: string) {
  try {
    return { project: await loadMarketingProject(slug), error: null };
  } catch (error) {
    return { project: null, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getRelatedMarketingProjects(category: string, currentSlug: string, limit = 3) {
  try {
    return { projects: await loadRelatedMarketingProjects(category, currentSlug, limit), error: null };
  } catch (error) {
    return { projects: [], error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getCodingProjects(page = 1, pageSize = 100) {
  try {
    return await loadCodingProjects(page, pageSize);
  } catch (error) {
    return { projects: [], total: 0, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getCodingProject(slug: string) {
  try {
    return { project: await loadCodingProject(slug), error: null };
  } catch (error) {
    return { project: null, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getRelatedCodingProjects(category: string, currentSlug: string, limit = 3) {
  try {
    return { projects: await loadRelatedCodingProjects(category, currentSlug, limit), error: null };
  } catch (error) {
    return { projects: [], error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}
