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
  let url: URL;
  try { url = new URL(src); } catch { return src; }
  if (url.hostname !== 'res.cloudinary.com') return src;
  const marker = '/image/upload/';
  const offset = url.pathname.indexOf(marker);
  if (offset === -1) return src;
  const prefix = url.pathname.slice(0, offset + marker.length);
  const segments = url.pathname.slice(offset + marker.length).split('/');
  // Recognize transformation syntax, never arbitrary underscores in a public ID.
  const transform = /^(?:a|ar|b|bo|c|co|d|dn|dpr|e|f|fl|g|h|l|o|q|r|t|u|w|x|y|z)_/;
  let index = 0;
  while (index < segments.length - 1 && transform.test(segments[index])) index++;
  // Signed delivery URLs cannot be rewritten without invalidating the signature.
  if (/^s--/.test(segments[0])) return src;
  segments.splice(index, 0, `c_limit,w_${Math.max(1, Math.round(width))},q_${quality ?? 'auto'},f_auto`);
  url.pathname = prefix + segments.join('/');
  return url.toString();
}
