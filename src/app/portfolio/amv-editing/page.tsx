'use client';

import { useEffect, useState, useCallback } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import AMVHeader from '@/components/amv-editing/AMVHeader';
import ChannelInfo from '@/components/amv-editing/ChannelInfo';
import FeaturedVideo from '@/components/amv-editing/FeaturedVideo';
import VideoGrid from '@/components/amv-editing/VideoGrid';
import { transformVideoData, type TransformedVideo } from '@/lib/youtube-utils';

interface ChannelData {
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

const MOCK_CHANNEL_DATA: ChannelData = {
  title: 'Shain Studio AMV',
  description:
    'Welcome to my AMV editing channel! Creating dynamic anime music videos that blend storytelling with impactful visuals.',
  subscriberCount: '1.2K',
  videoCount: '25',
  avatarUrl: '/images/Shain Studio.png',
};

const MOCK_VIDEOS = [
  {
    id: 'video1',
    snippet: {
      resourceId: { videoId: '8aIsh6rfW4U' },
      title: 'The death from Puss in boots: the last wish edited',
      description:
        'A powerful AMV featuring the emotional scenes from Puss in Boots: The Last Wish.',
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Puss+in+Boots',
        },
      },
      publishedAt: '2022-01-01T00:00:00Z',
      channelTitle: 'Shain Studio',
    },
    statistics: { viewCount: '6200' },
    contentDetails: { duration: 'PT1M' },
  },
  {
    id: 'video2',
    snippet: {
      resourceId: { videoId: 'dQw4w9WgXcQ' },
      title: 'Best waifu in anime (who your favourite)',
      description: 'A compilation showcasing the most beloved female characters.',
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Best+Waifu',
        },
      },
      publishedAt: '2022-02-01T00:00:00Z',
      channelTitle: 'Shain Studio',
    },
    statistics: { viewCount: '542' },
    contentDetails: { duration: 'PT12S' },
  },
  {
    id: 'video3',
    snippet: {
      resourceId: { videoId: 'LLdGSTceP8c' },
      title: 'Levi Ackerman (a side character who steal the show) AMV/edit',
      description:
        'An epic tribute to Levi Ackerman from Attack on Titan.',
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Levi+Ackerman',
        },
      },
      publishedAt: '2022-03-01T00:00:00Z',
      channelTitle: 'Shain Studio',
    },
    statistics: { viewCount: '1200' },
    contentDetails: { duration: 'PT8S' },
  },
];

export default function AMVEditingPage() {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<TransformedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── FIX: fetch ALL pages from the paginated YouTube API ───────────────────
  const fetchAllVideos = useCallback(async (): Promise<any[]> => {
    const allItems: any[] = [];
    let pageToken: string | null = null;

    do {
      const url = pageToken
        ? `/api/amv-editing?endpoint=videos&maxResults=50&pageToken=${encodeURIComponent(pageToken)}`
        : `/api/amv-editing?endpoint=videos&maxResults=50`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Videos API error: ${res.status}`);

      const data = await res.json();

      if (data.items && data.items.length > 0) {
        allItems.push(...data.items);
      }

      // YouTube returns nextPageToken when more pages exist
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

      const channelRawData = await channelRes.json();

      // Transform channel data
      if (channelRawData.items && channelRawData.items.length > 0) {
        const channelItem = channelRawData.items[0];
        setChannelData({
          title: channelItem.snippet?.title || MOCK_CHANNEL_DATA.title,
          description:
            channelItem.snippet?.description || MOCK_CHANNEL_DATA.description,
          subscriberCount:
            channelItem.statistics?.subscriberCount ||
            MOCK_CHANNEL_DATA.subscriberCount,
          videoCount:
            channelItem.statistics?.videoCount || MOCK_CHANNEL_DATA.videoCount,
          avatarUrl:
            channelItem.snippet?.thumbnails?.high?.url ||
            MOCK_CHANNEL_DATA.avatarUrl,
          bannerUrl: channelItem.brandingSettings?.image?.bannerExternalUrl,
        });
      } else {
        setChannelData(MOCK_CHANNEL_DATA);
      }

      // Transform ALL video data (no slice — show everything)
      if (allVideoItems.length > 0) {
        const transformedVideos = allVideoItems.map(transformVideoData);
        setVideos(transformedVideos);
      } else {
        setVideos(MOCK_VIDEOS.map(transformVideoData));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load videos — showing demo content.');
      setChannelData(MOCK_CHANNEL_DATA);
      setVideos(MOCK_VIDEOS.map(transformVideoData));
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllVideos]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'AMV Editing', href: '/portfolio/amv-editing' },
  ];

  const featuredVideo = videos[0];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <AMVHeader
          title="AMV Editing"
          description="Dynamic video edits that blend storytelling with impactful visuals"
          totalVideos={videos.length}
        />

        {/* Error State */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-center">
            <p className="text-amber-800 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-5 py-2 bg-midnight text-white text-sm rounded-full hover:bg-midnight/80 transition-colors"
            >
              Retry
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