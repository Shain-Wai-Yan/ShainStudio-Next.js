/**
 * Certificates Strapi Integration
 * Fetches professional certificates from Strapi CMS
 */

import { fetchFromStrapi, extractUrl } from './client';
import { StrapiFile } from '@/types/strapi';


export interface Certificate {
  id: number;
  Title: string;
  Description: string;
  Image: StrapiFile | StrapiFile[] | string; // Fixed: was CertificateImage
  Issuer: string; // Fixed: was IssuedBy
  Date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificatesResponse {
  data: Certificate[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Fetches certificates from Strapi
 */
export async function fetchCertificates(): Promise<{
  certificates: Certificate[];
  error: string | null;
}> {
  try {
    const response = await fetchFromStrapi<CertificatesResponse>('certificates', {
      revalidate: 3600,
      tags: ['strapi', 'certificates'],
      queryParams: {
        'populate': '*',
        'sort': 'createdAt:desc',
      },
    });

    if (response.error) {
      return { certificates: [], error: response.error };
    }

    const certificates = response.data?.data || [];

    return {
      certificates,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Certificates] Error fetching:', errorMessage);
    return { certificates: [], error: errorMessage };
  }
}

/**
 * Transforms a certificate for display
 */
export function transformCertificate(certificate: Certificate) {
  const imageUrl = extractUrl(certificate.Image); // Fixed: was certificate.CertificateImage


  // Parse date
  const date = new Date(certificate.Date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Clean up "Issuer: X" or "Issuer : X" prefix from the Issuer field
  const cleanedIssuedBy = certificate.Issuer
    ? certificate.Issuer.replace(/^Issuer\s*:\s*/i, '').trim()
    : '';

  return {
    ...certificate,
    IssuedBy: cleanedIssuedBy, // expose as IssuedBy so components don't need changing
    imageUrl,
    formattedDate,
  };
}
