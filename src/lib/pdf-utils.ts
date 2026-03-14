/**
 * PDF Utilities
 * Handles PDF file transformations and URL processing for protected documents
 */

/**
 * Transforms a Cloudinary PDF URL to attachment mode (for download/viewing protected files)
 * This allows viewing PDFs that would otherwise be embedded inline
 */
export function transformCloudinaryPdfUrl(cloudinaryUrl: string): string {
  if (!cloudinaryUrl) return '';

  // Check if it's a Cloudinary URL
  if (!cloudinaryUrl.includes('cloudinary')) {
    return cloudinaryUrl;
  }

  // If already has fl_attachment, return as is
  if (cloudinaryUrl.includes('fl_attachment')) {
    return cloudinaryUrl;
  }

  // Insert fl_attachment transformation
  // Cloudinary URL pattern: https://res.cloudinary.com/[cloud]/image/upload/[transformations]/[file]
  const urlParts = cloudinaryUrl.split('/upload/');

  if (urlParts.length === 2) {
    const baseUrl = urlParts[0];
    const fileAndParams = urlParts[1];

    // If transformations already exist (no direct filename after /upload/)
    if (fileAndParams.includes('/')) {
      return `${baseUrl}/upload/fl_attachment/${fileAndParams}`;
    } else {
      // No transformations, add directly
      return `${baseUrl}/upload/fl_attachment/${fileAndParams}`;
    }
  }

  return cloudinaryUrl;
}

/**
 * Checks if a URL points to a PDF file
 */
export function isPdfUrl(url: string): boolean {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('pdf');
}

/**
 * Checks if a URL points to a PowerPoint file
 */
export function isPowerPointUrl(url: string): boolean {
  if (!url) return false;
  const extension = url.toLowerCase().split('.').pop();
  return ['ppt', 'pptx'].includes(extension || '');
}

/**
 * Gets the file type from a URL
 */
export function getFileType(url: string): 'pdf' | 'pptx' | 'unknown' {
  if (isPdfUrl(url)) return 'pdf';
  if (isPowerPointUrl(url)) return 'pptx';
  return 'unknown';
}

/**
 * Extracts filename from URL
 */
export function getFilenameFromUrl(url: string): string {
  if (!url) return 'document';
  const urlWithoutQuery = url.split('?')[0];
  const parts = urlWithoutQuery.split('/');
  const filename = parts[parts.length - 1];
  return filename || 'document';
}
