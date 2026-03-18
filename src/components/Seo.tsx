import Head from 'next/head';

interface SeoProps {
  title: string;
  description: string;
  url: string; // full URL of current page
  image?: string; // optional custom image per page
  locale?: string;
}

const SEO = ({
  title,
  description,
  url,
  image = 'https://www.shainwaiyan.com/images/Shain Studio.png',
  locale = 'en_US',
}: SeoProps) => {
  const siteTitle = 'Shain Wai Yan Portfolio';

  return (
    <Head>
      {/* Basic */}
      <title>{`${title} | ${siteTitle}`}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Shain Wai Yan" />
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Theme */}
      <meta name="theme-color" content="#191970" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#a67c00" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />

      {/* Performance */}
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="x-default" href="https://www.shainwaiyan.com/" />
      <link rel="alternate" hrefLang="en" href="https://www.shainwaiyan.com/" />
      <link rel="alternate" hrefLang="zh" href="https://www.shainwaiyan.com/zh/" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={`${title} | ${siteTitle}`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="zh_CN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={`${title} | ${siteTitle}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Favicon (cleaned) */}
      <link rel="icon" href="/images/Shain Studio.png" sizes="32x32" />
      <link rel="apple-touch-icon" href="/images/Shain Studio.png" />
    </Head>
  );
};

export default SEO;