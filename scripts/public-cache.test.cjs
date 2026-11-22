/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const path = require('node:path');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === 'server-only') return {};
    if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`, mocks);
    return require(name);
  }, mod, mod.exports);
  return mod.exports;
}

test('sitemap XML escapes content and retains alternate, image, date and priority metadata', () => {
  const { renderSitemap } = load('src/lib/server/sitemap-xml.ts');
  const xml = renderSitemap([{ url: 'https://example.test/a?x=1&y=2', alternates: { languages: { 'zh-CN': 'https://example.test/zh?a=1&b=2' } }, images: ['https://example.test/a&b.jpg'], lastModified: '2026-01-01', priority: 0, changeFrequency: 'weekly' }]);
  assert.match(xml, /a\?x=1&amp;y=2/);
  assert.match(xml, /hreflang="zh-CN" href="https:\/\/example.test\/zh\?a=1&amp;b=2"/);
  assert.match(xml, /<image:loc>https:\/\/example.test\/a&amp;b.jpg<\/image:loc>/);
  assert.match(xml, /<priority>0<\/priority>/);
  assert.match(xml, /<lastmod>2026-01-01<\/lastmod>/);
});

test('sitemap caches only complete success and never caches a CMS failure', async () => {
  let fail = false;
  const { GET } = load('src/app/sitemap.xml/route.ts', { '@/lib/server/sitemap': { default: async () => { if (fail) throw new Error('offline'); return [{ url: 'https://example.test/' }]; } } });
  const ok = await GET();
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('vercel-cdn-cache-control'), 'public, s-maxage=60');
  assert.match(await ok.text(), /<loc>https:\/\/example.test\/<\/loc>/);
  fail = true;
  const originalError = console.error; console.error = () => {};
  try {
    const bad = await GET();
    assert.equal(bad.status, 503);
    assert.equal(bad.headers.get('cache-control'), 'no-store');
    assert.equal(bad.headers.get('vercel-cdn-cache-control'), null);
  } finally { console.error = originalError; }
});

test('public project responses share a short CDN cache while failures do not', async () => {
  let fail = false;
  const { GET } = load('src/app/api/coding-projects/route.ts', {
    'next/server': { NextResponse: { json: (data, options = {}) => Response.json(data, options) } },
    '@/lib/server/project-data': {
      getCodingProjects: async (_page, _size, locale) => fail ? { error: 'offline' } : { projects: [{ locale }], total: 1 },
    },
  });
  for (const language of ['en', 'zh']) {
    const res = await GET({ nextUrl: new URL(`https://example.test/api/coding-projects?language=${language}`) });
    assert.equal(res.headers.get('vercel-cdn-cache-control'), 'public, s-maxage=60');
    assert.equal((await res.json()).data[0].locale, language);
  }
  fail = true;
  const failed = await GET({ nextUrl: new URL('https://example.test/api/coding-projects?language=en') });
  assert.equal(failed.status, 500);
  assert.equal(failed.headers.get('vercel-cdn-cache-control'), null);
});
