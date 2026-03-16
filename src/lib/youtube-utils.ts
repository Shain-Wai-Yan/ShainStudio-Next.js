/**
 * YouTube API utility functions
 * Handles data formatting and transformation
 */

export function formatDuration(duration: string): string {
  if (!duration) return '0:00';
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
}

export function formatViewCount(viewCount: string | number): string {
  if (!viewCount) return '0';
  if (
    typeof viewCount === 'string' &&
    (viewCount.includes('K') || viewCount.includes('M'))
  ) {
    return viewCount;
  }

  const num = Number.parseInt(viewCount as any);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatPublishedDate(publishedAt: string): string {
  if (typeof publishedAt === 'string' && publishedAt.includes('ago')) {
    return publishedAt;
  }

  const date = new Date(publishedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getThumbnailUrl(thumbnails: any): string {
  if (typeof thumbnails === 'string') return thumbnails;

  return (
    thumbnails?.maxres?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    'https://via.placeholder.com/640x360/191970/ffffff?text=Video+Thumbnail'
  );
}

export function getEmbedUrl(
  videoId: string,
  autoplay = false
): string {
  const params = new URLSearchParams({
    rel: '0',
    showinfo: '0',
    autoplay: autoplay ? '1' : '0',
    enablejsapi: '1',
    modestbranding: '1',
    color: 'white',
    controls: '1',
    disablekb: '0',
    fs: '1',
    iv_load_policy: '3',
    loop: '0',
    playsinline: '1',
    start: '0',
    cc_load_policy: '0',
    hl: 'en',
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export interface TransformedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  videoId: string;
  channel: string;
  tags: string[];
}

export function transformVideoData(
  video: any
): TransformedVideo {
  const videoId = video.snippet?.resourceId?.videoId || video.id;
  const { snippet, statistics, contentDetails } = video;

  return {
    id: videoId,
    title: snippet?.title || 'Untitled',
    description: snippet?.description || '',
    thumbnailUrl: getThumbnailUrl(snippet?.thumbnails),
    duration: formatDuration(contentDetails?.duration || ''),
    viewCount: formatViewCount(statistics?.viewCount || '0'),
    publishedAt: formatPublishedDate(snippet?.publishedAt || ''),
    videoId: videoId,
    channel: snippet?.channelTitle || 'Unknown Channel',
    tags: ['AMV', 'Anime', 'Music Video'],
  };
}
