import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/mp3-qr-code',
  'MP3 to QR Code – Free Audio QR Code Generator | QR Generato',
  'Turn an MP3, voice memo or song into a QR code that plays on any phone. Upload audio free (up to 20 MB), replace it anytime and see plays. No sign-up.'
);

export default function Mp3QrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.audio} heading="Free MP3 & Audio QR Code Generator" />;
}
