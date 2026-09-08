import type { BlogPost } from '@/lib/strapi/blogs';
import RichTextRenderer from '../shared/RichTextRenderer';
import CopyLinkButton from './CopyLinkButton';

interface BlogPostContentProps {
  blog: BlogPost;
  language: 'en' | 'zh';
}

export default function BlogPostContent({ blog, language }: BlogPostContentProps) {

  return (
    <div>
      {/* Post body Rendered via Parser */}
      <RichTextRenderer content={blog.Content || ''} className="ck-body" />

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
          <CopyLinkButton url={`https://www.shainwaiyan.com/blog/${blog.Slug}`} />

        </div>
      </div>


    </div>
  );
}
