import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/qr-code-scanner',
  'QR Code Scanner Online – Camera or Image, Free | QR Generato',
  'Free online QR code scanner. Scan with your phone or laptop camera, or upload a screenshot or photo. Works in the browser, nothing is uploaded, no app needed.'
);

export default function QrScannerRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.scanner} heading="Free QR Code Scanner Online" studioMode="scanner" />;
}
