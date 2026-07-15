import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shain Wai Yan — Digital Marketing & Brand Strategist',
    short_name: 'Shain Studio',
    description:
      'Digital Marketing & Brand Strategy portfolio of Shain Wai Yan (aka xolbine, 明元易). Explore AI‑powered campaigns, content strategy, & market analysis.',
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
