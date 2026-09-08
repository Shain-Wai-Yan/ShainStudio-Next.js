export interface Photo {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  location: string;
  category?: string;   // always a plain string — never an object
  categorySlug?: string;
  image: string | null;
  width?: number;      // intrinsic pixel width  — reserves aspect ratio (no CLS)
  height?: number;     // intrinsic pixel height — reserves aspect ratio (no CLS)
  altText?: string;    // dedicated CMS alt text (falls back to title downstream)
  tags?: string[];     // always string[] — never objects
  language: 'en' | 'zh';
  createdAt: string;
  updatedAt: string;
}

export type PhotographyLocale = 'en' | 'zh';

export interface PhotoFeedQuery {
  page: number;
  pageSize: number;
  seed: number;
  collection?: string;
  search?: string;
  language: PhotographyLocale;
}

export interface PhotoSearchQuery extends PhotoFeedQuery { search: string }

export interface PhotoFeedPage {
  photos: Photo[];
  page: number;
  pageCount: number;
  total: number;
  hasMore: boolean;
}

export interface PhotoCollection {
  name: string;
  slug: string;
  count: number;
  thumbnail: string | null;
}
