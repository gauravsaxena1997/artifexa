import { MetadataRoute } from 'next';
import { BRAND_CONFIG } from '@/config/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/private/'],
    },
    sitemap: `${BRAND_CONFIG.url}/sitemap.xml`,
  };
}
