import 'server-only';
import { localizedSource } from '@/lib/server/localized-content';
import type { ContentLocale } from '@/types/localization';
import {
  fetchMarketingProjectBySlug,
  fetchMarketingProjects,
} from '@/lib/strapi/marketing-in-motion';
import {
  fetchCodingProjectBySlug,
  fetchCodingProjects,
} from '@/lib/strapi/coding-projects';


const loadMarketingProjects = (
  async (page: number, pageSize: number, locale: ContentLocale) => {
    const result = await fetchMarketingProjects(page, pageSize, localizedSource(locale));
    if (result.error) throw new Error(result.error);
    return result;
  }
);

const loadMarketingProject = (
  async (slug: string, locale: ContentLocale) => {
    const result = await fetchMarketingProjectBySlug(slug, localizedSource(locale));
    if (result.error) throw new Error(result.error);
    return result.project;
  }
);

const loadRelatedMarketingProjects = (
  async (category: string, currentSlug: string, limit: number, locale: ContentLocale) => {
    const result = await loadMarketingProjects(1, 100, locale);
    return result.projects
      .filter(project => project.slug !== currentSlug && project.category === category)
      .slice(0, limit);
  }
);

const loadCodingProjects = (
  async (page: number, pageSize: number, locale: ContentLocale) => {
    const result = await fetchCodingProjects(page, pageSize, localizedSource(locale));
    if (result.error) throw new Error(result.error);
    return result;
  }
);

const loadCodingProject = (
  async (slug: string, locale: ContentLocale) => {
    const result = await fetchCodingProjectBySlug(slug, localizedSource(locale));
    if (result.error) throw new Error(result.error);
    return result.project;
  }
);

const loadRelatedCodingProjects = (
  async (category: string, currentSlug: string, limit: number, locale: ContentLocale) => {
    const result = await loadCodingProjects(1, 100, locale);
    return result.projects
      .filter(project => project.slug !== currentSlug && project.category === category)
      .slice(0, limit);
  }
);

export async function getMarketingProjects(page = 1, pageSize = 36, locale: ContentLocale = 'en') {
  try {
    return await loadMarketingProjects(page, pageSize, locale);
  } catch (error) {
    return { projects: [], total: 0, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getMarketingProject(slug: string, locale: ContentLocale = 'en') {
  try {
    return { project: await loadMarketingProject(slug, locale), error: null };
  } catch (error) {
    return { project: null, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getRelatedMarketingProjects(category: string, currentSlug: string, limit = 3, locale: ContentLocale = 'en') {
  try {
    return { projects: await loadRelatedMarketingProjects(category, currentSlug, limit, locale), error: null };
  } catch (error) {
    return { projects: [], error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getCodingProjects(page = 1, pageSize = 100, locale: ContentLocale = 'en') {
  try {
    return await loadCodingProjects(page, pageSize, locale);
  } catch (error) {
    return { projects: [], total: 0, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getCodingProject(slug: string, locale: ContentLocale = 'en') {
  try {
    return { project: await loadCodingProject(slug, locale), error: null };
  } catch (error) {
    return { project: null, error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}

export async function getRelatedCodingProjects(category: string, currentSlug: string, limit = 3, locale: ContentLocale = 'en') {
  try {
    return { projects: await loadRelatedCodingProjects(category, currentSlug, limit, locale), error: null };
  } catch (error) {
    return { projects: [], error: error instanceof Error ? error.message : 'CMS unavailable' };
  }
}
