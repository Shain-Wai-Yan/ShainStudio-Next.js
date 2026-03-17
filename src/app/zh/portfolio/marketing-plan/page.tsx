'use client';

import { useEffect, useState } from 'react';
import { fetchMarketingPlans, transformMarketingPlan, type MarketingPlan } from '@/lib/strapi/marketing-plans';
import { DocumentGrid } from '@/components/DocumentGrid';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Breadcrumb } from '@/components/Breadcrumb';

// Match the Document interface from DocumentGrid
interface Document {
  id: number;
  Title: string;
  Description: string;
  formattedDate: string;
  coverImageUrl: string;
  fileType: string;
  documentUrl: string;
}

interface TransformedPlan extends Document {
  // All Document properties are inherited: id, Title, Description, formattedDate, coverImageUrl, fileType, documentUrl
  // Add any additional properties your transformed plan needs here
}

export default function MarketingPlanPageZH() {
  const [plans, setPlans] = useState<TransformedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<TransformedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    loadMarketingPlans();
  }, []);

  const loadMarketingPlans = async () => {
    setIsLoading(true);
    setError(null);

    const { plans: fetchedPlans, error: fetchError } = await fetchMarketingPlans();

    if (fetchError) {
      setError(fetchError);
      setPlans([]);
    } else {
      const transformedPlans = fetchedPlans.map(transformMarketingPlan) as TransformedPlan[];
      setPlans(transformedPlans);
    }

    setIsLoading(false);
  };

  const handleDocumentClick = (document: Document) => {
    // Document type is already compatible with TransformedPlan
    setSelectedDocument(document as TransformedPlan);
    setIsViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  const breadcrumbItems = [
    { label: '首页', href: '/zh' },
    { label: '作品集', href: '/zh/portfolio' },
    { label: '营销方案', href: '/zh/portfolio/marketing-plan' },
  ];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#121212] dark:to-[#1e1e1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-[#d4af37] mb-4">
              营销方案
            </h1>
            <p className="text-xl text-gray-600 dark:text-[#b0b0b0] max-w-2xl">
              创新的营销策略，专为提升品牌知名度和市场影响力而设计。
            </p>
          </div>

          {/* Document Grid */}
          <section aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">
              营销方案文档
            </h2>
            <DocumentGrid
              documents={plans}
              isLoading={isLoading}
              error={error}
              onDocumentClick={handleDocumentClick}
              onRetry={loadMarketingPlans}
              emptyMessage="暂无可用的营销方案文档。"
            />
          </section>
        </div>
      </main>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={isViewerOpen}
          documentUrl={selectedDocument.documentUrl}
          title={selectedDocument.Title}
          onClose={handleViewerClose}
        />
      )}
    </>
  );
}