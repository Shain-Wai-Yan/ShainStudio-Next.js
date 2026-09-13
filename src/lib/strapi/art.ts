/**
 * Strapi Art Collection Types
 * Matches the Strapi "arts" collection schema for Pencil Art and Sketchbook showcase.
 */

export interface ArtPiece {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  image: string;
  width?: number;
  height?: number;
  altText?: string;
  dateCreated?: string;
  description?: string; // HTML from plugin::portfolio-editor.html
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ArtGalleryPiece = Pick<
  ArtPiece,
  'id' | 'title' | 'slug' | 'image' | 'width' | 'height' | 'altText'
>;

export type ArtNavigationPiece = Pick<ArtPiece, 'title' | 'slug'>;

export type ArtLocale = 'en' | 'zh';

export interface ArtQueryOptions {
  page?: number;
  pageSize?: number;
  featured?: boolean;
}

export interface ArtFeedPage {
  arts: ArtPiece[];
  page: number;
  pageCount: number;
  total: number;
}
