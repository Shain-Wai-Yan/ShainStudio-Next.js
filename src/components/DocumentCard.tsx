'use client';

import { useState } from 'react';
import CImage from '@/components/ui/CImage';

const PLACEHOLDER_IMAGE = '/images/shain studio.png';

interface DocumentCardProps {
  title: string;
  description: string;
  coverImage: string;
  fileType: string;
  formattedDate: string;
  documentUrl: string;
  onViewClick: () => void;
  isLoading?: boolean;
}

// Simple function to make <a> tags in description open in new tab safely
function sanitizeDescription(html: string): string {
  return html.replace(
    /<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="desc-link">$2</a>'
  );
}

export function DocumentCard({
  title,
  description,
  coverImage,
  fileType,
  formattedDate,
  documentUrl,
  onViewClick,
  isLoading = false,
}: DocumentCardProps) {
  const [showMore, setShowMore] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if description contains HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(description);

  const truncatedDescription = description.length > 150 && !showMore
    ? description.substring(0, 150) + '...'
    : description;

  const sanitizedFull = sanitizeDescription(description);
  const sanitizedTruncated = !showMore && description.length > 150
    ? sanitizeDescription(description.substring(0, 150)) + '...'
    : sanitizedFull;

  const displayImage = (!coverImage || imageError) ? PLACEHOLDER_IMAGE : coverImage;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#333333] w-full">

      {/* Inline styles for description links */}
      <style>{`
        .desc-link {
          color: #2563eb;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .desc-link:hover {
          color: #1d4ed8;
        }
        .dark .desc-link {
          color: #60a5fa;
        }
        .dark .desc-link:hover {
          color: #93c5fd;
        }
      `}</style>

      {/* Mobile: stack vertically / Desktop: side by side */}
      <div className="flex flex-col sm:flex-row">

        {/* Image */}
        <div className="relative w-full sm:w-56 md:w-80 lg:w-96 flex-shrink-0 bg-gray-100 dark:bg-[#3a3a3a]">
          <div className="relative w-full aspect-[16/9] sm:aspect-auto sm:h-full sm:min-h-[200px]">
            <CImage
              src={displayImage}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 300px, 400px"
            />
            {fileType && (
              <div className="absolute top-2 right-2 bg-[#191970] dark:bg-[#a67c00] text-white dark:text-[#0f0f45] px-2 py-0.5 rounded text-xs font-bold">
                {fileType}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">

          {/* Top */}
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#191970] dark:text-[#d4af37] mb-1.5 leading-snug">
              {title}
            </h3>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-[#999999] mb-3">
              {fileType && (
                <span className="font-medium text-gray-600 dark:text-[#b0b0b0]">{fileType} Document</span>
              )}
              {fileType && formattedDate && (
                <span className="text-gray-300 dark:text-[#666666]">•</span>
              )}
              <span>{formattedDate}</span>
            </div>

            {/* Description — renders HTML links if present, plain text otherwise */}
            <div className="text-xs sm:text-sm text-gray-700 dark:text-[#cccccc]">
              {hasHtml ? (
                <p
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizedTruncated }}
                />
              ) : (
                <p className="leading-relaxed">{truncatedDescription}</p>
              )}
              {description.length > 150 && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-[#191970] dark:text-[#a67c00] hover:underline font-semibold text-xs mt-1.5 inline-block"
                >
                  {showMore ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={onViewClick}
            disabled={!documentUrl || isLoading}
            className={`w-full sm:w-fit px-6 py-2.5 sm:py-2 rounded font-semibold transition-colors duration-200 text-sm ${
              documentUrl && !isLoading
                ? 'bg-[#191970] dark:bg-[#a67c00] text-white dark:text-[#0f0f45] hover:bg-[#0f0f4d] dark:hover:bg-[#c9a236] cursor-pointer'
                : 'bg-gray-300 dark:bg-[#3a3a3a] text-gray-500 dark:text-[#999999] cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Loading...' : documentUrl ? 'View Document' : 'No Document Available'}
          </button>

        </div>
      </div>
    </div>
  );
}
