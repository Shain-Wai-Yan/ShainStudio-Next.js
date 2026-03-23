import type { Metadata } from 'next';
import { getDictionary } from '@/lib/getDictionary';
import { isSupportedLocale, DEFAULT_LOCALE } from '@/lib/locales';
import { ContactForm } from './contact-form';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const t = await getDictionary(locale);

  const isZh = locale === 'zh';

  return {
    title: isZh
      ? `${t.contactPage.heroTitle} ${t.contactPage.heroTitleHighlight} | Shain Wai Yan (明元易)`
      : 'Contact Me - Shain Wai Yan (xolbine) | Digital Marketer & Brand Strategist',
    description: isZh
      ? t.contactPage.heroSubtitle
      : 'Contact Shain Wai Yan (xolbine, 明元易), professional digital marketer and brand strategist. Get in touch for marketing consultations, brand strategy services, and digital marketing solutions.',
    keywords: ['contact', 'marketing consultant', 'brand strategy', 'digital marketing', 'Shain Wai Yan'],
    alternates: {
      canonical: `https://www.shainwaiyan.com/contact`,
      languages: {
        en: 'https://www.shainwaiyan.com/contact',
        zh: 'https://www.shainwaiyan.com/zh/contact',
      },
    },
    openGraph: {
      title: isZh
        ? `${t.contactPage.heroTitle} ${t.contactPage.heroTitleHighlight} | Shain Wai Yan`
        : 'Contact Me - Shain Wai Yan',
      description: isZh
        ? t.contactPage.heroSubtitle
        : 'Get in touch with Shain Wai Yan for marketing consultations and brand strategy services.',
      url: `https://www.shainwaiyan.com/${isZh ? 'zh/' : ''}contact`,
      type: 'website',
      locale: isZh ? 'zh_CN' : 'en_US',
      alternateLocale: isZh ? 'en_US' : 'zh_CN',
    },
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
