/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
function load(file,mocks={}) {
 const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const loaded={exports:{}};
 new Function('require','module','exports',code)(name=>{
  if(Object.hasOwn(mocks,name))return mocks[name];
  if(name==='server-only')return {};
  if(name.startsWith('@/'))return load('src/'+name.slice(2)+'.ts',mocks);
  return require(name);
 },loaded,loaded.exports);
 return loaded.exports;
}
const row=(documentId,title,locale='en')=>({documentId,title,slug:documentId,locale,publishedAt:'2026-11-01T00:00:00Z'});
function harness(transport) {
 const cache=[];
 const loaded=load('src/lib/server/localized-content.ts',{
  'next/cache':{unstable_cache:(fn,key,options)=>{cache.push({key,options});return fn;}},
  '@/lib/strapi/config':{STRAPI_API_URL:'http://localhost:9999/api'},
  '@/lib/strapi/client':{fetchFromStrapi:transport},
 });
 return {...loaded,cache};
}
test('native locale snapshots retrieve every page uncached and reject partial, duplicate and draft responses',async()=>{
 const calls=[];
 const mod=harness(async(endpoint,options)=>{
  calls.push({endpoint,options});const page=options.queryParams['pagination[page]'];
  return {data:{data:[row('doc'+page,'Title')],meta:{pagination:{page,total:2,pageCount:2}}}};
 });
 assert.equal((await mod.loadPublishedLocale('blogs','en',{})).length,2);
 assert.ok(calls.every(({options})=>options.cache==='no-store'&&options.queryParams.locale==='en'&&options.queryParams.status==='published'));
 const bads=[{data:[],meta:{}},{data:[{...row('a','Draft'),publishedAt:null}],meta:{pagination:{page:1,total:1,pageCount:1}}}];
 for(const data of bads)await assert.rejects(harness(async()=>({data})).loadPublishedLocale('blogs','en',{}));
 await assert.rejects(harness(async()=>({data:{data:[row('same','Duplicate')],meta:{pagination:{page:1,total:2,pageCount:2}}}})).loadPublishedLocale('blogs','en',{}));
 await assert.rejects(harness(async(_e,o)=>o.queryParams['pagination[page]']===1?{data:{data:[row('one','First')],meta:{pagination:{page:1,total:2,pageCount:2}}}}:{data:null,error:'offline'}).loadPublishedLocale('blogs','en',{}),/offline/);
});
test('merge uses stable document identity, retains fallback and supports Chinese-only publication before pagination',()=>{
 const mod=harness(()=>{});
 const english=[row('a','English A'),row('b','English B')];
 const chinese=[row('a','中文 A','zh-CN'),row('c','中文 C','zh-CN')];
 const resolved=mod.resolvePublishedRows(english,chinese,'zh');
 assert.deepEqual(resolved.map(r=>r.documentId),['a','b','c']);
 assert.equal(resolved[0].title,'中文 A');assert.equal(resolved[1].localization.isFallback,true);
 assert.equal(resolved[2].localization.englishPublished,false);
 const filtered=mod.pageResolvedRows(resolved,{'filters[title][$containsi]':'English','pagination[pageSize]':1});
 assert.equal(filtered.meta.pagination.total,1);assert.equal(filtered.data[0].documentId,'b');
 assert.deepEqual(mod.resolvePublishedRows(english,chinese,'en').map(r=>r.title),['English A','English B']);
});
test('listing pagination resolves a thin index and fetches only selected bodies; detail reads are scoped',async()=>{
 const calls=[];
 const records=[row('a','A'),row('b','B'),row('c','C')];
 const mod=harness(async(_endpoint,{queryParams:q})=>{
  calls.push(q);
  const ids=Object.entries(q).filter(([key])=>key.startsWith('filters[documentId][$in]')).map(([,id])=>id);
  let found=q.locale==='zh-CN'?[]:records;
  if(ids.length) found=found.filter(item=>ids.includes(item.documentId));
  if(q['filters[slug][$eq]']) found=found.filter(item=>item.slug===q['filters[slug][$eq]']);
  const narrow=Object.keys(q).some(key=>key.startsWith('fields['));
  return {data:{data:found.map(item=>narrow?item:{...item,content:'BODY-'+item.documentId}),meta:{pagination:{page:1,total:found.length,pageCount:found.length?1:0}}}};
 });
 const result=await mod.localizedSource('zh')('blogs',{queryParams:{populate:'*',sort:'title:asc','pagination[page]':2,'pagination[pageSize]':1}});
 assert.equal(result.error,null);assert.equal(result.data.meta.pagination.total,3);assert.equal(result.data.data[0].content,'BODY-b');
 assert.ok(calls.slice(0,2).every(q=>!Object.keys(q).some(key=>key.startsWith('populate'))),'Index requests exclude bodies and media');
 assert.ok(calls.slice(2).every(q=>q['filters[documentId][$in][0]']==='b'),'Only one selected body is requested');
 calls.length=0;
 const detail=await mod.localizedSource('en')('blogs',{queryParams:{'filters[slug][$eq]':'c',populate:'*'}});
 assert.equal(detail.data.data[0].documentId,'c');
 assert.ok(calls.every(q=>q['filters[slug][$eq]']==='c'));
});
test('locale snapshots stop before walking oversized collections and deduplicate concurrent cold loads',async()=>{
 let calls=0;
 const tooLarge=harness(async()=>{calls++;return {data:{data:[],meta:{pagination:{page:1,pageCount:1000,total:100000}}}};});
 await assert.rejects(tooLarge.loadPublishedLocale('blogs','en',{}),/bounded locale index/);assert.equal(calls,1);
 calls=0;
 const mod=harness(async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,10));return {data:{data:[],meta:{pagination:{page:1,pageCount:0,total:0}}}};});
 await Promise.all([mod.getLocalizedRows('blogs','zh'),mod.getLocalizedRows('blogs','zh')]);
 assert.equal(calls,2,'One concurrent retrieval per locale');
});
test('signed previews reject oversized headers and chunked bodies while preserving the private no-store channel',async()=>{
 const original=global.fetch;
 try{
  const {loadEditorialPreview}=load('src/lib/server/editorial-preview.ts',{'@/lib/strapi/config':{STRAPI_API_URL:'https://cms.example/api'}});
  const fixture={document:{documentId:'preview-sample',Title:'中文草稿'},title:'中文草稿',path:'/zh/blog/preview-sample',model:'api::blog.blog',locale:'zh-CN',status:'draft',expiresAt:Math.floor(Date.now()/1000)+300};
  global.fetch=async(url,options)=>{assert.equal(url,'https://cms.example/api/portfolio-editor/preview');assert.equal(options.cache,'no-store');assert.equal(options.redirect,'error');assert.deepEqual(options.headers,{'x-portfolio-preview':'sample.ticket'});return Response.json(fixture);};
  assert.deepEqual(await loadEditorialPreview('sample.ticket'),fixture);
  let cancelled=false;
  global.fetch=async()=>new Response(new ReadableStream({cancel(){cancelled=true;}}),{headers:{'content-length':String(9*1024*1024)}});
  assert.equal(await loadEditorialPreview('sample.ticket'),null);assert.equal(cancelled,true);
  cancelled=false;let chunks=0;
  global.fetch=async()=>new Response(new ReadableStream({pull(controller){chunks++;controller.enqueue(new Uint8Array(65536));},cancel(){cancelled=true;}}));
  assert.equal(await loadEditorialPreview('sample.ticket'),null);assert.equal(cancelled,true);assert.ok(chunks<=130,'Stop streaming near 8 MB instead of buffering an unbounded preview.');
  for(const invalid of [null,[],{...fixture,expiresAt:0},{...fixture,locale:'unknown'}]){global.fetch=async()=>Response.json(invalid);assert.equal(await loadEditorialPreview('sample.ticket'),null);}
 }finally{global.fetch=original;}
});
test('CMS transport bounds both advertised and streamed JSON before parsing',async()=>{
 const original=global.fetch;
 try {
  const {fetchFromStrapi}=load('src/lib/strapi/client.ts',{'@/lib/strapi/config':{STRAPI_API_URL:'https://cms.example/api'}});
  for(const response of [new Response('{}',{headers:{'content-length':String(9*1024*1024)}}),new Response('x'.repeat(8*1024*1024+1))]){
    global.fetch=async()=>response;
    const result=await fetchFromStrapi('blogs');assert.equal(result.data,null);assert.match(result.error,/size limit/);
  }
 } finally {global.fetch=original;}
});
test('CMS public read contract blocks arbitrary endpoints, drafts and browser credentials before transport',async()=>{
 const previousFetch=global.fetch,previousWindow=global.window;let calls=0,request;
 try {
  delete global.window;
  global.fetch=async(url,options)=>{calls++;request={url,options};return Response.json({data:[]});};
  const {fetchFromStrapi}=load('src/lib/strapi/client.ts');
  for(const endpoint of ['../admin','https://evil.test','blogs/../admin','blogs%2fadmin','admin/users','blogs/unsafe?path=1'])assert.ok((await fetchFromStrapi(endpoint)).error);
  assert.ok((await fetchFromStrapi('blogs',{queryParams:{status:'draft'}})).error);
  assert.ok((await fetchFromStrapi('blogs',{queryParams:{locale:'*'}})).error);
  assert.ok((await fetchFromStrapi('blogs',{method:'POST'})).error);
  assert.equal(calls,0);
  await fetchFromStrapi('blogs');assert.equal(calls,1);assert.equal(request.options.redirect,'error');
  assert.equal(new URL(request.url).searchParams.get('status'),'published');assert.equal(new URL(request.url).searchParams.get('locale'),'en');
  global.window={};assert.ok((await fetchFromStrapi('blogs')).error);assert.equal(calls,1);
 } finally {global.fetch=previousFetch;if(previousWindow===undefined)delete global.window;else global.window=previousWindow;}
});
test('CMS configuration validates origins and public population excludes reverse relations',()=>{
 const {cmsEndpoints}=load('src/lib/strapi/config.ts');
 assert.deepEqual(cmsEndpoints('https://cms.example/api/'),{api:'https://cms.example/api',origin:'https://cms.example'});
 for(const value of ['https://user:pass@cms.example/api','http://remote.example/api','https://cms.example/admin','https://cms.example/api?secret=x'])assert.throws(()=>cmsEndpoints(value));
 const {publicPopulation}=load('src/lib/strapi/content-contract.ts');
 assert.deepEqual(publicPopulation('categories'),{});
 assert.deepEqual(publicPopulation('photographies'),{'populate[image]':true,'populate[category]':true,'populate[tags]':true});
 assert.equal(Object.keys(publicPopulation('blogs')).some(key=>key.includes('wows')),false);
});
test('a separate server API host cannot replace the public relative-media origin',()=>{
 const keys=['STRAPI_API_URL','NEXT_PUBLIC_STRAPI_API_URL','NEXT_PUBLIC_STRAPI_URL'],previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 try {
  process.env.STRAPI_API_URL='https://internal.example/api';delete process.env.NEXT_PUBLIC_STRAPI_API_URL;process.env.NEXT_PUBLIC_STRAPI_URL='https://public.example';
  const config=load('src/lib/strapi/config.ts');assert.equal(config.STRAPI_API_URL,'https://internal.example/api');assert.equal(config.STRAPI_ORIGIN_URL,'https://public.example');
 } finally {for(const key of keys)if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}
});
test('preview iframe configuration rejects malformed origins and fails early when explicitly enabled without one',async()=>{
 const previous={...process.env};
 try {
  process.env.NODE_ENV='production';process.env.EDITORIAL_PREVIEW_ENABLED='true';delete process.env.EDITORIAL_ADMIN_ORIGIN;
  await assert.rejects(()=>load('next.config.ts').default.headers(),/requires EDITORIAL_ADMIN_ORIGIN/);
  for(const origin of ['https://user:pass@cms.example','https://cms.example/admin','https://cms.example?bad=1','https://cms.example#bad','http://remote.example']){
   process.env.EDITORIAL_ADMIN_ORIGIN=origin;
   await assert.rejects(()=>load('next.config.ts').default.headers(),/exact HTTPS origin/);
  }
  process.env.EDITORIAL_ADMIN_ORIGIN='https://cms.example';
  const routes=await load('next.config.ts').default.headers(),preview=routes.find(route=>route.source==='/editor-preview/:path*');
  assert.match(preview.headers.find(header=>header.key==='Content-Security-Policy').value,/frame-ancestors 'self' https:\/\/cms.example/);
  assert.equal(preview.headers.some(header=>header.key==='X-Frame-Options'),false);
 } finally {for(const key of Object.keys(process.env))if(!Object.hasOwn(previous,key))delete process.env[key];Object.assign(process.env,previous);}
});
test('cache keys and tags partition languages; Chinese taxonomy labels resolve by shared identity',async()=>{
 const calls=[];
 const mod=harness(async(endpoint,options)=>{
  const locale=options.queryParams.locale;calls.push([endpoint,locale]);
  const records=endpoint==='categories'?[{...row('cat','Category',locale),name:locale==='zh-CN'?'类别':'Category'}]:locale==='en'?[{...row('article','English'),category:{documentId:'cat',name:'Category'}}]:[];
  return {data:{data:records,meta:{pagination:{page:1,pageCount:records.length?1:0,total:records.length}}}};
 });
 const rows=await mod.getLocalizedRows('blogs','zh',{queryParams:{populate:'*'}});
 assert.equal(rows[0].category.name,'类别');assert.equal(rows[0].localization.isFallback,true);
 assert.deepEqual(calls,[['blogs','en'],['blogs','zh-CN'],['categories','en'],['categories','zh-CN']]);
 assert.deepEqual(mod.cache.map(c=>c.options.tags),[['blogs:en'],['blogs:zh-CN'],['categories:en'],['categories:zh-CN']]);
 assert.ok(mod.cache.every(c=>c.options.revalidate===300));
});
test('fallback SEO is noindex with English canonical; published Chinese gets reciprocal hreflang',()=>{
 const {localizedSeo}=load('src/lib/content-localization.ts');
 const fallback={documentId:'a',requestedLocale:'zh',resolvedLocale:'en',isFallback:true,englishPublished:true,chinesePublished:false};
 let seo=localizedSeo('/blog/a','zh',fallback);
 assert.equal(seo.robots.index,false);assert.equal(seo.alternates.canonical,'https://www.shainwaiyan.com/blog/a');assert.equal(seo.alternates.languages['zh-CN'],undefined);
 seo=localizedSeo('/blog/a','zh',{...fallback,resolvedLocale:'zh',isFallback:false,chinesePublished:true});
 assert.equal(seo.robots.index,true);assert.equal(seo.alternates.canonical,'https://www.shainwaiyan.com/zh/blog/a');
 assert.equal(seo.alternates.languages.en,'https://www.shainwaiyan.com/blog/a');
 assert.equal(localizedSeo('/blog/a','en',{...fallback,chinesePublished:true}).alternates.languages['zh-CN'],'https://www.shainwaiyan.com/zh/blog/a');
 assert.equal(localizedSeo('/blog/a','zh',{...fallback,resolvedLocale:'zh',isFallback:false,chinesePublished:true},true).robots.index,false);
});
test('authenticated events isolate locale invalidation, skip drafts and reject WOWS substring matches',async()=>{
 const before=process.env.STRAPI_REVALIDATION_SECRET;process.env.STRAPI_REVALIDATION_SECRET='test-only';const tags=[];
 try{
 const {POST}=load('src/app/api/revalidate/route.ts',{'next/cache':{revalidateTag:(...args)=>tags.push(args)},'next/server':{NextResponse:{json:(data,options)=>({data,status:options?.status??200})}}});
 const send=payload=>POST(new Request('http://localhost/api/revalidate',{method:'POST',headers:{authorization:'Bearer test-only'},body:JSON.stringify(payload)}));
 assert.equal((await send({uid:'api::blog.blog',event:'entry.update',entry:{locale:'zh-CN'}})).data.skipped,true);assert.equal(tags.length,0);
 await send({uid:'api::blog.blog',event:'entry.publish',entry:{locale:'zh-CN'}});assert.deepEqual(tags,[['blogs:zh-CN',{expire:0}]]);
 tags.length=0;await send({uid:'api::blog.blog',event:'entry.publish',entry:{locale:'en'}});assert.deepEqual(tags,[['blogs:en',{expire:0}],['blogs:zh-CN',{expire:0}]]);
 assert.equal((await send({uid:'api::wows-blog.wows-blog',event:'entry.publish'})).status,400);
 assert.equal((await send({uid:'api::blog.blog',event:'entry.publish',entry:{locale:'*'}})).status,400);
 }finally{if(before===undefined)delete process.env.STRAPI_REVALIDATION_SECRET;else process.env.STRAPI_REVALIDATION_SECRET=before;}
});
