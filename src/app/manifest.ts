import { MetadataRoute } from 'next';
import { BRAND_CONFIG } from '@/config/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_CONFIG.seo.defaultTitle,
    short_name: BRAND_CONFIG.name,
    description: BRAND_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
