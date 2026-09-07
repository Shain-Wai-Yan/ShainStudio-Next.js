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
const { middleware } = load('middleware.ts', { 'next/server': { NextResponse: responses } });
function request(url, preference, language = 'en') {
  const nextUrl = new URL(url);
  nextUrl.clone = () => new URL(url);
  return { url, nextUrl, cookies: { get: () => preference ? { value: preference } : undefined }, headers: new Headers({ 'accept-language': language }) };
}
test('locale rewrites preserve searches and pagination', () => {
  const response = middleware(request('https://example.test/blog?page=2&search=hello'));
  assert.equal(response.url.pathname, '/en/blog');
  assert.equal(response.url.search, '?page=2&search=hello');
});
test('saved English preference overrides browser Chinese preference', () => {
  const response = middleware(request('https://example.test/?utm_source=test', 'en', 'zh-CN'));
  assert.equal(response.kind, 'rewrite');
  assert.equal(response.url.pathname, '/en');
  assert.equal(response.url.search, '?utm_source=test');
});
test('Chinese redirect retains attribution parameters', () => {
  const response = middleware(request('https://example.test/?utm_source=test', 'zh'));
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
