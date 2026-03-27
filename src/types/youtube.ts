/**
 * YouTube API Data Types
 */

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeResourceId {
  kind: string;
  videoId: string;
}

export interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  playlistId?: string;
  position?: number;
  resourceId?: YouTubeResourceId;
}

export interface YouTubeContentDetails {
  duration?: string;
  dimension?: string;
  definition?: string;
  caption?: string;
  licensedContent?: boolean;
  projection?: string;
}

export interface YouTubeStatistics {
  viewCount: string;
  likeCount?: string;
  favoriteCount?: string;
  commentCount?: string;
  subscriberCount?: string;
  videoCount?: string;
}

export interface YouTubeVideo {
  kind: string;
  etag: string;
  id: string | { videoId: string };
  snippet?: YouTubeSnippet;
  contentDetails?: YouTubeContentDetails;
  statistics?: YouTubeStatistics;
}
