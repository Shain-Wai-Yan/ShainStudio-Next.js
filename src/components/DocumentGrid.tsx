'use client';

import { DocumentCard } from './DocumentCard';

interface Document {
  id: number;
  Title: string;
  Description: string;
  formattedDate: string;
  coverImageUrl: string;
  fileType: string;
  documentUrl: string;
}

interface DocumentGridProps {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  onDocumentClick: (document: Document) => void;
  onRetry?: () => void;
  emptyMessage?: string;
}

export function DocumentGrid({
  documents,
  isLoading,
  error,
  onDocumentClick,
  onRetry,
  emptyMessage = 'No documents found.',
}: DocumentGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#333333] animate-pulse flex flex-row h-44">
            <div className="w-36 sm:w-48 bg-gray-300 dark:bg-[#3a3a3a] flex-shrink-0" />
            <div className="flex-1 p-5 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-[#3a3a3a] rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-[#3a3a3a] rounded w-1/4" />
              <div className="h-16 bg-gray-200 dark:bg-[#3a3a3a] rounded" />
              <div className="h-8 bg-gray-200 dark:bg-[#3a3a3a] rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-8 text-center">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-2">Error Loading Documents</h3>
        <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-block px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border-2 border-gray-200 dark:border-[#333333] bg-gray-50 dark:bg-[#2a2a2a] p-12 text-center">
        <p className="text-gray-600 dark:text-[#b0b0b0] text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          title={document.Title}
          description={document.Description}
          coverImage={document.coverImageUrl}
          fileType={document.fileType}
          formattedDate={document.formattedDate}
          documentUrl={document.documentUrl}
          onViewClick={() => onDocumentClick(document)}
        />
      ))}
    </div>
  );
}
