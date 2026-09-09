'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import ChannelHeader from '@/components/video-channel/ChannelHeader';
import ChannelInfo, { type ChannelData } from '@/components/video-channel/ChannelInfo';
import FeaturedVideo from '@/components/video-channel/FeaturedVideo';
import VideoGrid from '@/components/video-channel/VideoGrid';
import { transformVideoData, formatViewCount, type TransformedVideo } from '@/lib/youtube-utils';
import { YOUTUBE_CHANNELS } from '@/lib/youtube-channels';
import { getDictionarySync } from '@/lib/getDictionary';
import { YouTubeVideo } from '@/types/youtube';

interface YouTubeApiResponse {
  items: Array<YouTubeVideo>;
  nextPageToken?: string;
}

const GAMING_CONFIG = YOUTUBE_CHANNELS.gaming;

export default function GamingPage() {
  const pathname = usePathname();
  const locale = pathname.startsWith('/zh') ? 'zh' : 'en';
  const t = getDictionarySync(locale);

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<TransformedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockChannelData: ChannelData = useMemo(() => ({
    title: t.gaming.mockChannel.title,
    description: t.gaming.mockChannel.description,
    subscriberCount: t.gaming.mockChannel.subscriberCount || '891',
    videoCount: t.gaming.mockChannel.videoCount || '20',
    viewCount: '120K',
    customUrl: GAMING_CONFIG.handle || '@shainplaygame',
    bannerUrl: GAMING_CONFIG.bannerUrl,
    avatarUrl: GAMING_CONFIG.fallbackAvatar,
  }), [t]);

  const mockVideos = useMemo<YouTubeVideo[]>(() => [
    {
      kind: 'youtube#video',
      etag: '',
      id: 'Iv4PM0YN5V8',
      snippet: {
        publishedAt: '2022-12-12T06:00:21Z',
        channelId: GAMING_CONFIG.channelId,
        title: t.gaming.mockVideos[0].title,
        description: t.gaming.mockVideos[0].description,
        thumbnails: { high: { url: 'https://i.ytimg.com/vi/Iv4PM0YN5V8/hqdefault.jpg', width: 480, height: 360 } },
        channelTitle: t.gaming.mockChannel.title,
        resourceId: { kind: 'youtube#video', videoId: 'Iv4PM0YN5V8' },
      },
      statistics: { viewCount: '400' },
      contentDetails: { duration: 'PT5M57S' },
    },
    {
      kind: 'youtube#video',
      etag: '',
      id: 'CHW-ioqAvIs',
      snippet: {
        publishedAt: '2023-07-07T04:23:26Z',
        channelId: GAMING_CONFIG.channelId,
        title: t.gaming.mockVideos[1].title,
        description: t.gaming.mockVideos[1].description,
        thumbnails: { high: { url: 'https://i.ytimg.com/vi/CHW-ioqAvIs/hqdefault.jpg', width: 480, height: 360 } },
        channelTitle: t.gaming.mockChannel.title,
        resourceId: { kind: 'youtube#video', videoId: 'CHW-ioqAvIs' },
      },
      statistics: { viewCount: '680' },
      contentDetails: { duration: 'PT50S' },
    },
    {
      kind: 'youtube#video',
      etag: '',
      id: 'F-HsDRJyb-g',
      snippet: {
        publishedAt: '2022-11-08T03:40:02Z',
        channelId: GAMING_CONFIG.channelId,
        title: t.gaming.mockVideos[2].title,
        description: t.gaming.mockVideos[2].description,
        thumbnails: { high: { url: 'https://i.ytimg.com/vi/F-HsDRJyb-g/hqdefault.jpg', width: 480, height: 360 } },
        channelTitle: t.gaming.mockChannel.title,
        resourceId: { kind: 'youtube#video', videoId: 'F-HsDRJyb-g' },
      },
      statistics: { viewCount: '2280' },
      contentDetails: { duration: 'PT6M34S' },
    },
  ], [t]);

  // ─── Fetch ALL pages from the paginated YouTube API for Gaming channel
  const fetchAllVideos = useCallback(async (): Promise<YouTubeApiResponse['items']> => {
    const allItems: YouTubeApiResponse['items'] = [];
    let pageToken: string | null = null;

    do {
      const url: string = pageToken
        ? `/api/youtube?channel=gaming&endpoint=videos&maxResults=50&pageToken=${encodeURIComponent(pageToken)}`
        : `/api/youtube?channel=gaming&endpoint=videos&maxResults=50`;

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
        fetch('/api/youtube?channel=gaming&endpoint=channel'),
        fetchAllVideos(),
      ]);

      if (!channelRes.ok) throw new Error('Channel API request failed');

      const channelRawData: YouTubeApiResponse = await channelRes.json();

      // Transform channel data
      if (channelRawData.items && channelRawData.items.length > 0) {
        const channelItem = channelRawData.items[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const branding = (channelItem as any).brandingSettings;
        setChannelData({
          title: channelItem.snippet?.title || mockChannelData.title,
          description: channelItem.snippet?.description || mockChannelData.description,
          subscriberCount: channelItem.statistics?.subscriberCount
            ? formatViewCount(channelItem.statistics.subscriberCount)
            : mockChannelData.subscriberCount,
          videoCount: channelItem.statistics?.videoCount || mockChannelData.videoCount,
          avatarUrl: channelItem.snippet?.thumbnails?.high?.url || mockChannelData.avatarUrl,
          bannerUrl: branding?.image?.bannerExternalUrl || mockChannelData.bannerUrl,
          customUrl: channelItem.snippet?.customUrl || mockChannelData.customUrl,
          viewCount: channelItem.statistics?.viewCount
            ? formatViewCount(channelItem.statistics.viewCount)
            : mockChannelData.viewCount,
        });
      } else {
        setChannelData(mockChannelData);
      }

      // Transform ALL video data with gaming tags
      if (allVideoItems.length > 0) {
        const transformedVideos = allVideoItems.map((v) =>
          transformVideoData(v, GAMING_CONFIG.tags)
        );
        setVideos(transformedVideos);
      } else {
        setVideos(mockVideos.map((v) => transformVideoData(v, GAMING_CONFIG.tags)));
      }
    } catch (err) {
      console.error('Failed to load gaming data:', err);
      setError(t.gaming.labels.errorText);
      setChannelData(mockChannelData);
      setVideos(mockVideos.map((v) => transformVideoData(v, GAMING_CONFIG.tags)));
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllVideos, mockChannelData, mockVideos, t.gaming.labels.errorText]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const breadcrumbItems = [
    { label: t.gaming.breadcrumbs.home, href: basePath || '/' },
    { label: locale === 'zh' ? '工作之外' : 'Beyond Work', href: `${basePath}/hobbies` },
    { label: t.gaming.breadcrumbs.gaming, href: `${basePath}/hobbies/gaming` },
  ];

  // Specific featured video priority:
  // If GAMING_CONFIG.featuredVideoId is set (Iv4PM0YN5V8), find and prioritize that video as featured.
  const featuredVideo = useMemo(() => {
    if (videos.length === 0) return null;
    const targetId = GAMING_CONFIG.featuredVideoId;
    if (targetId) {
      const match = videos.find((v) => v.videoId === targetId || v.id === targetId);
      if (match) return match;
    }
    return videos[0];
  }, [videos]);

  // Gallery videos: all videos except the one chosen as featured
  const galleryVideos = useMemo(() => {
    if (!featuredVideo) return videos;
    return videos.filter((v) => v.videoId !== featuredVideo.videoId);
  }, [videos, featuredVideo]);

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full min-w-0">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <ChannelHeader
          title={t.gaming.labels.headerTitle}
          description={t.gaming.labels.headerDescription}
          totalVideos={videos.length}
          eyebrow={locale === 'zh' ? '工作之外' : 'Beyond Work'}
          badgeChannelName={GAMING_CONFIG.name}
          videosLabel={locale === 'zh' ? '个视频' : 'Videos'}
        />

        {/* Error State */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 text-center">
            <p className="text-amber-800 dark:text-amber-400 text-sm">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-5 py-2 bg-[#191970] dark:bg-[#a67c00] text-white dark:text-[#0f0f45] text-sm rounded-full hover:bg-[#0f0f4d] dark:hover:bg-[#c9a236] transition-colors"
            >
              {t.gaming.labels.retry}
            </button>
          </div>
        )}

        {/* Channel Info */}
        <ChannelInfo
          data={channelData || undefined}
          isLoading={isLoading}
          channelUrl={GAMING_CONFIG.channelUrl}
          subscribersLabel={locale === 'zh' ? '位订阅者' : 'Subscribers'}
          videosLabel={locale === 'zh' ? '个公开视频' : 'Videos'}
          viewsLabel={locale === 'zh' ? '次总观看' : 'Total Views'}
          subscribeLabel={locale === 'zh' ? '订阅频道' : 'Subscribe'}
          verifiedLabel={locale === 'zh' ? '官方游戏频道' : 'Gaming Channel'}
          copyLabel={locale === 'zh' ? '复制频道链接' : 'Copy channel link'}
          copiedLabel={locale === 'zh' ? '已复制！' : 'Copied!'}
          readMoreLabel={locale === 'zh' ? '展开' : 'See more'}
          showLessLabel={locale === 'zh' ? '收起' : 'Show less'}
        />

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
            sectionTitle={locale === 'zh' ? '精选视频' : 'Featured Work'}
            badgeLabel={locale === 'zh' ? '站长推荐' : "Editor's Pick"}
            releaseLabel={locale === 'zh' ? '经典回顾' : 'Featured Highlight'}
            viewsLabel={locale === 'zh' ? '次播放' : 'views'}
          />
        )}

        {/* Video Grid — pass ALL videos except the featured one */}
        <VideoGrid
          videos={galleryVideos}
          isLoading={isLoading}
          hasMore={false}
          title={locale === 'zh' ? '视频集锦' : 'Video Gallery'}
          searchPlaceholder={locale === 'zh' ? '搜索视频…' : 'Search videos…'}
          locale={locale}
        />
      </div>
    </main>
  );
}
