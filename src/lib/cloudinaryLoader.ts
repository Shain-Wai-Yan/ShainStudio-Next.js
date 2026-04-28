/**
 * Cloudinary Custom Image Loader for Next.js
 *
 * Used as a PROP-LEVEL loader on individual <Image> components that display
 * Cloudinary content (CMS images, project photos, etc.). This keeps Next.js's
 * built-in /_next/image engine alive for local public assets (logo, profile, etc.).
 *
 * Usage:
 *   import cloudinaryLoader from '@/lib/cloudinaryLoader';
 *   <Image loader={cloudinaryLoader} src={project.imageUrl} ... />
 *
 * Architecture:
 *   Local /public files   → Next.js default engine  (WebP via /_next/image)
 *   res.cloudinary.com/…  → This loader             (c_limit, q_auto, f_auto)
 *
 * Next.js calls this function once per srcset breakpoint it generates
 * (640w, 750w, 828w, 1080w, 1200w …), so the browser receives a full srcset
 * and picks the smallest image that fits the viewport.
 *
 * Cloudinary transformation params:
 *   c_limit  – scale down only, never upscale
 *   w_<n>    – target width supplied by Next.js per breakpoint
 *   q_auto   – smart compression (best/good/eco/low chosen per-image)
 *   f_auto   – optimal format (WebP/AVIF for modern browsers, JPEG/PNG fallback)
 */

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Safety guard: if a non-Cloudinary URL is passed, return raw src to prevent a crash
  if (!src.includes('cloudinary.com')) return src;

  const urlParts = src.split('/upload/');
  if (urlParts.length !== 2) return src;

  const [baseUrl, fileAndParams] = urlParts;

  /**
   * Strip any pre-existing Cloudinary transformation segment so transforms
   * don't stack. Guards against URLs already processed by optimizeCloudinaryUrl
   * or optimizeCloudinaryUrlWithWidth utilities in cloudinary-optimizer.ts.
   *
   * Cloudinary URL patterns after /upload/:
   *   1. Raw:              v1234567890/folder/image.jpg
   *   2. Transforms only:  f_auto,q_auto/folder/image.jpg
   *   3. Transforms+ver:   c_scale,w_800,q_auto,f_auto/v1234567890/folder/image.jpg
   *
   * A transform segment contains Cloudinary param chars (_ , :) and is NOT
   * a version token (v<digits>).
   */
  const segments = fileAndParams.split('/');
  const isVersionToken = (s: string) => /^v\d+$/.test(s);
  const isTransformSegment = (s: string) => /[_,:]/.test(s) && !isVersionToken(s);

  const cleanSegments = isTransformSegment(segments[0])
    ? segments.slice(1)
    : segments;

  const cleanFile = cleanSegments.join('/');
  const q = quality ?? 'auto';

  return `${baseUrl}/upload/c_limit,w_${width},q_${q},f_auto/${cleanFile}`;
}
