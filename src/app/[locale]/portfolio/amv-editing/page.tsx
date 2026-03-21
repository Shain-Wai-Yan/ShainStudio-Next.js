'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import AMVHeader from '@/components/amv-editing/AMVHeader';
import ChannelInfo from '@/components/amv-editing/ChannelInfo';
import FeaturedVideo from '@/components/amv-editing/FeaturedVideo';
import VideoGrid from '@/components/amv-editing/VideoGrid';
import { transformVideoData, type TransformedVideo } from '@/lib/youtube-utils';
import { getDictionarySync } from '@/lib/getDictionary';

interface ChannelData {
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

interface YouTubeApiResponse {
  items: Array<{
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        high?: {
          url?: string;
        };
      };
      resourceId?: {
        videoId?: string;
      };
      publishedAt?: string;
      channelTitle?: string;
    };
    statistics?: {
      subscriberCount?: string;
      videoCount?: string;
      viewCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
    brandingSettings?: {
      image?: {
        bannerExternalUrl?: string;
      };
    };
  }>;
  nextPageToken?: string;
}

export default function AMVEditingPage() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/zh') ? 'zh' : 'en';
  const t = getDictionarySync(locale);

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<TransformedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockChannelData: ChannelData = useMemo(() => ({
    title: t.amvEditing.mockChannel.title,
    description: t.amvEditing.mockChannel.description,
    subscriberCount: t.amvEditing.mockChannel.subscriberCount,
    videoCount: t.amvEditing.mockChannel.videoCount,
    avatarUrl: '/images/Shain Studio.png',
  }), [t]);

  const mockVideos = useMemo(() => [
    {
      id: 'video1',
      snippet: {
        resourceId: { videoId: '8aIsh6rfW4U' },
        title: t.amvEditing.mockVideos[0].title,
        description: t.amvEditing.mockVideos[0].description,
        thumbnails: { high: { url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Puss+in+Boots' } },
        publishedAt: '2022-01-01T00:00:00Z',
        channelTitle: t.amvEditing.mockChannel.title,
      },
      statistics: { viewCount: '6200' },
      contentDetails: { duration: 'PT1M' },
    },
    {
      id: 'video2',
      snippet: {
        resourceId: { videoId: 'dQw4w9WgXcQ' },
        title: t.amvEditing.mockVideos[1].title,
        description: t.amvEditing.mockVideos[1].description,
        thumbnails: { high: { url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Best+Waifu' } },
        publishedAt: '2022-02-01T00:00:00Z',
        channelTitle: t.amvEditing.mockChannel.title,
      },
      statistics: { viewCount: '542' },
      contentDetails: { duration: 'PT12S' },
    },
    {
      id: 'video3',
      snippet: {
        resourceId: { videoId: 'LLdGSTceP8c' },
        title: t.amvEditing.mockVideos[2].title,
        description: t.amvEditing.mockVideos[2].description,
        thumbnails: { high: { url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Levi+Ackerman' } },
        publishedAt: '2022-03-01T00:00:00Z',
        channelTitle: t.amvEditing.mockChannel.title,
      },
      statistics: { viewCount: '1200' },
      contentDetails: { duration: 'PT8S' },
    },
  ], [t]);

  // ─── Fetch ALL pages from the paginated YouTube API
  const fetchAllVideos = useCallback(async (): Promise<YouTubeApiResponse['items']> => {
    const allItems: YouTubeApiResponse['items'] = [];
    let pageToken: string | null = null;

    do {
      const url: string = pageToken
        ? `/api/amv-editing?endpoint=videos&maxResults=50&pageToken=${encodeURIComponent(pageToken)}`
        : `/api/amv-editing?endpoint=videos&maxResults=50`;

      const res: Response = await fetch(url);
      if (!res.ok) throw new Error(`Videos API error: ${res.status}`);

      const data: YouTubeApiResponse = await res.json();

      if (data.items && data.items.length > 0) {
        allItems.push(...data.items);
      }

      pageToken = data.nextPageToken ?? null;
    } while (pageToken);

    return allItems;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [channelRes, allVideoItems] = await Promise.all([
        fetch('/api/amv-editing?endpoint=channel'),
        fetchAllVideos(),
      ]);

      if (!channelRes.ok) throw new Error('Channel API request failed');

      const channelRawData: YouTubeApiResponse = await channelRes.json();

      // Transform channel data
      if (channelRawData.items && channelRawData.items.length > 0) {
        const channelItem = channelRawData.items[0];
        setChannelData({
          title: channelItem.snippet?.title || mockChannelData.title,
          description: channelItem.snippet?.description || mockChannelData.description,
          subscriberCount: channelItem.statistics?.subscriberCount || mockChannelData.subscriberCount,
          videoCount: channelItem.statistics?.videoCount || mockChannelData.videoCount,
          avatarUrl: channelItem.snippet?.thumbnails?.high?.url || mockChannelData.avatarUrl,
          bannerUrl: channelItem.brandingSettings?.image?.bannerExternalUrl,
        });
      } else {
        setChannelData(mockChannelData);
      }

      // Transform ALL video data
      if (allVideoItems.length > 0) {
        const transformedVideos = allVideoItems.map(transformVideoData);
        setVideos(transformedVideos);
      } else {
        setVideos(mockVideos.map(transformVideoData));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(t.amvEditing.labels.errorText);
      setChannelData(mockChannelData);
      setVideos(mockVideos.map(transformVideoData));
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllVideos, mockChannelData, mockVideos, t.amvEditing.labels.errorText]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const breadcrumbItems = [
    { label: t.amvEditing.breadcrumbs.home, href: basePath || '/' },
    { label: t.amvEditing.breadcrumbs.portfolio, href: `${basePath}/portfolio` },
    { label: t.amvEditing.breadcrumbs.amvEditing, href: `${basePath}/portfolio/amv-editing` },
  ];

  const featuredVideo = videos[0];

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <AMVHeader
          title={t.amvEditing.labels.headerTitle}
          description={t.amvEditing.labels.headerDescription}
          totalVideos={videos.length}
        />

        {/* Error State */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 text-center">
            <p className="text-amber-800 dark:text-amber-400 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-5 py-2 bg-[#191970] dark:bg-[#a67c00] text-white dark:text-[#0f0f45] text-sm rounded-full hover:bg-[#0f0f4d] dark:hover:bg-[#c9a236] transition-colors"
            >
              {t.amvEditing.labels.retry}
            </button>
          </div>
        )}

        {/* Channel Info */}
        <ChannelInfo data={channelData || undefined} isLoading={isLoading} />

        {/* Featured Video */}
        {featuredVideo && !isLoading && (
          <FeaturedVideo
            title={featuredVideo.title}
            description={featuredVideo.description}
            viewCount={featuredVideo.viewCount}
            publishedAt={featuredVideo.publishedAt}
            thumbnailUrl={featuredVideo.thumbnailUrl}
            videoId={featuredVideo.videoId}
            tags={featuredVideo.tags}
          />
        )}

        {/* Video Grid — pass ALL videos except the featured one */}
        <VideoGrid
          videos={videos.slice(1)}
          isLoading={isLoading}
          hasMore={false}
        />
      </div>
    </main>
  );
}