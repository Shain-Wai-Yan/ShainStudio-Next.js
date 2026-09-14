/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS Node test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Exercise actual TypeScript modules with isolated network/framework dependencies.
function load(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } });
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`, mocks);
    return require(name);
  }, loaded, loaded.exports);
  return loaded.exports;
}
const image = load('src/lib/cloudinaryLoader.ts').default;
const { boundedInteger } = load('src/lib/utils/pagination.ts');
const { serializeJsonLd } = load('src/lib/utils/json-ld.ts');
const { extractUrl } = load('src/lib/strapi/client.ts');

test('Cloudinary preserves underscore-containing public IDs and folders', () => {
  for (const name of ['my_photo.jpg', 'my_folder/photo.jpg', 'v123/my_photo.jpg']) {
    assert.ok(image({ src: `https://res.cloudinary.com/demo/image/upload/${name}`, width: 640 }).endsWith(`/c_limit,w_640,q_auto,f_auto/${name}`));
  }
});
test('Cloudinary preserves intentional transformation chains', () => {
  assert.equal(image({ src: 'https://res.cloudinary.com/demo/image/upload/c_crop,w_400,h_200/e_grayscale/v123/photo.jpg', width: 320 }),
    'https://res.cloudinary.com/demo/image/upload/c_crop,w_400,h_200/e_grayscale/c_limit,w_320,q_auto,f_auto/v123/photo.jpg');
});
test('Cloudinary leaves foreign hosts and signed URLs unchanged', () => {
  for (const src of ['https://cloudinary.com.evil.test/image/upload/photo.jpg', '/images/test.webp', 'https://res.cloudinary.com/demo/image/upload/s--signature--/photo.jpg']) {
    assert.equal(image({ src, width: 320 }), src);
  }
});
test('pagination rejects malformed numbers and caps excessive requests', () => {
  for (const value of ['wat', '0', '-5', 'Infinity', '2.5', null, '']) assert.equal(boundedInteger(value, 12, 100), 12);
  assert.equal(boundedInteger('100000', 12, 100), 100);
  assert.equal(boundedInteger('3', 12, 100), 3);
});
test('JSON-LD cannot terminate its script element and round-trips unchanged', () => {
  const payload = { title: '</script><script>alert(1)</script>', unicode: '中文' };
  const json = serializeJsonLd(payload);
  assert.equal(json.includes('<'), false);
  assert.deepEqual(JSON.parse(json), payload);
});
test('relative CMS media URLs do not retain the /api prefix', () => {
  assert.equal(new URL(extractUrl({ url: '/uploads/test.jpg' })).pathname, '/uploads/test.jpg');
  assert.equal(new URL(extractUrl({ data: { attributes: { url: '/uploads/test.jpg' } } })).pathname, '/uploads/test.jpg');
});
const responses = {
  next: () => ({ kind: 'next' }),
  redirect: url => ({ kind: 'redirect', url, cookies: { set() {} } }),
  rewrite: url => ({ kind: 'rewrite', url }),
};
const { proxy } = load('src/proxy.ts', { 'next/server': { NextResponse: responses } });
function request(url, preference, language = 'en') {
  const nextUrl = new URL(url);
  nextUrl.clone = () => new URL(url);
  return { url, nextUrl, cookies: { get: () => preference ? { value: preference } : undefined }, headers: new Headers({ 'accept-language': language }) };
}
test('locale rewrites preserve searches and pagination', () => {
  const response = proxy(request('https://example.test/blog?page=2&search=hello'));
  assert.equal(response.url.pathname, '/en/blog');
  assert.equal(response.url.search, '?page=2&search=hello');
});
test('saved English preference overrides browser Chinese preference', () => {
  const response = proxy(request('https://example.test/?utm_source=test', 'en', 'zh-CN'));
  assert.equal(response.kind, 'rewrite');
  assert.equal(response.url.pathname, '/en/');
  assert.equal(response.url.search, '?utm_source=test');
});
test('Chinese redirect retains attribution parameters', () => {
  const response = proxy(request('https://example.test/?utm_source=test', 'zh'));
  assert.equal(response.url.pathname, '/zh');
  assert.equal(response.url.search, '?utm_source=test');
});
test('blog language filters run before pagination and failures are not empty success', async () => {
  const calls = [];
  const { getBlogPosts } = load('src/lib/server/blog-data.ts', {
    '@/lib/strapi/client': { fetchFromStrapi: async (endpoint, options) => {
      calls.push(options.queryParams);
      return { data: { data: [], meta: { pagination: { total: 0, pageCount: 0 } } }, error: null };
    } },
  });
  await getBlogPosts(new URLSearchParams('language=zh&page=2&pageSize=999'));
  assert.equal(calls[0]['filters[slug][$startsWith]'], 'zh-');
  assert.equal(calls[0]['pagination[page]'], 2);
  assert.equal(calls[0]['pagination[pageSize]'], 100);
  const failed = load('src/lib/server/blog-data.ts', { '@/lib/strapi/client': { fetchFromStrapi: async () => ({ data: null, error: 'offline' }) } });
  await assert.rejects(failed.getBlogPosts(new URLSearchParams()), /offline/);
});
test('GitHub rejects foreign profiles and traversal before any network request', async () => {
  const { GET } = load('src/app/api/github/route.ts', { 'next/server': { NextResponse: { json: (data, options) => ({ data, status: options?.status ?? 200 }) } } });
  for (const query of ['username=someone-else&type=file', 'username=Shain-Wai-Yan&type=file&repo=private&path=../secrets']) {
    assert.equal((await GET({ nextUrl: new URL(`https://example.test/api/github?${query}`) })).status, 400);
  }
});
test('GitHub file requests never forward the server token and encode branch names', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return Response.json({ name: 'README.md', content: 'aGVsbG8=' });
  };
  try {
    const { GET } = load('src/app/api/github/route.ts', { 'next/server': { NextResponse: { json: (data, options) => ({ data, status: options?.status ?? 200 }) } } });
    const result = await GET({ nextUrl: new URL('https://example.test/api/github?username=Shain-Wai-Yan&type=file&repo=public-repo&path=README.md&branch=feature%2Fdocs') });
    assert.equal(result.status, 200);
    assert.equal(new Headers(calls[0].options.headers).has('authorization'), false);
    assert.ok(calls[0].url.endsWith('?ref=feature%2Fdocs'));
  } finally { global.fetch = originalFetch; }
});
test('GitHub asynchronous upstream failures reach the API error response', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error('offline'); };
  try {
    const { GET } = load('src/app/api/github/route.ts', { 'next/server': { NextResponse: { json: (data, options) => ({ data, status: options?.status ?? 200 }) } } });
    const result = await GET({ nextUrl: new URL('https://example.test/api/github?username=Shain-Wai-Yan&type=user') });
    assert.equal(result.status, 500);
    assert.equal(JSON.stringify(result.data).includes('offline'), false);
  } finally { global.fetch = originalFetch; }
});
test('CMS GET requests carry a bounded refresh policy and timeout signal', async () => {
  const originalFetch = global.fetch;
  let options;
  global.fetch = async (url, init) => { options = init; return Response.json({ data: [] }); };
  try {
    const { fetchFromStrapi } = load('src/lib/strapi/client.ts');
    const result = await fetchFromStrapi('blogs');
    assert.equal(result.error, null);
    assert.equal(options.next.revalidate, 300);
    assert.ok(options.signal instanceof AbortSignal);
  } finally { global.fetch = originalFetch; }
});
test('blog category menus retain secondary categories', async () => {
  const { fetchBlogCategories } = load('src/lib/server/blogs.ts', {
    react: { cache: fn => fn },
    './blog-data': { getBlogPosts: async () => ({ posts: [{ id: 1, title: 'Test', slug: 'test', categories: ['Primary', 'Secondary'] }], total: 1, pageCount: 1 }) },
  });
  assert.deepEqual((await fetchBlogCategories('en')).categories, ['Primary', 'Secondary']);
});
test('project lookups distinguish missing content from CMS outages', async () => {
  for (const [file, name] of [['coding-projects', 'fetchCodingProjectBySlug'], ['marketing-in-motion', 'fetchMarketingProjectBySlug']]) {
    const missing = load(`src/lib/strapi/${file}.ts`, { './client': { fetchFromStrapi: async () => ({ data: { data: [] }, error: null }) } });
    assert.deepEqual(await missing[name]('missing'), { project: null, error: null });
    const offline = load(`src/lib/strapi/${file}.ts`, { './client': { fetchFromStrapi: async () => ({ data: null, error: 'Request timed out' }) } });
    assert.deepEqual(await offline[name]('real-project'), { project: null, error: 'Request timed out' });
  }
});

test('project collection queries exclude detail-only bodies and galleries', async () => {
  for (const [file, name] of [['coding-projects', 'fetchCodingProjects'], ['marketing-in-motion', 'fetchMarketingProjects']]) {
    let query;
    const projectModule = load(`src/lib/strapi/${file}.ts`, { './client': {
      extractUrl: () => '',
      fetchFromStrapi: async (_endpoint, options) => {
        query = options.queryParams;
        return { data: { data: [], meta: { pagination: { total: 0 } } }, error: null };
      },
    } });
    await projectModule[name](1, 100);
    assert.equal(query.populate, undefined);
    assert.equal(Object.values(query).includes('content'), false);
    assert.equal(Object.values(query).includes('imageGallery'), false);
    assert.equal(query['populate[coverImage][fields][0]'], 'url');
    assert.equal(query['populate[category][fields][0]'], 'name');
  }
});

test('marketing and coding projects normalize Strapi v4 and v5 entry shapes', () => {
  for (const [file, transform] of [['coding-projects', 'transformCodingProject'], ['marketing-in-motion', 'transformMarketingProject']]) {
    const projectModule = load(`src/lib/strapi/${file}.ts`, { './client': { extractUrl: () => '' } });
    const fields = { title: 'Project', slug: 'project', summary: 'Summary', content: '<p>Body</p>', category: { name: 'Web' } };
    const v5 = projectModule[transform]({ id: 1, ...fields });
    const v4 = projectModule[transform]({ id: 1, attributes: fields });
    assert.equal(v4.title, v5.title);
    assert.equal(v4.slug, v5.slug);
    assert.equal(v4.category, v5.category);
  }
});

test('document descriptions preserve supported content and reject executable HTML', () => {
  const { sanitizeDescription } = load('src/lib/utils/sanitize-description.ts');
  const safe = sanitizeDescription('<p>Plan <strong>summary</strong> <a href="https://example.test/file">source</a></p>');
  assert.match(safe, /<strong>summary<\/strong>/);
  assert.match(safe, /href="https:\/\/example.test\/file"/);
  assert.match(safe, /rel="noopener noreferrer"/);
  const unsafe = sanitizeDescription('<script>alert(1)</script><img src=x onerror=alert(1)><iframe src="https://example.test"></iframe><a href="javascript:alert(1)" onclick="alert(1)">link</a><h2>Heading text</h2>');
  assert.doesNotMatch(unsafe, /<script|<img|<iframe|javascript:|onclick|<h2/);
  assert.match(unsafe, /Heading text/);
});

test('blog v4/v5 fixtures produce the same frontend contract and absolute media URLs', async () => {
  const fields = {
    Title: 'Fixture blog', slug: 'fixture-blog', excerpt: 'Summary', content: '<p>Body</p>',
    publishDate: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
    featuredImage: { url: '/uploads/blog.jpg' }, categories: [{ name: 'Strategy' }], tags: [{ name: 'CMS' }],
    Seo: { metaTitle: 'SEO title', ogImage: { url: '/uploads/og.jpg' } },
  };
  const v4 = { ...fields, featuredImage: { data: { attributes: fields.featuredImage } },
    categories: { data: [{ attributes: { name: 'Strategy' } }] }, tags: { data: [{ attributes: { name: 'CMS' } }] },
    Seo: { ...fields.Seo, ogImage: { data: { attributes: fields.Seo.ogImage } } },
  };
  const outputs = [];
  for (const record of [{ id: 7, ...fields }, { id: 7, attributes: v4 }]) {
    const { getBlogPosts, getBlogPost } = load('src/lib/server/blog-data.ts', {
      '@/lib/strapi/client': { fetchFromStrapi: async () => ({ data: { data: [record], meta: { pagination: { total: 1, pageCount: 1 } } }, error: null }) },
    });
    const full = await getBlogPost('fixture-blog');
    const minimal = await getBlogPosts(new URLSearchParams('minimal=true&language=en'));
    assert.equal(minimal.posts[0].content, undefined);
    assert.equal(minimal.posts[0].readingTime, '1 min read');
    assert.equal(full.content, '<p>Body</p>');
    assert.equal(new URL(full.featuredImage).pathname, '/uploads/blog.jpg');
    assert.equal(new URL(full.seo.ogImageUrl).pathname, '/uploads/og.jpg');
    outputs.push(full);
  }
  assert.deepEqual(outputs[0], outputs[1]);
});

test('photography v4/v5 fixtures preserve flattened fields, dimensions, relations and dates', async () => {
  const originalFetch = global.fetch;
  const fields = { title: 'Photo', location: 'Yangon', description: 'Example',
    image: { url: '/uploads/photo.jpg', width: 1200, height: 800 }, category: { name: 'Street' },
    tags: [{ name: 'Travel' }], language: 'en', alt_text: 'A street',
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' };
  const v4 = { ...fields, image: { data: { attributes: fields.image } },
    category: { data: { attributes: fields.category } }, tags: { data: [{ attributes: { name: 'Travel' } }] } };
  const outputs = [];
  try {
    for (const record of [{ id: 8, ...fields }, { id: 8, attributes: v4 }]) {
      global.fetch = async () => Response.json({ data: [record], meta: { pagination: { total: 1, pageCount: 1 } } });
      const { getPhotography } = load('src/lib/server/photography-data.ts');
      const result = await getPhotography(new URLSearchParams('page=1&pageSize=20'));
      const photo = result.photos[0];
      assert.equal(result.total, 1);
      assert.equal(photo.title, 'Photo');
      assert.equal(photo.category, 'Street');
      assert.deepEqual(photo.tags, ['Travel']);
      assert.equal(photo.width, 1200);
      assert.equal(photo.height, 800);
      assert.equal(photo.createdAt, fields.createdAt);
      assert.equal(photo.updatedAt, fields.updatedAt);
      assert.equal(new URL(photo.image).pathname, '/uploads/photo.jpg');
      outputs.push(photo);
    }
    assert.deepEqual(outputs[0], outputs[1]);
  } finally { global.fetch = originalFetch; }
});

test('photography seed buckets produce stable duplicate-free page orders', () => {
  const { seededPageOrder, normalizeSeed, slugifyCollection } = load('src/lib/server/photography-data.ts');
  const first = seededPageOrder(42, 17);
  const again = seededPageOrder(42, 17);
  const different = seededPageOrder(42, 18);
  assert.deepEqual(first, again);
  assert.equal(new Set(first).size, 42);
  assert.deepEqual([...first].sort((a, b) => a - b), Array.from({ length: 42 }, (_, index) => index + 1));
  assert.notDeepEqual(first, different);
  assert.equal(first.at(-1), 42, 'partial final page must stay last');
  assert.equal(normalizeSeed(145), 17);
  assert.equal(slugifyCollection('Sunset & Sunrise'), 'sunset-and-sunrise');
});

test('SEO helpers prevent duplicated brands and reject foreign CMS canonicals', () => {
  const { brandedTitle, safeCanonicalUrl, personJsonLd, websiteJsonLd } = load('src/lib/seo.ts');
  assert.equal(brandedTitle('Portfolio'), 'Portfolio | Shain Wai Yan');
  assert.equal(brandedTitle('Portfolio | Shain Studio', 'Shain Studio'), 'Portfolio | Shain Studio');
  assert.equal(
    safeCanonicalUrl('/portfolio/project', 'https://www.shainwaiyan.com/fallback'),
    'https://www.shainwaiyan.com/portfolio/project',
  );
  assert.equal(
    safeCanonicalUrl('https://malicious.example/project', 'https://www.shainwaiyan.com/fallback'),
    'https://www.shainwaiyan.com/fallback',
  );
  const person = personJsonLd('en');
  const website = websiteJsonLd('en');
  assert.deepEqual(person.alternateName, ['Xolbine', '明元易']);
  assert.equal('worksFor' in person, false);
  assert.equal('founder' in person, false);
  assert.equal(website.name, 'Shain Studio');
  assert.deepEqual(website.creator, { '@id': 'https://www.shainwaiyan.com/#person' });
  assert.deepEqual(website.publisher, { '@id': 'https://www.shainwaiyan.com/#person' });
});

test('YouTube channels are allowlisted and malformed dates stay readable', () => {
  const { getYouTubeChannelConfig } = load('src/lib/youtube-channels.ts');
  const { formatPublishedDate } = load('src/lib/youtube-utils.ts');
  assert.equal(getYouTubeChannelConfig('gaming').channelId, 'UCxkWgKCJFMtjjq8vK9xTd6g');
  assert.equal(getYouTubeChannelConfig('unknown-channel'), null);
  assert.equal(formatPublishedDate(''), 'Unknown date');
});

test('YouTube proxy fails closed and the retired standalone Worker stays absent', () => {
  const amvRoutePath = path.join(__dirname, '..', 'src/app/api/amv-editing/route.ts');
  assert.equal(fs.existsSync(amvRoutePath), false, 'Deprecated /api/amv-editing route should be removed');
  const youtubeRoute = fs.readFileSync(path.join(__dirname, '..', 'src/app/api/youtube/route.ts'), 'utf8');
  assert.match(youtubeRoute, /status: 502/);
  assert.doesNotMatch(youtubeRoute, /export async function POST/);
  const workerPath = path.join(__dirname, '..', 'youtube-apis-fetcher.js');
  assert.equal(fs.existsSync(workerPath), false, 'Retired standalone Worker must not silently return');
});

test('art records normalize Strapi v4/v5 media and never invent CMS content', async () => {
  const fields = {
    title: 'Study', slug: 'study', alt_text: '', date_created: '2026-01-02',
    description: '<p>Safe</p><script>bad()</script>', is_featured: true,
    createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z',
  };
  const media = { url: '/uploads/study.jpg', width: 900, height: 1200, alternativeText: 'CMS alt' };
  for (const record of [
    { id: 7, documentId: 'doc-7', ...fields, image: media },
    { id: 7, documentId: 'doc-7', attributes: { ...fields, image: { data: { attributes: media } } } },
  ]) {
    const art = load('src/lib/server/art-data.ts', {
      '@/lib/strapi/client': { fetchFromStrapi: async () => ({ data: { data: [record], meta: { pagination: { total: 1, pageCount: 1 } } }, error: null }) },
    });
    const result = await art.getArtPieces({ pageSize: 1 });
    assert.equal(result.arts[0].width, 900);
    assert.equal(result.arts[0].height, 1200);
    assert.equal(result.arts[0].altText, 'CMS alt');
    assert.equal(result.arts[0].description.includes('<script>'), false);
  }

  const empty = load('src/lib/server/art-data.ts', {
    '@/lib/strapi/client': { fetchFromStrapi: async () => ({ data: { data: [], meta: { pagination: { total: 0, pageCount: 0 } } }, error: null }) },
  });
  assert.deepEqual((await empty.getArtPieces()).arts, []);
  assert.equal(await empty.getArtPieceBySlug('silent-reverie-in-graphite'), null);

  const offline = load('src/lib/server/art-data.ts', {
    '@/lib/strapi/client': { fetchFromStrapi: async () => ({ data: null, error: 'offline' }) },
  });
  await assert.rejects(offline.getArtPieces(), /offline/);
});

test('art API rejects malformed and excessive pagination before reaching the CMS', async () => {
  let calls = 0;
  const { GET } = load('src/app/api/art/route.ts', {
    'next/server': {
      NextResponse: { json: (data, options = {}) => ({ data, status: options.status ?? 200, headers: options.headers }) },
    },
    '@/lib/server/art-data': {
      getArtPieces: async () => { calls += 1; return { arts: [], total: 0, pageCount: 0, page: 1 }; },
      getArtPieceBySlug: async () => null,
    },
  });
  for (const query of ['page=Infinity', 'page=-1', 'page=10001', 'pageSize=101', 'pageSize=2.5']) {
    const response = await GET({ nextUrl: new URL(`https://example.test/api/art?${query}`) });
    assert.equal(response.status, 400);
  }
  assert.equal(calls, 0);
});

test('CMS detail routes use on-demand ISR without fetching content during builds', () => {
  for (const [file, seconds] of [
    ['src/app/[locale]/blog/[slug]/page.tsx', 300],
    ['src/app/[locale]/hobbies/pencil-art/[slug]/page.tsx', 3600],
    ['src/app/[locale]/portfolio/coding-projects/[slug]/page.tsx', 300],
    ['src/app/[locale]/portfolio/marketing-in-motion/[slug]/page.tsx', 300],
  ]) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(source, /force-dynamic/);
    assert.match(source, /export function generateStaticParams\(\)\s*\{\s*return \[\];\s*\}/);
    assert.match(source, new RegExp(`export const revalidate = ${seconds}`));
  }
});

test('repository markdown is sanitized before either HTML rendering path', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'src/components/coding-project/RepoViewer.tsx'),
    'utf8',
  );
  assert.match(source, /sanitizeHtml\(html,/);
  assert.match(source, /setRenderedHTML\(sanitizeMarkdownHtml\(html\)\)/);
  assert.match(source, /setRenderedHTML\(sanitizeMarkdownHtml\(basicMarkdown\(text, isDark\)\)\)/);
  assert.match(source, /allowedSchemesByTag:\s*\{\s*img:\s*\[['"]http['"], ['"]https['"]\]/);
});

test('CSP is enforced and production scripts cannot use eval', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'next.config.ts'), 'utf8');
  assert.match(source, /key: ["']Content-Security-Policy["']/);
  assert.doesNotMatch(source, /Content-Security-Policy-Report-Only/);
  assert.match(source, /isDevelopment \? ["'] 'unsafe-eval'["'] : ['"]/);
  for (const directive of ['object-src \'none\'', 'base-uri \'self\'', 'frame-ancestors \'self\'']) {
    assert.equal(source.includes(directive), true);
  }
  assert.doesNotMatch(source, /["']upgrade-insecure-requests["']/);
  assert.match(source, /isDevelopment \? ['"] ws: wss:/);
});

test('analytics vendors mount only after explicit or regional permission', () => {
  const manager = fs.readFileSync(path.join(__dirname, '..', 'src/components/analytics/AnalyticsConsent.tsx'), 'utf8');
  const layout = fs.readFileSync(path.join(__dirname, '..', 'src/app/[locale]/layout.tsx'), 'utf8');
  assert.match(manager, /consent === ['"]granted['"]/);
  assert.match(manager, /readAnalyticsConsent\(\)/);
  assert.match(manager, /writeAnalyticsConsent\(nextConsent\)/);
  assert.match(manager, /Clarity\.consent\(false\)/);
  assert.match(manager, /removeAnalyticsCookies\(\)/);
  assert.match(manager, /fetch\(['"]\/api\/analytics-region['"]/);
  assert.match(manager, /sessionStorage/);
  assert.doesNotMatch(layout, /<GoogleAnalytics|<ClarityAnalytics/);
});

test('analytics region detection requires consent in Europe and for unknown locations', () => {
  const { GET } = load('src/app/api/analytics-region/route.ts', {
    'next/server': {
      NextResponse: { json: (data, options = {}) => ({ data, headers: options.headers }) },
    },
  });
  const request = (country, continent) => ({ headers: new Headers({
    ...(country ? { 'x-vercel-ip-country': country } : {}),
    ...(continent ? { 'x-vercel-ip-continent': continent } : {}),
  }) });
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    assert.equal(GET(request('DE', 'EU')).data.consentRequired, true);
    assert.equal(GET(request('GB', 'EU')).data.consentRequired, true);
    assert.equal(GET(request('CH', 'EU')).data.consentRequired, true);
    assert.equal(GET(request('US', 'NA')).data.consentRequired, false);
    assert.equal(GET(request()).data.consentRequired, true);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});

test('PDF viewer uses a same-origin worker and CSP permits Cloudinary document fetches', () => {
  const viewer = fs.readFileSync(path.join(__dirname, '..', 'src/components/DocumentViewer.tsx'), 'utf8');
  const config = fs.readFileSync(path.join(__dirname, '..', 'next.config.ts'), 'utf8');
  assert.match(viewer, /new URL\(\s*['"]pdfjs-dist\/build\/pdf\.worker\.min\.mjs['"]/);
  assert.doesNotMatch(viewer, /unpkg\.com/);
  assert.match(config, /connect-src[^\n]+https:\/\/res\.cloudinary\.com/);
  assert.match(config, /worker-src 'self' blob:/);
});

test('decorative textures do not depend on CSP-blocked Unsplash images', () => {
  for (const file of [
    'src/app/[locale]/contact/contact-form.tsx',
    'src/components/certificates/VaultHero.tsx',
  ]) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(source, /images\.unsplash\.com/);
    assert.match(source, /radial-gradient/);
  }
});

test('automatic regional analytics enables custom events without persisting travel-sensitive consent', () => {
  const previousWindow = global.window;
  const storage = (values = {}) => ({
    getItem: key => Object.hasOwn(values, key) ? values[key] : null,
    setItem: (key, value) => { values[key] = value; },
  });
  try {
    global.window = {
      localStorage: storage(),
      sessionStorage: storage({ 'shain-studio:analytics-region:v1': 'automatic' }),
    };
    let consent = load('src/lib/analytics-consent.ts');
    assert.equal(consent.readAnalyticsConsent(), null);
    assert.equal(consent.readEffectiveAnalyticsConsent(), 'granted');

    consent.updateGoogleAnalyticsConsent('denied');
    consent.updateGoogleAnalyticsConsent('granted');
    assert.deepEqual(global.window.dataLayer, [
      ['consent', 'update', { analytics_storage: 'denied' }],
      ['consent', 'update', { analytics_storage: 'granted' }],
    ]);

    global.window.localStorage.setItem(consent.ANALYTICS_CONSENT_KEY, 'denied');
    consent = load('src/lib/analytics-consent.ts');
    assert.equal(consent.readEffectiveAnalyticsConsent(), 'denied');

    const trackedLink = fs.readFileSync(path.join(__dirname, '..', 'src/components/analytics/TrackedLink.tsx'), 'utf8');
    assert.match(trackedLink, /readEffectiveAnalyticsConsent\(\) === ['"]granted['"]/);
  } finally {
    global.window = previousWindow;
  }
});

test('contact and newsletter share one configurable production Worker URL', () => {
  const contact = fs.readFileSync(path.join(__dirname, '..', 'src/app/[locale]/contact/contact-form.tsx'), 'utf8');
  const newsletter = fs.readFileSync(path.join(__dirname, '..', 'src/components/blog/BlogHero.tsx'), 'utf8');
  const workerUrl = fs.readFileSync(path.join(__dirname, '..', 'src/lib/form-worker.ts'), 'utf8');
  const config = fs.readFileSync(path.join(__dirname, '..', 'next.config.ts'), 'utf8');
  for (const source of [contact, newsletter]) {
    assert.match(source, /FORM_WORKER_URL/);
    assert.doesNotMatch(source, /form-collector\.shainwaiyan\.com/);
    assert.doesNotMatch(source, /NEXT_PUBLIC_HUBSPOT_(PORTAL|FORM)_ID/);
  }
  assert.match(contact, /formType: ['"]contact['"]/);
  assert.match(newsletter, /formType: ['"]newsletter['"]/);
  assert.doesNotMatch(newsletter, /HUBSPOT_(PORTAL|FORM)_ID/);
  assert.match(workerUrl, /NEXT_PUBLIC_CLOUDFLARE_WORKER_URL/);
  assert.match(workerUrl, /https:\/\/form\.shainwaiyan\.com/);
  assert.match(config, /formWorkerOrigin/);
});

test('contact message input enforces its documented 500-character limit', () => {
  const contact = fs.readFileSync(path.join(__dirname, '..', 'src/app/[locale]/contact/contact-form.tsx'), 'utf8');
  assert.match(contact, /<textarea[\s\S]*?name=['"]message['"][\s\S]*?maxLength=\{500\}/);
});

test('mobile footer keeps copyright and policy links on single compact lines', () => {
  const footer = fs.readFileSync(path.join(__dirname, '..', 'src/components/Footer.tsx'), 'utf8');
  assert.match(footer, /whitespace-nowrap text-\[clamp\(0\.5rem,2\.25vw,0\.7rem\)\]/);
  assert.match(footer, /flex w-full md:w-auto items-center justify-center flex-nowrap/);
  assert.match(footer, /text-\[clamp\(0\.48rem,2\.2vw,0\.7rem\)\] md:text-\[0\.7rem\]/);
  assert.match(footer, /flex flex-col md:flex-row/);
});
