'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import ChannelHeader from '@/components/video-channel/ChannelHeader';
import ChannelInfo, { type ChannelData } from '@/components/video-channel/ChannelInfo';
import FeaturedVideo from '@/components/video-channel/FeaturedVideo';
import VideoGrid from '@/components/video-channel/VideoGrid';
import { transformVideoData, formatViewCount, type TransformedVideo } from '@/lib/youtube-utils';
import { getDictionarySync } from '@/lib/getDictionary';
import { YOUTUBE_CHANNELS } from '@/lib/youtube-channels';
import { YouTubeVideo } from '@/types/youtube';

interface YouTubeApiResponse {
  items: Array<YouTubeVideo>;
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
    subscriberCount: t.amvEditing.mockChannel.subscriberCount || '262',
    videoCount: t.amvEditing.mockChannel.videoCount || '25',
    viewCount: '134K',
    customUrl: YOUTUBE_CHANNELS.amv.handle || '@shaineditamv',
    bannerUrl: YOUTUBE_CHANNELS.amv.bannerUrl,
    avatarUrl: YOUTUBE_CHANNELS.amv.fallbackAvatar,
  }), [t]);

  const mockVideos = useMemo<YouTubeVideo[]>(() => [
    {
      kind: 'youtube#video',
      etag: '',
      id: 'video1',
      snippet: {
        publishedAt: '2022-01-01T00:00:00Z',
        channelId: '',
        title: t.amvEditing.mockVideos[0].title,
        description: t.amvEditing.mockVideos[0].description,
        thumbnails: { high: { url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Puss+in+Boots', width: 640, height: 360 } },
        channelTitle: t.amvEditing.mockChannel.title,
        resourceId: { kind: 'youtube#video', videoId: '8aIsh6rfW4U' },
      },
      statistics: { viewCount: '6200' },
      contentDetails: { duration: 'PT1M' },
    },
    {
      kind: 'youtube#video',
      etag: '',
      id: 'video2',
      snippet: {
        publishedAt: '2022-02-01T00:00:00Z',
        channelId: '',
        title: t.amvEditing.mockVideos[1].title,
        description: t.amvEditing.mockVideos[1].description,
        thumbnails: { high: { url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Best+Waifu', width: 640, height: 360 } },
        channelTitle: t.amvEditing.mockChannel.title,
        resourceId: { kind: 'youtube#video', videoId: 'dQw4w9WgXcQ' },
      },
      statistics: { viewCount: '542' },
      contentDetails: { duration: 'PT12S' },
    },
    {
      kind: 'youtube#video',
      etag: '',
      id: 'video3',
      snippet: {
        publishedAt: '2022-03-01T00:00:00Z',
        channelId: '',
        title: t.amvEditing.mockVideos[2].title,
        description: t.amvEditing.mockVideos[2].description,
        thumbnails: { high: { url: 'https://via.placeholder.com/640x360/191970/ffffff?text=Levi+Ackerman', width: 640, height: 360 } },
        channelTitle: t.amvEditing.mockChannel.title,
        resourceId: { kind: 'youtube#video', videoId: 'LLdGSTceP8c' },
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
        ? `/api/youtube?channel=amv&endpoint=videos&maxResults=50&pageToken=${encodeURIComponent(pageToken)}`
        : `/api/youtube?channel=amv&endpoint=videos&maxResults=50`;

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

  const loadData = useCallback(() => {
    return Promise.all([
        fetch('/api/youtube?channel=amv&endpoint=channel'),
        fetchAllVideos(),
      ]).then(async ([channelRes, allVideoItems]) => {

      setError(null);
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

      // Transform ALL video data
      if (allVideoItems.length > 0) {
        const transformedVideos = allVideoItems.map((video) => transformVideoData(video));
        setVideos(transformedVideos);
      } else {
        setVideos(mockVideos.map((video) => transformVideoData(video)));
      }
    }).catch((err: unknown) => {
      console.error('Failed to load data:', err);
      setError(t.amvEditing.labels.errorText);
      setChannelData(mockChannelData);
      setVideos(mockVideos.map((video) => transformVideoData(video)));
    }).finally(() => {
      setIsLoading(false);
    });
  }, [fetchAllVideos, mockChannelData, mockVideos, t.amvEditing.labels.errorText]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const basePath = locale === 'en' ? '' : `/${locale}`;

  const breadcrumbItems = [
    { label: t.amvEditing.breadcrumbs.home, href: basePath || '/' },
    { label: locale === 'zh' ? '工作之外' : 'Beyond Work', href: `${basePath}/hobbies` },
    { label: t.amvEditing.breadcrumbs.amvEditing, href: `${basePath}/hobbies/amv-editing` },
  ];

  const featuredVideo = videos[0];

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full min-w-0">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <ChannelHeader
          title={t.amvEditing.labels.headerTitle}
          description={t.amvEditing.labels.headerDescription}
          totalVideos={videos.length}
          eyebrow={locale === 'zh' ? '工作之外' : 'Beyond Work'}
          videosLabel={locale === 'zh' ? '个视频' : 'Videos'}
        />

        {/* Error State */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 mb-8 text-center">
            <p className="text-amber-800 dark:text-amber-400 text-sm">{error}</p>
            <button
              onClick={() => { setIsLoading(true); setError(null); void loadData(); }}
              className="mt-2 px-5 py-2 bg-[#191970] dark:bg-[#a67c00] text-white dark:text-[#0f0f45] text-sm rounded-full hover:bg-[#0f0f4d] dark:hover:bg-[#c9a236] transition-colors"
            >
              {t.amvEditing.labels.retry}
            </button>
          </div>
        )}

        {/* Channel Info */}
        <ChannelInfo
          data={channelData || undefined}
          isLoading={isLoading}
          channelUrl={YOUTUBE_CHANNELS.amv.channelUrl}
          subscribersLabel={locale === 'zh' ? '位订阅者' : 'Subscribers'}
          videosLabel={locale === 'zh' ? '个公开视频' : 'Videos'}
          viewsLabel={locale === 'zh' ? '次总观看' : 'Total Views'}
          subscribeLabel={locale === 'zh' ? '订阅频道' : 'Subscribe'}
          verifiedLabel={locale === 'zh' ? '官方频道' : 'Official Channel'}
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
          />
        )}

        {/* Video Grid — pass ALL videos except the featured one */}
        <VideoGrid
          videos={videos.slice(1)}
          isLoading={isLoading}
          hasMore={false}
          locale={locale}
        />
      </div>
    </main>
  );
}
