import {loadEditorialPreview} from '@/lib/server/editorial-preview';
import {renderEditorialPage} from '@/lib/server/editorial-page';
import {getDictionary} from '@/lib/getDictionary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {ThemeProvider} from '@/components/ThemeProvider';
import SyntaxWidget from '@/components/syntax ai/SyntaxWidget';
import PreviewNotice from '@/components/editorial/PreviewNotice';

export const dynamic='force-dynamic';
export default async function SavedPreview({searchParams}:{searchParams:Promise<{ticket?:string}>}) {
  const {ticket}=await searchParams,preview=ticket?await loadEditorialPreview(ticket):null;
  if(!preview)return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-bold">Preview unavailable</h1><p>The link may have expired or your access changed. Return to Strapi and open a new preview.</p></main>;
  const locale=preview.locale==='zh-CN'?'zh':'en',t=await getDictionary(locale);
  const content=await renderEditorialPage(preview);
  return <ThemeProvider attribute="class" disableTransitionOnChange>
    <div lang={preview.locale}>
      <Header translations={{nav:t.nav}} previewLocale={locale} previewPath={preview.path}/>
      <main className="min-h-screen">{content}</main>
      <Footer t={{footer:t.footer}} previewLocale={locale}/>
      <SyntaxWidget/>
      <PreviewNotice locale={locale} status={preview.status}/>
    </div>
  </ThemeProvider>;
}
