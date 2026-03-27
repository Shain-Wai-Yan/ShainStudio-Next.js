/**
 * Strapi API Data Types
 * Supports both Strapi v5 (flat) and v4 (nested) structures
 */

export interface StrapiImageAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: Record<string, unknown> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiImageData {
  id: number;
  attributes: StrapiImageAttributes;
}

export interface StrapiImageWrapper {
  data: StrapiImageData | null;
}

export interface StrapiFileV5 {
  id: number;
  url: string;
  name?: string;
  alternativeText?: string;
  caption?: string;
  [key: string]: unknown;
}

export type StrapiFile = StrapiFileV5 | StrapiImageWrapper | StrapiImageWrapper[] | string;
