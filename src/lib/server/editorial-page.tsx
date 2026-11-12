import 'server-only';
import {sanitizeRichText} from '@/lib/utils/sanitize-rich-text';
import type {EditorialPreview} from './editorial-preview';
import {transformPost} from './blog-data';
import {mapPost,fetchRelatedBlogs} from './blogs';
import {transformCodingProject,type StrapiCodingProject} from '@/lib/strapi/coding-projects';
import {transformMarketingProject,type StrapiMarketingProject} from '@/lib/strapi/marketing-in-motion';
import {getRelatedCodingProjects,getRelatedMarketingProjects} from './project-data';
import {transformArtPiece,getArtPieces} from './art-data';
import {transformPhoto,repository} from './photography-data';
import {localizedSource} from './localized-content';
import {getDictionary} from '@/lib/getDictionary';
import {fetchBusinessPlans,transformBusinessPlan,type BusinessPlan} from '@/lib/strapi/business-plans';
import {fetchMarketingPlans,transformMarketingPlan,type MarketingPlan} from '@/lib/strapi/marketing-plans';
import {fetchCertificates,type Certificate} from '@/lib/strapi/certificates';
import BlogView from '@/components/content-views/BlogView';
import CodingProjectView from '@/components/content-views/CodingProjectView';
import MarketingProjectView from '@/components/content-views/MarketingProjectView';
import ArtView from '@/components/content-views/ArtView';
import PhotoView from '@/components/content-views/PhotoView';
import CertificateView from '@/components/content-views/CertificateView';
import BusinessPlanClient from '@/components/business-plans/BusinessPlanClient';
import {MarketingPlanClient} from '@/components/marketing-plans/MarketingPlanClient';

/** The selected document comes only from the authenticated no-store channel.
 * Neighbours are published reads. No draft enters the shared Data Cache. */
export async function renderEditorialPage(preview:EditorialPreview) {
  const locale=preview.locale==='zh-CN'?'zh':'en';
  const document={...preview.document};
  // Header/gallery client components receive the whole normalized item. Strip
  // executable markup before any draft HTML is serialized across that boundary.
  for(const field of ['content','description','Description'])if(typeof document[field]==='string')document[field]=sanitizeRichText(document[field]);
  const row={...document,slug:preview.document.slug ?? decodeURIComponent(preview.path.split('/').at(-1) ?? ''),localization:{documentId:String(preview.document.documentId),requestedLocale:locale,resolvedLocale:locale,isFallback:false,englishPublished:locale==='en' && preview.status==='published',chinesePublished:locale==='zh' && preview.status==='published'}};
  const unavailable=<section className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-3xl font-bold">{preview.title}</h1><p className="mt-4">This saved entry needs its required media or content before its website view can render. Complete it in Strapi, save, then reopen preview.</p></section>;
  switch(preview.model) {
    case 'api::blog.blog': {
      const normalized=transformPost(row);if(!normalized)return unavailable;
      const blog=mapPost(normalized),related=await fetchRelatedBlogs(blog.Category,blog.Slug,locale,3);
      return <BlogView blog={blog} relatedBlogs={related.blogs} locale={locale}/>;
    }
    case 'api::coding-project.coding-project': {
      const project=transformCodingProject(row as unknown as StrapiCodingProject);if(!project)return unavailable;
      const related=await getRelatedCodingProjects(project.category,project.slug,3,locale);
      return <CodingProjectView project={project} relatedProjects={related.projects} locale={locale}/>;
    }
    case 'api::marketing-project.marketing-project': {
      const project=transformMarketingProject(row as unknown as StrapiMarketingProject);if(!project)return unavailable;
      const related=await getRelatedMarketingProjects(project.category,project.slug,3,locale);
      return <MarketingProjectView project={project} relatedProjects={related.projects} locale={locale}/>;
    }
    case 'api::art.art': {
      const piece=transformArtPiece(row);if(!piece)return unavailable;
      const feed=await getArtPieces({pageSize:50,locale}).catch(()=>({arts:[],page:1,pageCount:0,total:0}));
      const arts=[piece,...feed.arts.filter(item=>item.documentId!==piece.documentId)];
      return <ArtView piece={piece} feed={{...feed,arts}} locale={locale}/>;
    }
    case 'api::photography.photography': {
      const photo=transformPhoto(row),related=await repository.getRelated(photo,8).catch(()=>[]);
      return <PhotoView photo={photo} related={related} locale={locale}/>;
    }
    case 'api::business-plan.business-plan': {
      const [t,result]=await Promise.all([getDictionary(locale),fetchBusinessPlans(1,100,localizedSource(locale))]);
      const plans=[row as unknown as BusinessPlan,...result.plans.filter(item=>item.documentId!==row.localization.documentId)];
      return <BusinessPlanClient initialPlans={plans.map(transformBusinessPlan)} initialError={null} locale={locale} t={{nav:t.nav,businessPlans:t.businessPlans}}/>;
    }
    case 'api::marketing-plan.marketing-plan': {
      const [t,result]=await Promise.all([getDictionary(locale),fetchMarketingPlans(1,100,localizedSource(locale))]);
      const plans=[row as unknown as MarketingPlan,...result.plans.filter(item=>item.documentId!==row.localization.documentId)];
      return <MarketingPlanClient initialPlans={plans.map(transformMarketingPlan)} initialError={null} locale={locale} dict={{nav:t.nav,marketingPlans:t.marketingPlans}}/>;
    }
    case 'api::certificate.certificate': {
      const result=await fetchCertificates(localizedSource(locale));
      return <CertificateView certificates={[row as unknown as Certificate,...result.certificates.filter(item=>item.documentId!==row.localization.documentId)]} error={null} locale={locale}/>;
    }
    default:
      return <section className="mx-auto max-w-3xl px-6 py-24"><h1 className="text-3xl font-bold">{preview.title}</h1><p className="mt-4">This is a category, tag, or project type. It labels other entries and has no standalone published page.</p><a href={preview.path} className="mt-4 inline-block underline">Open the published collection</a></section>;
  }
}
