import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

type Entry = [path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number];

const ROUTES: Entry[] = [
  ['/', 'weekly', 1.0],
  ['/wifi', 'weekly', 0.9],
  ['/upi', 'weekly', 0.9],
  ['/paypal', 'weekly', 0.9],
  ['/whatsapp', 'weekly', 0.9],
  ['/vcard', 'weekly', 0.9],
  ['/pdf', 'weekly', 0.9],
  ['/crypto', 'weekly', 0.9],
  ['/animated-qr-code', 'weekly', 0.9],
  ['/qr-code-with-logo', 'weekly', 0.9],
  ['/business-card-qr', 'weekly', 0.9],
  ['/google-review-qr', 'weekly', 0.9],
  ['/instagram-qr', 'weekly', 0.9],
  ['/youtube-qr', 'weekly', 0.9],
  ['/faq', 'monthly', 0.8],
  ['/about', 'monthly', 0.7],
  ['/contact-us', 'monthly', 0.6],
  ['/privacy-policy', 'yearly', 0.4],
  ['/terms-and-conditions', 'yearly', 0.4],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
