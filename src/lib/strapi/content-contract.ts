/** Public read contract. Reverse CMS relations are deliberately not populated. */
export const CONTENT_TYPES = {
  art:{endpoint:'arts',populate:['image'],seo:false},
  blog:{endpoint:'blogs',populate:['featuredImage','category','tags'],seo:true},
  'business-plan':{endpoint:'business-plans',populate:['DocumentFile','CoverImage'],seo:false},
  category:{endpoint:'categories',populate:[],seo:false},
  certificate:{endpoint:'certificates',populate:['Image'],seo:false},
  'coding-project':{endpoint:'coding-projects',populate:['coverImage','imageGallery','category','tags','tools_useds'],seo:true},
  'marketing-plan':{endpoint:'marketing-plans',populate:['DocumentFile','CoverImage'],seo:false},
  'marketing-project':{endpoint:'marketing-projects',populate:['coverImage','imageGallery','category','tags','tools_useds','project_type'],seo:true},
  photography:{endpoint:'photographies',populate:['image','category','tags'],seo:false},
  'project-type':{endpoint:'project-types',populate:[],seo:false},
  tag:{endpoint:'tags',populate:[],seo:false},
  client:{endpoint:'clients',populate:['image'],seo:false},
} as const;
export type CmsContentType=keyof typeof CONTENT_TYPES;
export type CmsEndpoint=typeof CONTENT_TYPES[CmsContentType]['endpoint'];
export const LOCALIZED_ENDPOINTS=new Set<string>(Object.entries(CONTENT_TYPES).filter(([name])=>name!=='client').map(([,type])=>type.endpoint));
export function publicPopulation(endpoint:string):Record<string,string|boolean> {
  const type=Object.values(CONTENT_TYPES).find(type=>type.endpoint===endpoint);
  if(!type)throw new Error('Unsupported CMS collection');
  const query:Record<string,string|boolean>={};
  for(const field of type.populate)query[`populate[${field}]`]=true;
  if(type.seo)query['populate[seo][populate][ogImage]']=true;
  return query;
}
export function assertReadEndpoint(endpoint:string) {
  const parts=endpoint.split('/');
  if(parts.length>2||!Object.values(CONTENT_TYPES).some(type=>type.endpoint===parts[0])||(parts.length===2&&!/^[a-zA-Z0-9_-]{1,255}$/.test(parts[1])))throw new Error('Unsupported CMS read endpoint');
  return parts[0];
}
