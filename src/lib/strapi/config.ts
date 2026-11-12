const DEFAULT_STRAPI_ORIGIN = 'https://api.shainwaiyan.com';

export function cmsEndpoints(api?:string,origin?:string) {
  const value=api || `${(origin||DEFAULT_STRAPI_ORIGIN).replace(/\/+$/,'')}/api`;
  let url:URL;try{url=new URL(value);}catch{throw new Error('CMS API URL must be an absolute HTTPS URL or loopback HTTP URL.');}
  if(url.username||url.password||url.search||url.hash||url.pathname.replace(/\/+$/,'')!=='/api'
    || !(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))))throw new Error('CMS API URL requires an origin plus /api, without credentials, query or fragment.');
  return {api:url.origin+'/api',origin:url.origin};
}
const publicConfigured=cmsEndpoints(process.env.NEXT_PUBLIC_STRAPI_API_URL,process.env.NEXT_PUBLIC_STRAPI_URL);
export const STRAPI_API_URL=typeof window==='undefined'&&process.env.STRAPI_API_URL?cmsEndpoints(process.env.STRAPI_API_URL).api:publicConfigured.api;
// Relative media must resolve against the public origin, even when server reads
// use a separately configured API host.
export const STRAPI_ORIGIN_URL=publicConfigured.origin;
