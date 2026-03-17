import Head from 'next/head';
import { ReactNode } from 'react';

interface SeoProps {
  title: string;
  description: string;
}

const SEO = ({ title, description }: SeoProps): ReactNode => {
  const siteTitle = 'Shain Wai Yan Portfolio';
  return (
    <Head>
      <title>{`${title} | ${siteTitle}`}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Shain Wai Yan" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="theme-color" content="#191970" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#a67c00" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />
      <link rel="canonical" href="https://www.shainwaiyan.com/" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
      <link rel="alternate" hrefLang="x-default" href="https://www.shainwaiyan.com/" />
      <link rel="alternate" hrefLang="en" href="https://www.shainwaiyan.com/" />
      <link rel="alternate" hrefLang="zh" href="https://www.shainwaiyan.com/zh/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.shainwaiyan.com/" />
      <meta property="og:title" content={`${title} | ${siteTitle}`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://www.shainwaiyan.com/images/Shain Studio.png" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="zh_CN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://www.shainwaiyan.com/" />
      <meta name="twitter:title" content={`${title} | ${siteTitle}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.shainwaiyan.com/images/Shain Studio.png" />
      <link rel="icon" href="/images/Shain Studio.png" type="image/png" />
      <link rel="shortcut icon" href="/images/Shain Studio.png" type="image/png" />
      <link rel="apple-touch-icon" href="/images/Shain Studio.png" />
      <link rel="icon" href="/images/Shain Studio.png" sizes="32x32" type="image/png" />
      <link rel="icon" href="/images/Shain Studio.png" sizes="96x96" type="image/png" />
      <link rel="icon" href="/images/Shain Studio.png" sizes="192x192" type="image/png" />
    </Head>
  );
};

export default SEO;