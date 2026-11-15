import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/faq',
  'QR Code Generator FAQ – Free, Static & Permanent | QR Generato',
  'Answers about our free QR generator: do QR codes expire, can I add a logo, PNG vs SVG, UPI and payment QR codes, and print sizes.'
);

export default function FAQRoute() {
  return <HomePage initialTab="faq" />;
}
