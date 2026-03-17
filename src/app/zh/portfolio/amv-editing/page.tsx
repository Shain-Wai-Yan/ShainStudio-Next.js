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
  title: '明元易工作室 AMV',
  description:
    '欢迎来到我的 AMV 剪辑频道！创作融合故事叙述与震撼视觉的动态动画音乐视频。',
  subscriberCount: '1.2千',
  videoCount: '25',
  avatarUrl: '/images/Shain Studio.png',
};

const MOCK_VIDEOS = [
  {
    id: 'video1',
    snippet: {
      resourceId: { videoId: '8aIsh6rfW4U' },
      title: '长靴从猫：最后的愿望 - 死亡场景剪辑',
      description: '一部强大的 AMV，展现《长靴从猫：最后的愿望》中的感人场景。',
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Puss+in+Boots',
        },
      },
      publishedAt: '2022-01-01T00:00:00Z',
      channelTitle: '明元易工作室',
    },
    statistics: { viewCount: '6200' },
    contentDetails: { duration: 'PT1M' },
  },
  {
    id: 'video2',
    snippet: {
      resourceId: { videoId: 'dQw4w9WgXcQ' },
      title: '动画中最棒的老婆（你最喜欢的是谁）',
      description: '展示动画中最受欢迎的女性角色的合集。',
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Best+Waifu',
        },
      },
      publishedAt: '2022-02-01T00:00:00Z',
      channelTitle: '明元易工作室',
    },
    statistics: { viewCount: '542' },
    contentDetails: { duration: 'PT12S' },
  },
  {
    id: 'video3',
    snippet: {
      resourceId: { videoId: 'LLdGSTceP8c' },
      title: '利威尔·阿克曼（偷走了风头的配角）AMV/剪辑',
      description: '对《进击的巨人》中利威尔·阿克曼的史诗致敬。',
      thumbnails: {
        high: {
          url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Levi+Ackerman',
        },
      },
      publishedAt: '2022-03-01T00:00:00Z',
      channelTitle: '明元易工作室',
    },
    statistics: { viewCount: '1200' },
    contentDetails: { duration: 'PT8S' },
  },
];

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

export default function AMVEditingPageZH() {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<TransformedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch ALL pages from the paginated YouTube API (same as EN) ──────────
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
      setError('未能加载视频 — 正在显示示例内容。');
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
    { label: '首页', href: '/zh' },
    { label: '作品集', href: '/zh/portfolio' },
    { label: '动漫视频剪辑', href: '/zh/portfolio/amv-editing' },
  ];

  const featuredVideo = videos[0];

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <AMVHeader
          title="动漫视频剪辑"
          description="动态视频剪辑，融合故事叙述与震撼视觉效果"
          totalVideos={videos.length}
        />

        {/* Error State */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 text-center">
            <p className="text-amber-800 dark:text-amber-400 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-5 py-2 bg-[#191970] dark:bg-[#a67c00] text-white text-sm rounded-full hover:bg-[#0f0f4d] dark:hover:bg-[#c9a236] transition-colors"
            >
              重试
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

        {/* Video Grid — all videos except the featured one */}
        <VideoGrid
          videos={videos.slice(1)}
          isLoading={isLoading}
          hasMore={false}
        />
      </div>
    </main>
  );
}