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
    } catch { /* malformed URL */ }

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
      <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center">
          {language === 'zh' ? '分享此文章' : 'Share this article'}
        </p>
        <div className="flex justify-center gap-3">

          {/* X (Twitter) */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.shainwaiyan.com/blog/${blog.Slug}`)}&text=${encodeURIComponent(blog.Title)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm"
            style={{ background: '#000' }}
            aria-label="Share on X (Twitter)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 1200 1227">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.shainwaiyan.com/blog/${blog.Slug}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm"
            style={{ background: '#0a66c2' }}
            aria-label="Share on LinkedIn"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
              <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.shainwaiyan.com/blog/${blog.Slug}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm"
            style={{ background: '#1877f2' }}
            aria-label="Share on Facebook"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 320 512">
              <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
            </svg>
          </a>

          {/* Copy link */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://www.shainwaiyan.com/blog/${blog.Slug}`);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-sm"
            style={{ background: '#191970' }}
            aria-label="Copy link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

        </div>
      </div>

      {/* Tailwind prose styles with YouTube iframe support */}
      <style>{`
        .blog-post-body {
          @apply text-base leading-relaxed text-gray-900 dark:text-gray-200 max-w-full overflow-visible;
        }

        .blog-post-body h1,
        .blog-post-body h2,
        .blog-post-body h3,
        .blog-post-body h4,
        .blog-post-body h5,
        .blog-post-body h6 {
          @apply text-gray-900 dark:text-white font-bold my-6 leading-snug;
        }

        .blog-post-body h1 { @apply text-4xl; }
        .blog-post-body h2 { @apply text-2xl; }
        .blog-post-body h3 { @apply text-xl; }
        .blog-post-body h4 { @apply text-lg; }

        .blog-post-body p { @apply mb-4 leading-relaxed; }

        .blog-post-body a {
          @apply text-blue-900 dark:text-amber-400 underline underline-offset-2 transition-colors duration-200 hover:text-blue-700 dark:hover:text-amber-300;
        }

        .blog-post-body ul,
        .blog-post-body ol { @apply my-5 ml-7; }
        .blog-post-body li { @apply mb-1 leading-relaxed; }

        .blog-post-body blockquote {
          @apply my-6 p-4 bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-900 dark:border-amber-400 italic text-gray-700 dark:text-gray-300 rounded;
        }

        .blog-post-body code {
          @apply bg-gray-100 dark:bg-gray-800 text-blue-900 dark:text-amber-400 px-1 py-0.5 rounded text-sm font-mono;
        }

        .blog-post-body pre {
          @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-4 rounded-lg overflow-x-auto my-5 font-mono text-sm leading-relaxed;
        }

        .blog-post-body pre code {
          @apply bg-transparent p-0 text-inherit;
        }

        .blog-post-body mark {
          @apply bg-blue-100 dark:bg-amber-900 dark:bg-opacity-30 text-blue-900 dark:text-amber-400 px-1 py-0.5 rounded;
        }

        .blog-post-body img {
          @apply max-w-full h-auto rounded-lg block mx-auto my-6 shadow-md;
        }

        .blog-post-body figure {
          @apply my-6 text-center;
        }

        .blog-post-body figcaption {
          @apply text-sm text-gray-600 dark:text-gray-400 mt-2;
        }

        .blog-post-body table {
          @apply w-full border-collapse my-6 text-sm;
        }

        .blog-post-body th,
        .blog-post-body td {
          @apply border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-gray-900 dark:text-gray-200;
        }

        .blog-post-body th {
          @apply bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-white;
        }

        .blog-post-body tr:nth-child(even) {
          @apply bg-gray-50 dark:bg-gray-900;
        }

        .blog-post-body strong {
          @apply font-bold text-gray-900 dark:text-white;
        }

        .blog-post-body em {
          @apply italic;
        }

        .blog-post-body hr {
          @apply border-none border-t border-gray-300 dark:border-gray-600 my-8;
        }

        /* YouTube & Media Iframe Wrapper - 16:9 Aspect Ratio */
        .blog-post-body .yt-wrapper {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          background: #000;
          overflow: hidden;
        }

        .blog-post-body .yt-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 0.5rem;
        }

        /* CKEditor Media Elements */
        .blog-post-body .media,
        .blog-post-body figure.media {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%;
          margin: 1.5rem 0;
          background: #000;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .blog-post-body .media iframe,
        .blog-post-body figure.media iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 0.5rem;
        }

        /* Image Alignment */
        .blog-post-body .image-style-align-left,
        .blog-post-body figure.image-style-align-left {
          @apply float-left mr-6;
        }

        .blog-post-body .image-style-align-right,
        .blog-post-body figure.image-style-align-right {
          @apply float-right ml-6;
        }

        .blog-post-body::after {
          content: '';
          display: table;
          clear: both;
        }
      `}</style>
    </div>
  );
}