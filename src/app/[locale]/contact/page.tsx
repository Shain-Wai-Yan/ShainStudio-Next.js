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
  const domain = 'https://www.shainwaiyan.com';
  const urlPath = isZh ? '/zh/contact' : '/contact';

  const title = isZh
    ? `${t.contactPage.heroTitle} ${t.contactPage.heroTitleHighlight} | 明元易 (Shain Wai Yan)`
    : 'Contact | Shain Wai Yan - Digital Marketer & Brand Strategist';

  return {
    title,
    description: isZh
      ? t.contactPage.heroSubtitle
      : 'Contact Shain Wai Yan (xolbine, 明元易), professional digital marketer and brand strategist. Get in touch for marketing consultations.',
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
      images: `${domain}/images/Shain Studio.png`,
      locale: isZh ? 'zh_CN' : 'en_US',
      alternateLocale: isZh ? 'en_US' : 'zh_CN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: isZh ? t.contactPage.heroSubtitle : 'Get in touch with Shain Wai Yan.',
      images: [`${domain}/images/Shain Studio.png`],
    },
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
