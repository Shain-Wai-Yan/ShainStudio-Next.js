import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shain Studio — Shain Wai Yan Portfolio',
    short_name: 'Shain Studio',
    description:
      'Portfolio of Shain Wai Yan (also known as Xolbine and 明元易), a technical marketer and creative technologist working across digital marketing, technology, data, and AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#191970',
    icons: [
      {
        src: '/images/Shain%20Studio.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
