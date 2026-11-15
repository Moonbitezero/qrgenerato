import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/business-card-qr',
  'Business Card QR Code Generator – Free Printable Cards | QR Generato',
  'Create a business card with a QR code free. Choose a printable card layout, add your vCard or website and download a print-ready 2000px PNG. No watermark.'
);

export default function BusinessCardQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.businessCard} heading="Business Card QR Code Generator" />;
}
