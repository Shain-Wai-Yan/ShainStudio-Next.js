import type { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact Me - Shain Wai Yan (xolbine) | Digital Marketer & Brand Strategist',
  description: 'Contact Shain Wai Yan (xolbine, 明元易), professional digital marketer and brand strategist. Get in touch for marketing consultations, brand strategy services, and digital marketing solutions.',
  keywords: ['contact', 'marketing consultant', 'brand strategy', 'digital marketing', 'Shain Wai Yan'],
  alternates: {
    canonical: '/contact',
    languages: {
      'en': '/contact',
      'zh': '/zh/contact',
    },
  },
  openGraph: {
    title: 'Contact Me - Shain Wai Yan',
    description: 'Get in touch with Shain Wai Yan for marketing consultations and brand strategy services.',
    url: 'https://www.shainwaiyan.com/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
