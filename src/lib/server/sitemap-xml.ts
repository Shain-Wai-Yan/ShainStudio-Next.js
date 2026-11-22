import type { MetadataRoute } from 'next';

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
}

export function renderSitemap(entries: MetadataRoute.Sitemap): string {
  const urls = entries.map(entry => {
    const tags = [`<loc>${escapeXml(entry.url)}</loc>`];
    for (const [language, url] of Object.entries(entry.alternates?.languages ?? {})) {
      if (url) tags.push(`<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(url)}"/>`);
    }
    for (const image of entry.images ?? []) tags.push(`<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`);
    if (entry.lastModified) tags.push(`<lastmod>${escapeXml(entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified)}</lastmod>`);
    if (entry.changeFrequency) tags.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
    if (entry.priority !== undefined) tags.push(`<priority>${entry.priority}</priority>`);
    return `<url>${tags.join('')}</url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join('')}</urlset>`;
}
