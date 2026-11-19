import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/bulk-qr-code-generator',
  'Bulk QR Code Generator – 200 Codes, ZIP, Free | QR Generato',
  'Generate up to 200 QR codes at once from a list or Excel column. Download every code as PNG and SVG in one ZIP with an index CSV. Free, no sign-up.'
);

export default function BulkQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.bulk} heading="Free Bulk QR Code Generator" studioMode="batch" />;
}
