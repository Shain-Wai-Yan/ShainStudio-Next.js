/** Production preview/cache isolation check with a controllable loopback CMS. */
import http from 'node:http';
import net from 'node:net';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
let draftReads=0,application,logs='';
const token='phase4-published-token-not-for-browser';
const mock=http.createServer((request,response)=>{
  response.setHeader('content-type','application/json');
  const path=new URL(request.url,'http://localhost').pathname;
  if(path==='/api/portfolio-editor/preview'){
    draftReads++;const ticket=request.headers['x-portfolio-preview'];
    if(!['phase4.english','phase4.chinese'].includes(ticket)){response.writeHead(401);response.end('{}');return;}
    assert.equal(request.headers.authorization,undefined,'Never send the published token to the preview channel');
    const chinese=ticket==='phase4.chinese';
    response.end(JSON.stringify({document:{id:1,documentId:'phase4-preview',slug:'phase4',createdAt:'2026-11-01T00:00:00Z',publishDate:'2026-11-01T00:00:00Z',Title:chinese?'中文草稿测试':'EDITORIAL_DRAFT_ENGLISH',content:chinese?'<p>仅限编辑预览</p>':'<p>Draft-only body</p><script>evil-preview-script()</script>',publishedAt:null},title:chinese?'中文草稿测试':'EDITORIAL_DRAFT_ENGLISH',path:'/blog/phase4',model:'api::blog.blog',locale:chinese?'zh-CN':'en',status:'draft',expiresAt:Math.floor(Date.now()/1000)+300}));return;
  }
  response.end(JSON.stringify({data:[],meta:{pagination:{page:1,pageSize:100,pageCount:0,total:0}}}));
});
await new Promise(resolve=>mock.listen(0,'127.0.0.1',resolve));
const cms=`http://127.0.0.1:${mock.address().port}`;
const probe=net.createServer();await new Promise(resolve=>probe.listen(0,'localhost',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const env={...process.env,NODE_ENV:'production',NEXT_PUBLIC_STRAPI_API_URL:cms+'/api',NEXT_PUBLIC_STRAPI_URL:cms,STRAPI_API_TOKEN:token,STRAPI_REVALIDATION_SECRET:'test-editorial-revalidation-secret',VIP_SECRET_KEY:'',GITHUB_TOKEN:'',YOUTUBE_WORKER_URL:cms,YOUTUBE_WORKER_SECRET:'',NEXT_PUBLIC_GA_ID:'',NEXT_PUBLIC_CLARITY_ID:'',NEXT_PUBLIC_CLOUDFLARE_WORKER_URL:cms,EDITORIAL_ADMIN_ORIGIN:cms,NEXT_TELEMETRY_DISABLED:'1'};
function run(args){const child=spawn(process.execPath,args,{env,stdio:['ignore','pipe','pipe']});child.stdout.on('data',data=>logs+=data);child.stderr.on('data',data=>logs+=data);return child;}
try{
  const build=run(['node_modules/next/dist/bin/next','build']);
  const code=await new Promise(resolve=>build.once('exit',resolve));assert.equal(code,0,logs.slice(-8000));
  application=run(['node_modules/next/dist/bin/next','start','--hostname','localhost','--port',String(port)]);
  const origin=`http://localhost:${port}`;let ready=false;
  for(let i=0;i<120;i++){try{await fetch(origin+'/api/health',{signal:AbortSignal.timeout(1000)});ready=true;break;}catch{await delay(250);}}
  assert.ok(ready,'Production frontend starts');
  const before=draftReads;
  const health=await fetch(origin+'/api/health');assert.equal(health.status,200);assert.equal((await health.json()).status,'ok');assert.match(health.headers.get('cache-control'),/no-store/);
  const missing=await fetch(origin+'/editor-preview');assert.match(await missing.text(),/Preview unavailable/);assert.equal(draftReads,before);
  for(const locale of ['english','chinese']){
    const response=await fetch(`${origin}/editor-preview?ticket=phase4.${locale}`),body=await response.text();
    assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private.*no-store/);
    assert.equal(response.headers.get('x-frame-options'),null);assert.match(response.headers.get('content-security-policy'),new RegExp(`frame-ancestors 'self' ${cms.replaceAll('.','\\.')}`));
    assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.match(response.headers.get('x-robots-tag'),/noindex/);
    assert.ok(body.includes(locale==='chinese'?'中文草稿测试':'EDITORIAL_DRAFT_ENGLISH'));
    assert.ok(!body.includes(token));assert.ok(!body.includes('evil-preview-script()'),'Unsafe script is omitted');assert.ok(body.includes('Saved preview controls'));assert.ok(body.includes('Back to the top') || body.includes('BACK TO THE TOP') || body.includes('回到顶部'),'Shared website footer is present');
  }
  const denied=await fetch(origin+'/editor-preview?ticket=wrong.ticket');assert.match(await denied.text(),/Preview unavailable/);
  const after=draftReads;
  for(const path of ['/','/zh']){const response=await fetch(origin+path,{headers:{cookie:'NEXT_LOCALE=en'}}),body=await response.text();assert.equal(response.status,200);assert.equal(response.headers.get('x-frame-options'),'SAMEORIGIN');assert.ok(!body.includes('EDITORIAL_DRAFT_ENGLISH')&&!body.includes('中文草稿测试'));}
  assert.equal(draftReads,after,'Published routes never read the draft channel');
  const output='.next-editorial-test-results';fs.mkdirSync(output,{recursive:true});fs.writeFileSync(output+'/result.json',JSON.stringify({productionBuild:true,englishPreview:true,chinesePreview:true,draftReads,publishedCacheIsolated:true,previewNoStore:true,privateTokenSerialized:false},null,2));
  console.log('PASS: real production build, both preview locales, signed-channel rejection, safe rendering, frame/no-store/noindex headers and published-cache isolation.');
}finally{if(application && application.exitCode===null){application.kill('SIGTERM');await new Promise(resolve=>application.once('exit',resolve));}await new Promise(resolve=>mock.close(resolve));}
