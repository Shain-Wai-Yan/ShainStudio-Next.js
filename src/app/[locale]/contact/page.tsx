import type { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { ContactForm } from './contact-form';
import { DEFAULT_OG_IMAGE, SITE_URL } from '@/lib/seo';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  const isZh = locale === 'zh';
  const domain = SITE_URL;
  const urlPath = isZh ? '/zh/contact' : '/contact';

  const title = isZh
    ? `${t.contactPage.heroTitle} ${t.contactPage.heroTitleHighlight} | 明元易`
    : 'Contact Shain Wai Yan | Technical Marketer';

  return {
    title: { absolute: title },
    description: isZh
      ? t.contactPage.heroSubtitle
      : 'Contact Shain Wai Yan (Xolbine, 明元易), Technical Marketer. Get in touch for marketing consultations.',
    alternates: {
      canonical: `${domain}${urlPath}`,
      languages: {
        en: `${domain}/contact`,
        zh: `${domain}/zh/contact`,
        'x-default': `${domain}/contact`
      },
    },
    openGraph: {
      title,
      description: isZh ? t.contactPage.heroSubtitle : 'Get in touch with Shain Wai Yan for marketing consultations and brand strategy services.',
      url: `${domain}${urlPath}`,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
      locale: isZh ? 'zh_CN' : 'en_US',
      alternateLocale: isZh ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: isZh ? t.contactPage.heroSubtitle : 'Get in touch with Shain Wai Yan.',
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
