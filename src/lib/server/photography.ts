import 'server-only';
import { getPhotography } from './photography-data';
import type { Photo } from '@/lib/strapi/photography';
export async function fetchAllPhotography(language: 'en' | 'zh' = 'en', options: { page?: number; pageSize?: number } = {}) {
  try {
    return await getPhotography(new URLSearchParams({ language, page: String(options.page ?? 1), pageSize: String(options.pageSize ?? 20) }));
  } catch {
    return { photos: [] as Photo[], total: 0, pageCount: 0, error: 'Photography is temporarily unavailable.' };
  }
}
