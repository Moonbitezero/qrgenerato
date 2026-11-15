import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/qr-code-with-logo',
  'QR Code Generator With Logo – Free, No Watermark | QR Generato',
  'Create a QR code with your logo in the centre for free. Upload your logo, match brand colours and download high-resolution PNG or SVG. No sign-up, never expires.'
);

export default function LogoQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.logo} heading="Free QR Code Generator With Logo" />;
}
