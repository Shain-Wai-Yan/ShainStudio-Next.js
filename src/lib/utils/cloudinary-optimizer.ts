/**
 * Cloudinary Image Optimization Utility
 * Automatically adds f_auto and q_auto parameters to Cloudinary URLs
 */

/**
 * Optimizes a Cloudinary image URL by adding auto-format and auto-quality
 * Only applies to Cloudinary URLs; other URLs pass through unchanged
 * 
 * @param url - The image URL (Cloudinary or external)
 * @returns Optimized URL with f_auto,q_auto if Cloudinary, otherwise unchanged
 */
export function optimizeCloudinaryUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Only optimize Cloudinary URLs
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // If already has optimization parameters, return as-is
  if (url.includes('f_auto') && url.includes('q_auto')) {
    return url;
  }

  // Insert optimization parameters after /upload/
  // Pattern: https://res.cloudinary.com/[cloud]/image/upload/[transformations]/[file]
  const urlParts = url.split('/upload/');

  if (urlParts.length === 2) {
    const baseUrl = urlParts[0];
    const fileAndParams = urlParts[1];

    // Add f_auto (auto format) and q_auto (auto quality)
    return `${baseUrl}/upload/f_auto,q_auto/${fileAndParams}`;
  }

  // Fallback if URL structure is unexpected
  return url;
}

/**
 * Optimizes Cloudinary URLs with responsive sizing
 * Adds auto-format, auto-quality, and width constraints
 * 
 * @param url - The image URL
 * @param width - Desired width in pixels
 * @returns Optimized URL with responsive transformations
 */
export function optimizeCloudinaryUrlWithWidth(url: string | null | undefined, width: number): string {
  if (!url) return '';

  // Only optimize Cloudinary URLs
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // If already has optimization parameters, return as-is
  if (url.includes('c_scale') || url.includes('w_')) {
    return url;
  }

  const urlParts = url.split('/upload/');

  if (urlParts.length === 2) {
    const baseUrl = urlParts[0];
    const fileAndParams = urlParts[1];

    // Add c_scale (scale/limit), width constraint, auto quality, and auto format
    return `${baseUrl}/upload/c_scale,w_${width},q_auto,f_auto/${fileAndParams}`;
  }

  return url;
}

/**
 * Creates a blur-down placeholder for lazy loading
 * Only works with Cloudinary URLs
 * 
 * @param url - The image URL
 * @returns Blurred low-res placeholder URL or undefined
 */
export function createCloudinaryBlurPlaceholder(url: string | null | undefined): string | undefined {
  if (!url?.includes('cloudinary.com')) return undefined;

  // Don't create blur for already-optimized URLs
  if (url.includes('c_') || url.includes('w_')) return undefined;

  const urlParts = url.split('/upload/');

  if (urlParts.length === 2) {
    const baseUrl = urlParts[0];
    const fileAndParams = urlParts[1];

    // Create a heavily blurred, tiny version for placeholder
    // c_scale, w_20 (20px width), q_10 (very low quality), e_blur:400 (heavy blur)
    return `${baseUrl}/upload/c_scale,w_20,q_10,f_auto,e_blur:400/${fileAndParams}`;
  }

  return undefined;
}
