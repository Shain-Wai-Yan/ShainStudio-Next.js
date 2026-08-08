import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shain Wai Yan — Technical Marketer',
    short_name: 'Shain Studio',
    description:
      'Portfolio of Shain Wai Yan (aka xolbine, 明元易) — Technical Marketer, MarTech Enthusiast, and Creative Technologist. Explore my work in digital marketing, technology, data, and AI.',
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
