export function isTrustedVideo(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  // DEFENSE IN DEPTH: The Ultimate Safeguard
  // Strictly enforce http:// or https:// (or protocol-relative //)
  if (!/^(https?:)?\/\//i.test(url)) {
    return false;
  }

  const trustedDomains = ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'vimeo.com'];
  
  try {
    const parsedUrl = new URL(url.startsWith('//') ? `https:${url}` : url);
    return trustedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false; 
  }
}

export function getYouTubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url.startsWith('//') ? `https:${url}` : url);
    let videoId = '';

    // Extract Video ID safely
    if (parsedUrl.hostname.includes('youtube.com')) {
      videoId = parsedUrl.searchParams.get('v') || '';
      // Handle URLs that are already /embed/
      if (!videoId && parsedUrl.pathname.startsWith('/embed/')) {
        videoId = parsedUrl.pathname.split('/')[2];
      }
    } else if (parsedUrl.hostname.includes('youtu.be')) {
      videoId = parsedUrl.pathname.slice(1);
    }

    // If we successfully found a video ID, build a clean embed URL
    if (videoId) {
      const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
      embedUrl.searchParams.set('rel', '0');
      embedUrl.searchParams.set('controls', '1');
      embedUrl.searchParams.set('modestbranding', '1');
      return embedUrl.toString();
    }

    return ''; // Fallback
  } catch {
    return '';
  }
}
