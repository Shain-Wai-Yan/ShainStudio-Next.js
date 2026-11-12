import 'server-only';
import {STRAPI_API_URL} from '@/lib/strapi/config';
import {readBoundedCmsJson} from '@/lib/strapi/bounded-json';

export interface EditorialPreview {
  document:Record<string,unknown>;title:string;path:string;model:string;locale:'en'|'zh-CN';status:'draft'|'published';expiresAt:number;
}
/** Dedicated signed draft channel. Never use the published token or Data Cache. */
export async function loadEditorialPreview(ticket:string):Promise<EditorialPreview|null> {
  if(!/^[\w-]+\.[\w-]+$/.test(ticket) || ticket.length>2048)return null;
  try{
    const response=await fetch(`${STRAPI_API_URL}/portfolio-editor/preview`,{headers:{'x-portfolio-preview':ticket},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
    if(!response.ok)return null;
    const value=await readBoundedCmsJson(response);
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const raw=value as Partial<EditorialPreview>;
    if(typeof raw.title!=='string' || !raw.document || typeof raw.document.documentId!=='string' || typeof raw.locale!=='string' || !['en','zh-CN'].includes(raw.locale) || typeof raw.status!=='string' || !['draft','published'].includes(raw.status) || typeof raw.path!=='string' || !raw.path.startsWith('/') || raw.path.startsWith('//') || typeof raw.expiresAt!=='number' || !Number.isInteger(raw.expiresAt) || raw.expiresAt<=Math.floor(Date.now()/1000))return null;
    return raw as EditorialPreview;
  }catch{return null;}
}
