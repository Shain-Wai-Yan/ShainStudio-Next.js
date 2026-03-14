import type { Metadata } from 'next';
import { ContactFormZh } from './contact-form-zh';

export const metadata: Metadata = {
  title: '联系我 – 明元易（Shain Wai Yan | xolbine） | 数字营销专家 & 品牌策略师',
  description: '联系明元易（Shain Wai Yan、xolbine），专业数字营销专家与品牌策略师。获取营销咨询、品牌战略规划及数字营销解决方案。',
  keywords: ['联系', '营销咨询', '品牌策略', '数字营销', '明元易'],
  alternates: {
    canonical: '/zh/contact',
    languages: {
      'en': '/contact',
      'zh': '/zh/contact',
    },
  },
  openGraph: {
    title: '联系我 – 明元易 | 数字营销专家',
    description: '联系明元易获取营销咨询和品牌战略服务。',
    url: 'https://www.shainwaiyan.com/zh/contact',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function ContactPageZh() {
  return <ContactFormZh />;
}
