import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';

const base = process.env.SMOKE_BASE_URL || process.env.BASE_URL || 'http://localhost:3100';
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const sitemapPaths = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname))];
assert.ok(sitemapPaths.length > 0, 'Sitemap must contain routes');
const localeRoot = join(process.cwd(), 'src/app/[locale]');
const staticPaths = readdirSync(localeRoot, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name === 'page.tsx')
  .map(entry => '/' + relative(localeRoot, dirname(join(entry.parentPath ?? entry.path, entry.name))).split(sep).join('/'))
  .filter(pathname => !pathname.includes('['));
const localizedStaticPaths = staticPaths.flatMap(pathname => {
  const english = pathname.replace(/^\/zh(?=\/|$)/, '') || '/';
  return [english, english === '/' ? '/zh' : `/zh${english}`];
});
const photoDetailPaths = sitemapPaths.filter(pathname => pathname.startsWith('/hobbies/photography/photo/'));
const nonPhotoSitemapPaths = sitemapPaths.filter(pathname => !pathname.startsWith('/hobbies/photography/photo/'));
// A representative sample validates the dynamic photo route without turning a
// smoke run into hundreds of origin reads as the gallery grows.
const paths = [...new Set([...nonPhotoSitemapPaths, ...photoDetailPaths.slice(0, 5), ...localizedStaticPaths])];
let index = 0;
const failures = [];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (index < paths.length) {
    const pathname = paths[index++];
    try {
      const response = await fetch(`${base}${pathname}`, { signal: AbortSignal.timeout(25000) });
      await response.text();
      if (response.status !== 200) failures.push(`${pathname}: HTTP ${response.status}`);
    } catch (error) { failures.push(`${pathname}: ${error.message}`); }
  }
}));
assert.deepEqual(failures, [], 'Every published sitemap URL must resolve');

function metaContent(html, key, attribute = 'name') {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.match(new RegExp(`<meta[^>]+${attribute}="${escaped}"[^>]+content="([^"]*)"`, 'i'))?.[1]
    ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+${attribute}="${escaped}"`, 'i'))?.[1];
}

for (const pathname of ['/', '/about', '/blog', '/certificate', '/contact', '/portfolio', '/portfolio/coding-projects']) {
  const html = await (await fetch(`${base}${pathname}`)).text();
  const title = html.match(/<title>(.*?)<\/title>/is)?.[1] ?? '';
  assert.ok(title, `${pathname}: missing title`);
  assert.doesNotMatch(title, /Shain[^<|]*\|[^<]*Shain/i, `${pathname}: duplicated brand in title`);
  assert.ok(metaContent(html, 'description'), `${pathname}: missing description`);
  assert.ok(metaContent(html, 'og:title', 'property'), `${pathname}: missing og:title`);
  assert.ok(metaContent(html, 'og:description', 'property'), `${pathname}: missing og:description`);
  assert.ok(metaContent(html, 'og:image', 'property'), `${pathname}: missing og:image`);
  assert.equal(metaContent(html, 'twitter:card'), 'summary_large_image', `${pathname}: invalid Twitter card`);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.shainwaiyan\.com[^"#]*"/i, `${pathname}: missing canonical`);
}

for (const [pathname, expectedTitle] of [
  ['/', 'Technical Marketing Portfolio | Shain Wai Yan'],
  ['/about', 'About Shain Wai Yan | Technical Marketer'],
  ['/contact', 'Contact Shain Wai Yan | Technical Marketer'],
  ['/portfolio', 'Selected Work | Shain Studio'],
]) {
  const html = await (await fetch(`${base}${pathname}`)).text();
  const title = html.match(/<title>(.*?)<\/title>/is)?.[1] ?? '';
  assert.equal(title, expectedTitle, `${pathname}: inconsistent person/site branding`);
}

const homeHtml = await (await fetch(`${base}/`)).text();
const structuredData = [...homeHtml.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis)]
  .flatMap(match => {
    try {
      const parsed = JSON.parse(match[1]);
      return parsed['@graph'] ?? [parsed];
    } catch { return []; }
  });
const websiteEntity = structuredData.find(node => node['@type'] === 'WebSite');
assert.equal(websiteEntity?.name, 'Shain Studio', 'homepage must identify the website as Shain Studio');
assert.equal(websiteEntity?.creator?.['@id'], 'https://www.shainwaiyan.com/#person');
assert.equal(structuredData.some(node => node['@type'] === 'Organization' && node.name === 'Shain Studio'), false,
  'Shain Studio must not be represented as an organization');

for (const [pathname, canonical] of [
  ['/zh/blog', '/blog'],
  ['/zh/certificate', '/certificate'],
  ['/zh/portfolio/coding-projects', '/portfolio/coding-projects'],
  ['/zh/portfolio/marketing-in-motion', '/portfolio/marketing-in-motion'],
  ['/zh/hobbies/photography', '/hobbies/photography'],
]) {
  const html = await (await fetch(`${base}${pathname}`)).text();
  assert.match(metaContent(html, 'robots') ?? '', /noindex/, `${pathname}: untranslated page must be noindex`);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.shainwaiyan\\.com${canonical}"`), `${pathname}: canonical must target English source`);
  assert.doesNotMatch(html, /hrefLang="zh"/i, `${pathname}: untranslated page must not advertise zh hreflang`);
}

const robotsText = await (await fetch(`${base}/robots.txt`)).text();
assert.doesNotMatch(robotsText, /Disallow:\s*\/_next\//i, 'robots.txt must allow rendering assets');
assert.doesNotMatch(robotsText, /Disallow:\s*\/zh/i, 'noindex pages must remain crawlable');
assert.match(robotsText, /Sitemap:\s*https:\/\/www\.shainwaiyan\.com\/sitemap\.xml/i);
assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.shainwaiyan\.com\/zh\/(?:blog|certificate|portfolio\/[^<]+)/i, 'sitemap contains untranslated Chinese URLs');
assert.doesNotMatch(sitemap, /undefined|null/i, 'sitemap contains invalid values');

for (const [pathname, status] of [
  ['/api/github?username=other&type=file', 400],
  ['/api/github?username=Shain-Wai-Yan&type=file&repo=test&path=../private', 400],
  ['/api/blogs/invalid_slug', 400],
]) {
  const response = await fetch(`${base}${pathname}`);
  assert.equal(response.status, status, pathname);
}
const redirect = await fetch(`${base}/en/blog?page=2`, { redirect: 'manual' });
assert.equal(redirect.status, 301);
assert.equal(new URL(redirect.headers.get('location'), base).pathname, '/blog');
assert.equal(new URL(redirect.headers.get('location'), base).search, '?page=2');
const english = await fetch(`${base}/?utm_source=test`, {
  redirect: 'manual', headers: { cookie: 'NEXT_LOCALE=en', 'accept-language': 'zh-CN' },
});
assert.equal(english.status, 200);
console.log(`Passed: ${paths.length} routes, locale behavior, SEO metadata, robots/sitemap rules, and API rejection checks.`);
