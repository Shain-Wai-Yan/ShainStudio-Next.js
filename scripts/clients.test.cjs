/* eslint-disable @typescript-eslint/no-require-imports -- Isolated TypeScript test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(file, mocks) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(name => {
    if (name === 'server-only') return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    return require(name);
  }, loaded, loaded.exports);
  return loaded.exports;
}

function clients(fetcher, cache = fn => fn) {
  return load('src/lib/server/clients.ts', {
    'next/cache': { unstable_cache: cache },
    '@/lib/strapi/config': { STRAPI_API_URL: 'https://api.test/api', STRAPI_ORIGIN_URL: 'https://api.test' },
    '@/lib/strapi/client': { fetchFromStrapi: fetcher },
  });
}
const record = (id, name = id, url = '/uploads/logo.png') => ({ documentId: id, name, image: { url, mime: 'image/png' } });
const page = (data, number = 1, total = data.length, pageSize = 100) => ({ data: { data, meta: { pagination: { page: number, pageSize, pageCount: Math.ceil(total / pageSize), total } } }, error: null });

test('clients normalize actual Strapi 5 identifiers, names and relative/absolute image URLs', () => {
  const { normalizeClient } = clients();
  assert.deepEqual(normalizeClient(record('abc123', '  We Care  ')), { id: 'abc123', alt: 'We Care', src: 'https://api.test/uploads/logo.png' });
  assert.equal(normalizeClient(record('abc123', 'Logo Company', 'https://res.cloudinary.com/demo/image/upload/logo.png')).src, 'https://res.cloudinary.com/demo/image/upload/logo.png');
  for (const value of [null, [], {}, { ...record('a'), documentId: ' ' }, record('a', ' '), record('a', 'a', 'javascript:alert(1)'), record('a', 'a', 'https://user:secret@cdn.test/a.png'), { ...record('a'), image: [] }, { ...record('a'), image: { url: '/file.pdf', mime: 'application/pdf' } }]) assert.equal(normalizeClient(value), null);
});

test('all pages are uncached inner reads; results sort deterministically and skip malformed individual rows', async () => {
  const calls = [];
  const api = clients(async (endpoint, options) => {
    calls.push({ endpoint, options });
    return options.queryParams['pagination[page]'] === 1
      ? page([record('z', 'Zed'), {}], 1, 4, 2) : page([record('b', 'alpha'), record('a', 'Alpha')], 2, 4, 2);
  });
  assert.deepEqual((await api.fetchPublishedClients()).map(c => c.id), ['b', 'a', 'z']);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(call.endpoint, 'clients'); assert.equal(call.options.cache, 'no-store');
    assert.equal(call.options.queryParams.status, 'published'); assert.equal(call.options.queryParams.populate, 'image');
  }
});

test('empty success is distinct from invalid, incomplete, duplicate or failed collections', async () => {
  assert.deepEqual(await clients(async () => page([])).fetchPublishedClients(), []);
  for (const response of [
    { error: 'offline', data: null }, { data: {} }, page([{}]),
    page([record('a'), record('a')]), page([record('a')], 1, 2),
    { data: { data: [], meta: { pagination: { page: 1, total: 1, pageCount: 0, pageSize: 100 } } } },
  ]) await assert.rejects(clients(async () => response).fetchPublishedClients());
  await assert.rejects(clients(async (_endpoint, options) => options.queryParams['pagination[page]'] === 1
    ? page([record('a')], 1, 2, 1) : { error: 'offline' }).fetchPublishedClients());
});

test('only successful aggregate results enter the clients cache; cold errors are caught outside it', async () => {
  let options, callback, requests = 0;
  const api = clients(async () => { requests++; throw new Error('offline'); }, (fn, keys, settings) => {
    callback = fn; options = settings; assert.ok(keys.includes('https://api.test/api')); return fn;
  });
  assert.deepEqual(options, { tags: ['clients'], revalidate: 300 });
  await assert.rejects(callback());
  assert.deepEqual(await api.getClientLogos(), []);
  assert.deepEqual(await api.getClientLogos(), []);
  assert.equal(requests, 3);
});

test('client events authenticate, use SWR tag invalidation and never hard-invalidate either locale path', async () => {
  const old = process.env.STRAPI_REVALIDATION_SECRET;
  process.env.STRAPI_REVALIDATION_SECRET = 'test-only-revalidation-secret';
  const tags = [], paths = [];
  try {
    const { POST } = load('src/app/api/revalidate/route.ts', {
      'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
      'next/cache': { revalidateTag: (...args) => tags.push(args), revalidatePath: value => paths.push(value) },
    });
    const request = (body, auth = true) => new Request('https://frontend.test/api/revalidate', { method: 'POST', body: JSON.stringify(body), headers: auth ? { Authorization: 'Bearer test-only-revalidation-secret' } : {} });
    assert.equal((await POST(request({ model: 'client', event: 'entry.publish' }, false))).status, 401);
    for (const model of ['client', 'clients', 'api::client.client']) {
      assert.equal((await POST(request({ model, event: 'entry.publish' }))).status, 200);
    }
    await POST(request({ uid: 'api::client.client', event: 'entry.unpublish' }));
    await POST(request({ model: 'client', event: 'entry.delete', entry: { publishedAt: '2026-10-31T00:00:00Z' } }));
    assert.equal(tags.length, 5);
    for (const args of tags) assert.deepEqual(args, ['clients', 'max']);
    for (const event of ['entry.create', 'entry.update', 'entry.delete']) assert.equal((await POST(request({ model: 'client', event, entry: { publishedAt: null } }))).body.skipped, true);
    assert.equal(tags.length, 5); assert.deepEqual(paths, []);
    assert.equal((await POST(request({ model: 'client-private', event: 'entry.publish' }))).status, 400);
  } finally {
    if (old === undefined) delete process.env.STRAPI_REVALIDATION_SECRET; else process.env.STRAPI_REVALIDATION_SECRET = old;
  }
});
