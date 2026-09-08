import { fetchFromStrapi } from '@/lib/strapi/client';
import { SITE_NAME, SITE_URL, PERSON } from '@/lib/seo';

// NOTE: this route MUST live at a dotted path (/feed.xml) — middleware rewrites
// non-dotted, non-locale paths to /en/*, so a plain /feed would 404.

export const revalidate = 3600;

interface FeedBlogItem {
  slug: string;
  Title?: string; // raw Strapi field is capitalized
  excerpt?: string;
  publishDate?: string;
  updatedAt?: string;
}

interface StrapiFeedResponse {
  data: FeedBlogItem[];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const res = await fetchFromStrapi<StrapiFeedResponse>('blogs', {
    queryParams: {
      'pagination[pageSize]': 50,
      // Field names must match the raw Strapi schema exactly ('Title' is
      // capitalized there); unknown fields make the request fail.
      'fields[0]': 'slug',
      'fields[1]': 'Title',
      'fields[2]': 'excerpt',
      'fields[3]': 'publishDate',
      'fields[4]': 'updatedAt',
      'sort': 'publishDate:desc',
    },
    // The Strapi backend can cold-start slowly; the default 3s timeout
    // produces an empty (but valid) feed that only heals on revalidation.
    timeout: 10000,
  });

  const posts = res.data?.data ?? [];

  const items = posts
    .filter((post) => post.slug)
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = post.publishDate || post.updatedAt;
      return [
        '    <item>',
        `      <title>${escapeXml(post.Title || post.slug)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        pubDate ? `      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>` : null,
        post.excerpt ? `      <description>${escapeXml(post.excerpt)}</description>` : null,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Digital Marketing Blog | ${SITE_NAME}`)}</title>
    <link>${SITE_URL}/blog</link>
    <description>Digital marketing, brand strategy, and marketing technology articles by ${escapeXml(PERSON.name)} (Xolbine).</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
