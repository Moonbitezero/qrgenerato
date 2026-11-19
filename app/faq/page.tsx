import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/faq',
  'QR Code Generator FAQ – Dynamic, PDF & More | QR Generato',
  'Answers about our free QR generator: do codes expire, dynamic vs static, PDF, MP3 and image QR codes, editing and deleting codes, logos, UPI and bulk QR.'
);

export default function FAQRoute() {
  return <HomePage initialTab="faq" />;
}
