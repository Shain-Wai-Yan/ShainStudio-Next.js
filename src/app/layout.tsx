import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Font Awesome CSS
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Digital Marketing & Brand Strategist | Shain Wai Yan (xolbine)",
    template: "%s | Shain Wai Yan (xolbine)",
  },
  description: "Digital Marketing & Brand Strategy portfolio of Shain Wai Yan (aka xolbine, 明元易). Explore AI‑powered campaigns, content strategy, & market analysis.",
  authors: [{ name: "Shain Wai Yan" }],
  robots: "index, follow, max-image-preview:large",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#191970" },
    { media: "(prefers-color-scheme: dark)", color: "#a67c00" },
  ],
  colorScheme: "light dark",
  metadataBase: new URL("https://www.shainwaiyan.com"),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'zh': '/zh',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.shainwaiyan.com/',
    title: 'Digital Marketing & Brand Strategist | Shain Wai Yan',
    description: 'Explore AI‑powered campaigns, content strategy, & market analysis in the portfolio of Shain Wai Yan (xolbine).',
    images: 'https://www.shainwaiyan.com/images/Shain Studio.png',
    siteName: "Shain's Portfolio",
    locale: "en_US",
    alternateLocale: "zh_CN",
  },
  twitter: {
  card: 'summary_large_image',
  title: 'Digital Marketing & Brand Strategist | Shain Wai Yan',
  description: 'Explore AI‑powered campaigns, content strategy, & market analysis in the portfolio of Shain Wai Yan (xolbine).',
  images: ['https://www.shainwaiyan.com/images/Shain Studio.png'],  // ✅ Also make this an array
},
  icons: {
    icon: [
        { url: '/images/Shain Studio.png', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '32x32', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '96x96', type: 'image/png' },
        { url: '/images/Shain Studio.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/images/Shain Studio.png',
    apple: '/images/Shain Studio.png',
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
