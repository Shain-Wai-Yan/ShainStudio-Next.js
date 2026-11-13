/** Production-mode cache acceptance test. Uses only a loopback mock CMS and fake secrets. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const output = path.join(root, '.next-clients-test-results');
fs.mkdirSync(output, { recursive: true });
const secret = 'clients-cache-acceptance-secret';
const apiToken = 'clients-cache-content-token-not-for-browser';
const rows = name => [{ documentId: 'cacheclienta', name, image: { url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', mime: 'image/jpeg' } }];
let chinesePublished = false;
let sitemapCmsUnavailable = true;
const projectReads = {en:0,'zh-CN':0};
const project = {id:1,documentId:'bilingualfixture',slug:'bilingual-fixture',title:'BILINGUAL_ENGLISH',summary:'English summary',content:'<p>English body</p>',publishedAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-01T00:00:00Z',projectDate:'2026-11-01',category:null,tags:[],tools_useds:[],seo:null};
let state = { fail: true, failPage: 0, data: rows('CACHE_ALPHA'), pageSize: 1, reads: 0 };
const cms = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('content-type', 'application/json');
  if (sitemapCmsUnavailable && url.pathname !== '/api/clients') {
    res.writeHead(503); res.end(JSON.stringify({ error: 'Deliberate cold sitemap CMS outage' })); return;
  }
  if (url.pathname === '/api/coding-projects') {
    const locale = url.searchParams.get('locale');
    assert.ok(['en','zh-CN'].includes(locale));
    assert.equal(url.searchParams.get('status'),'published');
    assert.equal(req.headers.authorization,`Bearer ${apiToken}`);
    projectReads[locale]++;
    const data = locale === 'en' ? [{...project,locale}] : chinesePublished ? [{...project,id:2,locale,title:'双语中文项目',content:'<p>已经发布的中文内容</p>'}] : [];
    res.end(JSON.stringify({data,meta:{pagination:{page:1,pageSize:100,pageCount:data.length?1:0,total:data.length}}}));return;
  }
  if (url.pathname === '/api/clients') {
    state.reads++;
    assert.equal(req.headers.authorization, `Bearer ${apiToken}`);
    assert.equal(url.searchParams.get('status'), 'published');
    const page = Number(url.searchParams.get('pagination[page]') || 1);
    if (state.fail || state.failPage === page) { res.writeHead(503); res.end(JSON.stringify({ error: 'Deliberate test outage' })); return; }
    const total = state.data.length;
    res.end(JSON.stringify({ data: state.data.slice((page - 1) * state.pageSize, page * state.pageSize), meta: { pagination: { page, pageSize: state.pageSize, pageCount: Math.ceil(total / state.pageSize), total } } }));
    return;
  }
  res.end(JSON.stringify({ data: [], meta: { pagination: { page: 1, pageSize: 100, pageCount: 0, total: 0 } } }));
});
await new Promise(resolve => cms.listen(0, '127.0.0.1', resolve));
const cmsOrigin = `http://127.0.0.1:${cms.address().port}`;
const portProbe = net.createServer();
await new Promise(resolve => portProbe.listen(0, 'localhost', resolve));
const port = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const env = { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_STRAPI_API_URL: `${cmsOrigin}/api`, NEXT_PUBLIC_STRAPI_URL: cmsOrigin,
  STRAPI_API_TOKEN: apiToken, STRAPI_REVALIDATION_SECRET: secret, VIP_SECRET_KEY: '', YOUTUBE_API_KEY: '', GITHUB_TOKEN: '', NEXT_TELEMETRY_DISABLED: '1' };
let app;
const logs = [];
const child = args => {
  const process = spawn(globalThis.process.execPath, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  process.stdout.on('data', chunk => logs.push(chunk.toString()));
  process.stderr.on('data', chunk => logs.push(chunk.toString()));
  return process;
};
// NextURL normalizes loopback addresses to localhost. Bind that same hostname
// so Proxy rewrites remain internal instead of proxying back through themselves.
const origin = `http://localhost:${port}`;
const html = async locale => {
  const response = await fetch(origin + locale, { headers: { cookie: 'NEXT_LOCALE=en', 'accept-language': 'en' }, signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `${locale}: homepage must remain available`);
  const body = await response.text();
  assert.ok(!body.includes(apiToken) && !body.includes(secret), 'Server credentials must not be serialized');
  return body;
};
const event = async (event = 'entry.publish', entry = {}) => {
  const response = await fetch(`${origin}/api/revalidate`, { method: 'POST', headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'client', uid: 'api::client.client', event, entry }) });
  assert.equal(response.status, 200);
  return response.json();
};
const waitFor = async (check, message) => {
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    const bodies = await Promise.all(['/', '/zh'].map(html));
    if (bodies.every(check)) return;
    await delay(300);
  }
  throw new Error(message);
};
const settle = async () => {
  // Isolate scenarios: a webhook arriving while an older ISR render is still
  // committing can legitimately coalesce with that render. Wait for both page
  // caches to settle before issuing the next, independent test event.
  for (let attempt = 0; attempt < 100; attempt++) {
    const responses = await Promise.all(['/', '/zh'].map(locale => fetch(origin + locale, { headers: { cookie: 'NEXT_LOCALE=en' } })));
    const settled = responses.every(response => response.headers.get('x-nextjs-cache') === 'HIT');
    await Promise.all(responses.map(response => response.arrayBuffer()));
    if (settled) return;
    await delay(100);
  }
  throw new Error('Homepage ISR did not settle between scenarios.');
};
try {
  console.log('Building the real frontend with the mock CMS unavailable (cold-cache failure).');
  const build = child(['node_modules/next/dist/bin/next', 'build']);
  const code = await new Promise(resolve => build.on('exit', resolve));
  assert.equal(code, 0, logs.join('').slice(-8000));
  const manifest = JSON.parse(fs.readFileSync('.next/prerender-manifest.json', 'utf8'));
  assert.equal(manifest.routes['/sitemap.xml'], undefined, 'CMS-dependent sitemap must not be prerendered at build time');
  for (const route of ['/en', '/zh']) {
    const info = manifest.routes[route] || manifest.routes[`${route}/`];
    assert.ok(info, `${route} must remain prerendered`);
    assert.equal(info.initialRevalidateSeconds, 300, `${route} must use 300-second ISR`);
  }
  app = child(['node_modules/next/dist/bin/next', 'start', '-H', 'localhost', '-p', String(port)]);
  for (let i = 0; i < 100; i++) { try { await html('/'); break; } catch (error) { if (i === 99) throw new Error(`Next production homepage failed: ${error.message}`); await delay(200); } }
  for (const locale of ['/', '/zh']) assert.ok(!(await html(locale)).includes('id="collaborations"'));
  console.log('PASS: cold-cache outage preserves both homepages and hides only the client strip.');
  const unavailableSitemap = await fetch(origin + '/sitemap.xml', { signal: AbortSignal.timeout(15000) });
  assert.equal(unavailableSitemap.status, 500, 'Cold sitemap outage must surface as an error');
  assert.doesNotMatch(await unavailableSitemap.text(), /<urlset/, 'Do not publish a partial static-only sitemap');
  const unavailableListing = await fetch(origin + '/portfolio/coding-projects', { signal: AbortSignal.timeout(15000) });
  assert.equal(unavailableListing.status, 500, 'Do not cache a cold CMS outage as an empty published listing');
  await unavailableListing.arrayBuffer();
  sitemapCmsUnavailable = false;
  assert.match(await html('/sitemap.xml'), /\/portfolio\/coding-projects\/bilingual-fixture/);
  assert.match(await html('/portfolio/coding-projects'), /BILINGUAL_ENGLISH/, 'A recovered CMS must restore the published listing');
  console.log('PASS: offline CMS does not prevent a production build; sitemap errors honestly and recovers when CMS returns.');
  const unauthorized = await fetch(`${origin}/api/revalidate`, { method: 'POST', body: JSON.stringify({ model: 'client', event: 'entry.publish' }) });
  assert.equal(unauthorized.status, 401);

  state.fail = false;
  await event();
  await waitFor(body => body.includes('alt="CACHE_ALPHA"'), 'Both locales must recover after a cold outage.');
  console.log('PASS: publication invalidation refreshes / and /zh without a deployment.');
  const beforeDraft = state.reads;
  state.data = rows('UNPUBLISHED_DRAFT');
  assert.equal((await event('entry.update')).skipped, true);
  for (const locale of ['/', '/zh']) assert.ok((await html(locale)).includes('alt="CACHE_ALPHA"'));
  assert.equal(state.reads, beforeDraft);
  console.log('PASS: a draft update does not invalidate published content.');

  state.fail = true;
  await event();
  for (let i = 0; i < 3; i++) {
    for (const locale of ['/', '/zh']) assert.ok((await html(locale)).includes('alt="CACHE_ALPHA"'));
    await delay(500);
  }
  console.log('PASS: a failed event-driven refresh retains previously valid client data.');
  await settle();
  state.fail = false;
  state.failPage = 2;
  state.data = [...rows('CACHE_BETA'), { ...rows('CACHE_GAMMA')[0], documentId: 'cacheclientb' }];
  await event();
  await delay(500);
  for (const locale of ['/', '/zh']) assert.ok((await html(locale)).includes('alt="CACHE_ALPHA"'));
  console.log('PASS: a failed second API page cannot cache a partial replacement.');
  await settle();
  state.failPage = 0;
  await event();
  await waitFor(body => body.includes('alt="CACHE_BETA"') && body.includes('alt="CACHE_GAMMA"') && !body.includes('alt="CACHE_ALPHA"'), 'Recovery must replace the whole collection in both locales.');
  console.log('PASS: all pages replace the aggregate after recovery.');

  // Exercise actual ISR/detail/list/sitemap dependencies and locale isolation.
  const detail = '/portfolio/coding-projects/bilingual-fixture';
  for (const path of [detail,`/zh${detail}`,'/portfolio/coding-projects','/zh/portfolio/coding-projects','/sitemap.xml']) await html(path);
  let fallback = await html(`/zh${detail}`);
  assert.ok(fallback.includes('English version — Chinese translation pending'));
  assert.match(fallback,/<meta name="robots" content="noindex, follow(?:,|")/);
  assert.match(fallback, /<a[^>]+hrefLang="en"[^>]+href="\/portfolio\/coding-projects\/bilingual-fixture"/i, 'English language link must be server-rendered');
  assert.match(fallback, /<a[^>]+hrefLang="zh-CN"[^>]+href="\/zh\/portfolio\/coding-projects\/bilingual-fixture"/i, 'Chinese language link must be server-rendered');
  assert.ok(fallback.includes(`rel="canonical" href="https://www.shainwaiyan.com${detail}"`));
  assert.ok(!(await html('/sitemap.xml')).includes(`/zh${detail}`));
  // Wait until the warm English page is a settled ISR HIT before counting reads.
  await delay(1000);
  const api = await fetch(`${origin}/api/coding-projects?language=zh&pageSize=100`);
  assert.equal(api.headers.get('cache-control'),'private, no-store');
  await api.arrayBuffer();
  const englishReads = projectReads.en;
  const publishChinese = async eventName => {
    const response = await fetch(`${origin}/api/revalidate`,{method:'POST',headers:{authorization:`Bearer ${secret}`,'content-type':'application/json'},
      body:JSON.stringify({uid:'api::coding-project.coding-project',event:eventName,entry:{documentId:project.documentId,locale:'zh-CN'}})});
    assert.equal(response.status,200);
  };
  chinesePublished = true;
  await publishChinese('entry.publish');
  for (let attempt=0;attempt<100;attempt++) {
    const body=await html(`/zh${detail}`);
    const sitemap=await html('/sitemap.xml');
    const english=await html(detail);
    const listing=await html('/zh/portfolio/coding-projects');
    if(body.includes('<h1') && body.includes('双语中文项目') && !body.includes('English version — Chinese translation pending')
      && body.includes(`rel="canonical" href="https://www.shainwaiyan.com/zh${detail}"`)
      && sitemap.includes(`/zh${detail}`) && listing.includes('双语中文项目')
      && english.includes('hrefLang="zh-CN"') && english.includes('BILINGUAL_ENGLISH')) break;
    if(attempt===99) {
      const checks={chineseTitle:body.includes('双语中文项目'),fallbackRemoved:!body.includes('English version — Chinese translation pending'),canonical:body.includes(`rel="canonical" href="https://www.shainwaiyan.com/zh${detail}"`),sitemap:sitemap.includes(`/zh${detail}`),listing:listing.includes('双语中文项目'),englishAlternate:english.includes('hrefLang="zh-CN"'),englishBody:english.includes('BILINGUAL_ENGLISH'),projectReads};
      fs.writeFileSync(path.join(output,'publication-failure.json'),JSON.stringify(checks,null,2));
      throw new Error('Chinese publication failed: '+JSON.stringify(checks));
    }
    await delay(300);
  }
  assert.equal(projectReads.en,englishReads,'Chinese publication must retain cached English body snapshots');
  console.log('PASS: Chinese publication refreshes detail/list/sitemap and reciprocal hreflang without refetching English body snapshots.');
  await delay(1000);
  chinesePublished=false;await publishChinese('entry.unpublish');
  for(let attempt=0;attempt<100;attempt++) {
    const body=await html(`/zh${detail}`);const sitemap=await html('/sitemap.xml');
    if(body.includes('English version — Chinese translation pending')&&!sitemap.includes(`/zh${detail}`))break;
    if(attempt===99)throw new Error('Chinese unpublication failed to restore fallback and remove sitemap entry.');
    await delay(300);
  }
  console.log('PASS: Chinese unpublication restores labelled/noindex English fallback and removes Chinese sitemap URLs.');

  if (!process.argv.includes('--skip-timed')) {
    state.fail = true;
    console.log('Waiting 305 seconds to test a real time-based refresh failure.');
    for (let left = 305; left > 0; left -= 30) { await delay(Math.min(30, left) * 1000); console.log(`Timed refresh check: ${Math.max(0, left - 30)} seconds remaining.`); }
    const readsBefore = state.reads;
    for (const locale of ['/', '/zh']) assert.ok((await html(locale)).includes('alt="CACHE_BETA"'));
    await delay(1000);
    assert.ok(state.reads > readsBefore, 'TTL must trigger a real upstream refresh');
    for (const locale of ['/', '/zh']) assert.ok((await html(locale)).includes('alt="CACHE_BETA"'));
    console.log('PASS: failed time-based refresh retains the last valid aggregate.');
  }
  state.fail = false; state.data = [];
  await event('entry.unpublish');
  await waitFor(body => !body.includes('id="collaborations"'), 'A genuine empty published collection must hide the strip in both locales.');
  console.log('PASS: successful empty collection hides the strip in both locales.');
  function checkBrowserBundle(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) checkBrowserBundle(file);
      else if (item.name.endsWith('.js')) assert.ok(!fs.readFileSync(file, 'utf8').includes(apiToken), 'Content token leaked into browser bundle');
    }
  }
  checkBrowserBundle('.next/static');
  console.log('PASS: no Content API token in browser JavaScript or rendered HTML.');
  console.log('Production client cache acceptance checks passed.');
} finally {
  if (app) { app.kill('SIGTERM'); await new Promise(resolve => app.once('exit', resolve)); }
  await new Promise(resolve => cms.close(resolve));
  fs.writeFileSync(path.join(output, 'production.log'), logs.join(''));
}
