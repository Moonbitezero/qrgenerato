import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/privacy-policy',
  'Privacy Policy | QR Generato',
  'How QR Generato handles your data. QR codes are generated in your browser and your content is never uploaded.'
);

export default function PrivacyRoute() {
  return <HomePage initialTab="privacy" />;
}
