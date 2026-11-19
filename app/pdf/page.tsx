import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/pdf',
  'PDF to QR Code – Free, Upload Your PDF or Menu | QR Generato',
  'Upload a PDF (up to 15 MB) and get a free QR code that opens it on any phone. Replace the menu or brochure anytime without reprinting. No sign-up.'
);

export default function PdfRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.pdf} heading="Free PDF to QR Code Generator" />;
}
