/**
 * YouTube Channel Configuration & Allowlist
 * Server-safe registry of approved YouTube channels for portfolio showcases.
 */

export interface YouTubeChannelConfig {
  id: 'amv' | 'gaming';
  channelId: string;
  slug: string;
  channelUrl: string;
  handle?: string;
  name: string;
  fallbackAvatar: string;
  bannerUrl?: string;
  tags: string[];
  featuredVideoId?: string;
}

export const YOUTUBE_CHANNELS: Record<'amv' | 'gaming', YouTubeChannelConfig> = {
  amv: {
    id: 'amv',
    channelId: 'UCV4ZLWfXF15d4tyzdJTkzpw',
    slug: 'amv-editing',
    channelUrl: 'https://www.youtube.com/@shaineditamv',
    handle: '@shaineditamv',
    name: 'Shain Studio AMV',
    fallbackAvatar: 'https://yt3.ggpht.com/tJkJb7zunZbUQPa3bRB-Hh8nkyEQgnJ5UmH_3ZdLLs6BjV0Bz3paj6nH0wzBySO3OD5m3ZcCVQ=s800-c-k-c0x00ffffff-no-rj',
    bannerUrl: 'https://yt3.googleusercontent.com/tZBYqm_uDd19wtnxfji-VviAs-Qr0VkFy0tM10rPIBJnoE8tA5f--GQByMC_VfY0M-whxtc2-g',
    tags: ['AMV', 'Anime', 'Music Video'],
  },
  gaming: {
    id: 'gaming',
    channelId: 'UCxkWgKCJFMtjjq8vK9xTd6g',
    slug: 'gaming',
    channelUrl: 'https://www.youtube.com/@shainplaygame',
    handle: '@shainplaygame',
    name: 'Shain Plays Games',
    fallbackAvatar: 'https://yt3.ggpht.com/WR80l0UlIcgveswmPlhqXyZmTIUBuuV5cPwoHycJ9b50_x-KTHPpz_oXTjvmUkvGpcQQUr-YqA=s800-c-k-c0x00ffffff-no-rj',
    bannerUrl: 'https://yt3.googleusercontent.com/UgQ8swIFdJVj2VaFzihXN6_LCEUNCbaZ4WGFaCk3T4KP_Kh-EB0SJ2o301A3qrOLGsDRSMrjFw',
    tags: ['Gaming', 'Ragnarok Mobile', 'Walkthrough'],
    featuredVideoId: 'Iv4PM0YN5V8',
  },
};

/**
 * Look up a channel config by key ('amv' | 'gaming'), slug, or raw YouTube channelId.
 * Returns null if not in allowlist.
 */
export function getYouTubeChannelConfig(keyOrId: string | null | undefined): YouTubeChannelConfig | null {
  if (!keyOrId) return YOUTUBE_CHANNELS.amv; // Default to AMV for backward compatibility
  const normalized = keyOrId.trim().toLowerCase();

  if (normalized === 'amv' || normalized === 'amv-editing') return YOUTUBE_CHANNELS.amv;
  if (normalized === 'gaming') return YOUTUBE_CHANNELS.gaming;

  // Direct Channel ID lookup
  for (const config of Object.values(YOUTUBE_CHANNELS)) {
    if (config.channelId === keyOrId.trim()) {
      return config;
    }
  }

  return null;
}
