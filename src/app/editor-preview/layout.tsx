import type {Metadata} from 'next';
import {inter,playfair} from '@/lib/site-fonts';
import '@/app/globals.css';
export const metadata:Metadata={title:'Saved website preview | Shain Studio',robots:{index:false,follow:false,nocache:true},referrer:'no-referrer'};
export default function PreviewLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" suppressHydrationWarning dir="ltr" data-scroll-behavior="smooth" className={`${inter.variable} ${playfair.variable}`}><body className="font-sans">{children}</body></html>;
}
