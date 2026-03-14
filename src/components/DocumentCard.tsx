'use client';

import { useState } from 'react';
import Image from 'next/image';

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

  const truncatedDescription = description.length > 150 && !showMore
    ? description.substring(0, 150) + '...'
    : description;

  const displayImage = (!coverImage || imageError) ? PLACEHOLDER_IMAGE : coverImage;

  return (
    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white border border-gray-200 w-full">
      
      {/* Mobile: stack vertically / Desktop: side by side */}
      <div className="flex flex-col sm:flex-row">

        {/* Image — full width on mobile, fixed width on desktop */}
        <div className="relative w-full sm:w-48 md:w-64 flex-shrink-0 bg-gray-100">
          <div className="relative w-full aspect-[16/9] sm:aspect-auto sm:h-full sm:min-h-[200px]">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority={false}
              unoptimized={displayImage.startsWith('https://')}
            />
            {/* File type badge */}
            {fileType && (
              <div className="absolute top-2 right-2 bg-[#191970] text-white px-2 py-0.5 rounded text-xs font-bold">
                {fileType}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">

          {/* Top */}
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#191970] mb-1.5 leading-snug">
              {title}
            </h3>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-gray-500 mb-3">
              {fileType && (
                <span className="font-medium text-gray-600">{fileType} Document</span>
              )}
              {fileType && formattedDate && (
                <span className="text-gray-300">•</span>
              )}
              <span>{formattedDate}</span>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-gray-700">
              <p className="leading-relaxed">{truncatedDescription}</p>
              {description.length > 150 && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-[#191970] hover:underline font-semibold text-xs mt-1.5 inline-block"
                >
                  {showMore ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </div>

          {/* Button — full width on mobile */}
          <button
            onClick={onViewClick}
            disabled={!documentUrl || isLoading}
            className={`w-full sm:w-fit px-6 py-2.5 sm:py-2 rounded font-semibold transition-colors duration-200 text-sm ${
              documentUrl && !isLoading
                ? 'bg-[#191970] text-white hover:bg-[#0f0f4d] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Loading...' : documentUrl ? 'View Document' : 'No Document Available'}
          </button>

        </div>
      </div>
    </div>
  );
}