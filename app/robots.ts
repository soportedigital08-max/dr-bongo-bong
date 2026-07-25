import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: [
      'https://drbongobong.com.ar/sitemap.xml',
      'https://drbongobong.com.ar/news-sitemap',
    ],
    host: 'https://drbongobong.com.ar',
  };
}
