'use client';

import { useEffect, useRef } from 'react';
import { BlogPost } from '@/lib/strapi/blogs';

interface BlogPostContentProps {
  blog: BlogPost;
  language: 'en' | 'zh';
}

function fixYouTubeIframes(container: HTMLElement) {
  // 1. Convert <oembed> → <iframe>
  container.querySelectorAll('oembed').forEach((oembed) => {
    const url = oembed.getAttribute('url');
    if (!url) return;
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('title', 'Embedded video content');
    oembed.parentNode?.replaceChild(iframe, oembed);
  });

  // 2. Fix all iframes
  container.querySelectorAll<HTMLIFrameElement>('iframe').forEach((iframe) => {
    let src = iframe.getAttribute('src');
    if (!src) return;
    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
    if (!isYouTube) return;

    if (src.includes('watch?v=')) src = src.replace('watch?v=', 'embed/');
    else if (src.includes('youtu.be/')) src = src.replace('youtu.be/', 'www.youtube.com/embed/');

    try {
      const url = new URL(src.startsWith('//') ? `https:${src}` : src);
      if (!url.searchParams.has('rel')) url.searchParams.set('rel', '0');
      if (!url.searchParams.has('controls')) url.searchParams.set('controls', '1');
      if (!url.searchParams.has('modestbranding')) url.searchParams.set('modestbranding', '1');
      src = url.toString();
    } catch (_) { /* malformed URL */ }

    iframe.setAttribute('src', src);
    if (!iframe.hasAttribute('allowfullscreen')) iframe.setAttribute('allowfullscreen', '');
    if (!iframe.hasAttribute('frameborder')) iframe.setAttribute('frameborder', '0');
    if (!iframe.hasAttribute('allow')) {
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    }

    // Wrap in 16:9 responsive container if needed
    const parent = iframe.parentElement;
    if (parent && !parent.classList.contains('yt-wrapper') && !parent.classList.contains('media')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'yt-wrapper';
      wrapper.style.cssText = 'position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5em 0;border-radius:4px;background:#000';
      parent.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
      iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0';
    }
  });

  // 3. Wrap CKEditor .media figures
  container.querySelectorAll<HTMLElement>('figure.media, .media').forEach((media) => {
    const iframe = media.querySelector('iframe');
    if (!iframe || media.style.paddingBottom) return;
    media.style.cssText += ';position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5em 0;border-radius:4px';
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0';
  });
}

export default function BlogPostContent({ blog, language }: BlogPostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) fixYouTubeIframes(contentRef.current);
  }, [blog.Content]);

  const sanitised = (blog.Content || '')
    .replace(/<script/gi, '<noscript')
    .replace(/<\/script>/gi, '</noscript>')
    .replace(/onerror=/gi, '')
    .replace(/onload=/gi, '');

  return (
    <div>
      {/* Post body */}
      <div ref={contentRef} className="blog-post-body" dangerouslySetInnerHTML={{ __html: sanitised }} />

      {/* Share section */}
      <div className="mt-12 pt-8 border-t border-[#d0d0d0] dark:border-[#444]">
        <p className="text-sm font-semibold text-[#111] dark:text-white mb-3 text-center">
          {language === 'zh' ? '分享此文章' : 'Share this article'}
        </p>
        <div className="flex justify-center gap-3">

          {/* X (Twitter) */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.shainwaiyan.com/blog/${blog.Slug}`)}&text=${encodeURIComponent(blog.Title)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{ background: '#000', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            aria-label="Share on X (Twitter)"
          >
            {/* X logo */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 1200 1227">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.shainwaiyan.com/blog/${blog.Slug}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{ background: '#0a66c2', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            aria-label="Share on LinkedIn"
          >
            {/* LinkedIn "in" logo */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
              <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.shainwaiyan.com/blog/${blog.Slug}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{ background: '#1877f2', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            aria-label="Share on Facebook"
          >
            {/* Facebook f logo */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 320 512">
              <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
            </svg>
          </a>

          {/* Copy link */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://www.shainwaiyan.com/blog/${blog.Slug}`);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{ background: '#191970', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            aria-label="Copy link"
          >
            {/* Chain link icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

        </div>
      </div>

      {/* ── Global prose styles scoped to .blog-post-body ── */}
      {/* Uses plain <style> tag so it works without styled-jsx */}
      <style>{`
        .blog-post-body {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #333333;
          max-width: 100%;
          overflow: hidden;
        }
        .dark .blog-post-body { color: #e0e0e0; }

        .blog-post-body h1,
        .blog-post-body h2,
        .blog-post-body h3,
        .blog-post-body h4,
        .blog-post-body h5,
        .blog-post-body h6 {
          color: #111111;
          margin: 1.8rem 0 0.8rem;
          line-height: 1.3;
          font-weight: 700;
        }
        .dark .blog-post-body h1,
        .dark .blog-post-body h2,
        .dark .blog-post-body h3,
        .dark .blog-post-body h4,
        .dark .blog-post-body h5,
        .dark .blog-post-body h6 { color: #ffffff; }

        .blog-post-body h2 { font-size: 1.7rem; }
        .blog-post-body h3 { font-size: 1.4rem; }
        .blog-post-body h4 { font-size: 1.2rem; }
        .blog-post-body p  { margin-bottom: 1.2rem; }

        /* ── Links: #191970 light, #ffd700 dark — NOT orange ── */
        .blog-post-body a {
          color: #191970;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .blog-post-body a:hover { color: #ffd700; }
        .dark .blog-post-body a { color: #ffd700; }
        .dark .blog-post-body a:hover { color: #ffe347; }

        /* ── Highlighted / marked text ── */
        .blog-post-body mark,
        .blog-post-body ::selection {
          background: rgba(25, 25, 112, 0.15);
          color: #191970;
        }
        .dark .blog-post-body mark { background: rgba(255,215,0,0.2); color: #ffd700; }

        .blog-post-body ul,
        .blog-post-body ol { margin: 1.2rem 0; padding-left: 1.8rem; }
        .blog-post-body li { margin-bottom: 0.4rem; line-height: 1.6; }

        .blog-post-body blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.2rem;
          background: #f8f9fa;
          border-left: 3px solid #191970;
          border-radius: 4px;
          font-style: italic;
        }
        .dark .blog-post-body blockquote {
          background: #1e1e1e;
          border-left-color: #a67c00;
        }

        .blog-post-body code {
          background: #f8f9fa;
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.85em;
          color: #191970;
        }
        .dark .blog-post-body code {
          background: #1e1e1e;
          color: #ffd700;
        }

        .blog-post-body pre {
          background: #f8f9fa;
          padding: 1.2rem;
          border-radius: 4px;
          overflow-x: auto;
          font-family: 'Fira Code', 'Consolas', monospace;
          font-size: 0.9em;
          line-height: 1.5;
          margin: 1.2rem 0;
        }
        .dark .blog-post-body pre { background: #1e1e1e; color: #e0e0e0; }
        .blog-post-body pre code { background: none; padding: 0; color: inherit; }

        .blog-post-body img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          display: block;
          margin: 1.5em auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .blog-post-body figure {
          margin: 1.5em auto;
          max-width: 100%;
          text-align: center;
        }
        .blog-post-body figcaption {
          font-size: 0.875em;
          color: #666;
          margin-top: 0.5em;
        }
        .dark .blog-post-body figcaption { color: #b0b0b0; }

        /* Tables */
        .blog-post-body table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95em;
          margin: 1.5em 0;
        }
        .blog-post-body th,
        .blog-post-body td {
          border: 1px solid #d0d0d0;
          padding: 10px 14px;
          text-align: left;
        }
        .blog-post-body th {
          background: #f8f9fa;
          font-weight: 700;
          color: #111;
        }
        .blog-post-body tr:nth-child(even) { background: #f8f9fa; }
        .dark .blog-post-body th { background: #1e1e1e; color: #fff; }
        .dark .blog-post-body th,
        .dark .blog-post-body td { border-color: #444; }
        .dark .blog-post-body tr:nth-child(even) { background: #1e1e1e; }

        /* Responsive YouTube / media embeds */
        .blog-post-body .media,
        .blog-post-body figure.media {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          margin: 1.5em 0;
          background: #000;
          border-radius: 4px;
        }
        .blog-post-body .media iframe,
        .blog-post-body figure.media iframe,
        .blog-post-body .yt-wrapper iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: 0;
        }

        /* CKEditor image alignment */
        .blog-post-body .image-style-align-left,
        .blog-post-body figure.image-style-align-left {
          float: left;
          margin-right: 1.5em;
          margin-left: 0;
        }
        .blog-post-body .image-style-align-right,
        .blog-post-body figure.image-style-align-right {
          float: right;
          margin-left: 1.5em;
          margin-right: 0;
        }
        .blog-post-body::after { content: ''; display: table; clear: both; }

        /* Strong / em */
        .blog-post-body strong { font-weight: 700; color: #111; }
        .dark .blog-post-body strong { color: #fff; }
        .blog-post-body em { font-style: italic; }

        /* HR */
        .blog-post-body hr {
          border: none;
          border-top: 1px solid #d0d0d0;
          margin: 2rem 0;
        }
        .dark .blog-post-body hr { border-top-color: #444; }
      `}</style>
    </div>
  );
}