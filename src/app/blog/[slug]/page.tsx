import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogBySlug, fetchRelatedBlogs } from '@/lib/strapi/blogs';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import RelatedPosts from '@/components/blog/RelatedPosts';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const { blog } = await fetchBlogBySlug(slug, 'en');
  if (!blog) return { title: 'Post Not Found' };

  return {
    title: `${blog.Title} | Shain Studio`,
    description: blog.Description,
    authors: blog.Author ? [{ name: blog.Author }] : undefined,
    keywords: blog.Tags?.join(', '),
    alternates: {
      canonical: `/blog/${blog.Slug}`,
      languages: { en: `/blog/${blog.Slug}`, zh: `/zh/blog/${blog.Slug}` },
    },
    openGraph: {
      type: 'article',
      url: `https://www.shainwaiyan.com/blog/${blog.Slug}`,
      title: blog.Title,
      description: blog.Description,
      images: blog.FeaturedImage ? [blog.FeaturedImage] : [],
      authors: blog.Author ? [blog.Author] : undefined,
    },
  };
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const { slug } = await props.params;
  const { blog, error } = await fetchBlogBySlug(slug, 'en');

  if (error || !blog) notFound();

  const { blogs: relatedBlogs } = await fetchRelatedBlogs(blog.Category, blog.Slug, 'en', 3);

  return (
    <main className="min-h-screen bg-white dark:bg-[#121212]">

      {/* ── Breadcrumb — matches vanilla .breadcrumb ── */}
      <nav className="bg-[#f8f9fa] dark:bg-[#1e1e1e] px-4 sm:px-6 lg:px-8 py-3 border-b border-[#d0d0d0] dark:border-[#444]">
        <ol className="flex items-center gap-1.5 text-xs max-w-5xl mx-auto flex-wrap">
          <li>
            <Link href="/" className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors">
              Home
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li>
            <Link href="/blog" className="text-[#191970] dark:text-[#ffd700] hover:underline transition-colors">
              Blog
            </Link>
          </li>
          <li className="text-[#999]">›</li>
          <li className="text-[#333] dark:text-[#e0e0e0] font-medium truncate max-w-[200px] sm:max-w-xs">
            {blog.Title}
          </li>
        </ol>
      </nav>

      {/* ── Post header (featured image + meta) ── */}
      <BlogPostHeader blog={blog} language="en" />

      {/* ── Post body ── */}
      <section className="py-8 md:py-12">
        {/* Max-width container matching vanilla .blog-post (800px) */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <BlogPostContent blog={blog} language="en" />
        </div>
      </section>

     

      {/* ── Related posts ── */}
      {relatedBlogs.length > 0 && (
        <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <RelatedPosts posts={relatedBlogs} language="en" />
          </div>
        </div>
      )}
    </main>
  );
}