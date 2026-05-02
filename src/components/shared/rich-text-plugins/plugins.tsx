import React from 'react';
import { Element, DOMNode, attributesToProps, domToReact } from 'html-react-parser';
import { isTrustedVideo, getYouTubeEmbedUrl } from './utils';

// ─── REUSABLE UI COMPONENTS ────────────────────────────────────────────

const ResponsiveVideo = ({ src }: { src: string }) => (
  <div className="yt-wrapper relative w-full pb-[56.25%] h-0 overflow-hidden my-8 rounded-lg bg-black shadow-md">
    <iframe
      src={src}
      className="absolute top-0 left-0 w-full h-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title="Embedded video content"
    />
  </div>
);

const BlockedMediaMessage = () => (
  <div className="text-sm text-gray-500 dark:text-gray-400 italic my-6 p-4 border border-dashed border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-md">
    ⚠️ Unsupported or insecure embedded content was removed.
  </div>
);

// ─── THE PLUGIN TYPE ───────────────────────────────────────────────────

export type RichTextPlugin = (element: Element) => React.ReactElement | void;

// ─── THE PLUGINS ───────────────────────────────────────────────────────

export const secureLinksPlugin: RichTextPlugin = (element) => {
  if (element.name === 'a') {
    let href = element.attribs?.href || '';

    // normalize protocol-relative
    if (href.startsWith('//')) {
      href = `https:${href}`;
    }

    // fix missing protocol (www.google.com -> https://www.google.com)
    if (/^(www\.)/.test(href)) {
      href = `https://${href}`;
    }

    const props = attributesToProps({
      ...element.attribs,
      href,
    } as Record<string, string>);

    if (/^https?:\/\//i.test(href)) {
      return (
        <a {...props} target="_blank" rel="noopener noreferrer">
          {domToReact(element.children as DOMNode[])}
        </a>
      );
    }
    
    return (
      <a {...props}>
        {domToReact(element.children as DOMNode[])}
      </a>
    );
  }
};

export const intelligentImagePlugin: RichTextPlugin = (element) => {
  if (element.name === 'img') {
    let src = element.attribs?.src || '';
    
    // Normalize protocol-relative URLs (e.g., //res.cloudinary.com -> https://res.cloudinary.com)
    if (src.startsWith('//')) {
      src = `https:${src}`;
    }

    // Security: Allow absolute HTTP/HTTPS or local relative paths.
    if (!src.startsWith('http') && !src.startsWith('/')) {
       return <BlockedMediaMessage />;
    }

    // Cloudinary Auto-Optimization
    if (src.includes('cloudinary.com') && src.includes('/upload/')) {
      if (!src.includes('q_auto') && !src.includes('f_auto')) {
        src = src.replace('/upload/', '/upload/q_auto,f_auto/');
      }
    }

    const props = attributesToProps(element.attribs as Record<string, string>);
    
    return (
      <img 
        {...props} 
        src={src} 
        alt={typeof props.alt === 'string' ? props.alt : 'Content image'} // Accessibility fallback
        loading="lazy" 
        decoding="async"
        style={{ maxWidth: '100%', height: 'auto' }} 
      />
    );
  }
};

export const secureVideoPlugin: RichTextPlugin = (element) => {
  if (element.name === 'figure' && typeof element.attribs?.class === 'string' && element.attribs.class.includes('media')) {
    const videoNode = element.children?.find(
      (c) => c.type === 'tag' && (('name' in c) && (c.name === 'oembed' || c.name === 'iframe'))
    ) as Element | undefined;

    if (videoNode) {
      const url = videoNode.attribs?.url || videoNode.attribs?.src;
      if (isTrustedVideo(url)) {
        const embedUrl = getYouTubeEmbedUrl(url);
        if (!embedUrl) return <BlockedMediaMessage />;
        return <ResponsiveVideo src={embedUrl} />;
      }
    }
    return <BlockedMediaMessage />; 
  }

  if (element.name === 'oembed' || element.name === 'iframe') {
    const url = element.attribs?.url || element.attribs?.src;
    if (isTrustedVideo(url)) {
      const embedUrl = getYouTubeEmbedUrl(url);
      if (!embedUrl) return <BlockedMediaMessage />;
      return <ResponsiveVideo src={embedUrl} />;
    }
    return <BlockedMediaMessage />;
  }
};
