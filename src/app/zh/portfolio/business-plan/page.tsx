'use client';

import { useEffect, useState } from 'react';
import { fetchBusinessPlans, transformBusinessPlan, type BusinessPlan } from '@/lib/strapi/business-plans';
import { DocumentGrid } from '@/components/DocumentGrid';
import { DocumentViewer } from '@/components/DocumentViewer';
import { Breadcrumb } from '@/components/Breadcrumb';

interface TransformedPlan extends Omit<BusinessPlan, 'DocumentFile' | 'CoverImage'> {
  documentUrl: string;
  coverImageUrl: string;
  fileType: string;
  formattedDate: string;
}

export default function BusinessPlanPageZH() {
  const [plans, setPlans] = useState<TransformedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<TransformedPlan | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    loadBusinessPlans();
  }, []);

  const loadBusinessPlans = async () => {
    setIsLoading(true);
    setError(null);

    const { plans: fetchedPlans, error: fetchError } = await fetchBusinessPlans();

    if (fetchError) {
      setError(fetchError);
      setPlans([]);
    } else {
      const transformedPlans = fetchedPlans.map(transformBusinessPlan) as TransformedPlan[];
      setPlans(transformedPlans);
    }

    setIsLoading(false);
  };

  const handleDocumentClick = (document: TransformedPlan) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    setSelectedDocument(null);
  };

  const breadcrumbItems = [
    { label: '首页', href: '/zh' },
    { label: '作品集', href: '/zh/portfolio' },
    { label: '商业战略', href: '/zh/portfolio/business-plan' },
  ];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              商业战略规划
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              系统化的战略规划方案，助力品牌提升市场定位，实现业务持续增长。
            </p>
          </div>

          {/* Document Grid */}
          <section aria-labelledby="documents-heading">
            <h2 id="documents-heading" className="sr-only">
              商业战略文档
            </h2>
            <DocumentGrid
              documents={plans}
              isLoading={isLoading}
              error={error}
              onDocumentClick={handleDocumentClick}
              onRetry={loadBusinessPlans}
              emptyMessage="暂无可用的商业战略文档。"
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
