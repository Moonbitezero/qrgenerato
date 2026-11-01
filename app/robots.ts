// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcodestudio.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/contact-us', '/privacy-policy', '/terms-and-conditions', '/opengraph-image'],
        disallow: ['/api/', '/*?preset=*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}