import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://localhost:3100';
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const paths = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname))];
assert.ok(paths.length > 0, 'Sitemap must contain routes');
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
console.log(`Passed: ${paths.length} sitemap routes, locale redirects/preferences, and API rejection checks.`);
