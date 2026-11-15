import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/pdf',
  'Free PDF & Menu QR Code Generator | QR Generato',
  'Convert your PDF link into a scannable QR code. Perfect for digital restaurant menus, company brochures, and digital catalogs. 100% Free.'
);

export default function PdfRoute() {
  return <HomePage initialTab="studio" heading="Free PDF & Menu QR Code Generator" />;
}
