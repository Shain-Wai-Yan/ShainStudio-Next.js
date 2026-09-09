import 'server-only';

const FALLBACK_WORKER_URL = 'https://youtube-api-fetcher.shainstudio.workers.dev';

export function getYouTubeWorkerUrl(): string {
  return (process.env.YOUTUBE_WORKER_URL || FALLBACK_WORKER_URL).replace(/\/$/, '');
}

export function getYouTubeWorkerHeaders(): HeadersInit {
  const secret = process.env.YOUTUBE_WORKER_SECRET;
  return secret ? { 'X-Portfolio-Worker-Secret': secret } : {};
}
