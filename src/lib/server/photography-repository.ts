import 'server-only';
import type { Photo, PhotoCollection, PhotoFeedPage, PhotoFeedQuery, PhotoSearchQuery, PhotographyLocale } from '@/lib/strapi/photography';

export interface PhotographyRepository {
  getFeed(input: PhotoFeedQuery): Promise<PhotoFeedPage>;
  search(input: PhotoSearchQuery): Promise<PhotoFeedPage>;
  getCollections(language: PhotographyLocale): Promise<PhotoCollection[]>;
  getPhoto(documentId: string, language: PhotographyLocale): Promise<Photo | null>;
  getRelated(photo: Photo, limit: number): Promise<Photo[]>;
  getSitemapPhotos(): Promise<Photo[]>;
}
