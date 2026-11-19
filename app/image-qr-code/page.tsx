import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/image-qr-code',
  'Image to QR Code – Free Photo QR Code Generator | QR Generato',
  'Turn a photo or image into a QR code. Upload JPG, PNG or WebP free (up to 10 MB), swap the picture anytime and see views. Works on every phone. No sign-up.'
);

export default function ImageQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.image} heading="Free Image to QR Code Generator" />;
}
