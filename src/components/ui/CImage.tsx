'use client';

import Image, { ImageProps } from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

/**
 * CImage (Cloudinary Image) Component
 * A wrapper around Next.js <Image /> that automatically applies the custom Cloudinary loader
 * if the source URL is from Cloudinary. This ensures responsive srcsets and optimized
 * delivery for CMS assets while using native optimization for local assets.
 */
export default function CImage(props: ImageProps) {
  const { src, loader, alt, ...rest } = props;

  // Determine if the image should use the custom Cloudinary loader
  const isCloudinary = typeof src === 'string' && src.includes('cloudinary.com');

  return (
    <Image
      src={src}
      loader={isCloudinary ? cloudinaryLoader : loader}
      alt={alt || ""}
      {...rest}
    />
  );
}
