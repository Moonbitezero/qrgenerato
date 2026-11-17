import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import DynamicQrManager from '@/components/dynamic-qr-manager';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/dynamic-qr',
  'Free Dynamic QR Code Generator – Edit Link Anytime & Track Scans | QR Generato',
  'Create a free dynamic QR code: change the link after printing, pause it, and see scans by day, country and device. No sign-up, no subscription, no watermark.'
);

export default function DynamicQrRoute() {
  return (
    <HomePage initialTab="studio" landing={LANDING_CONTENT.dynamic} heading="Free Dynamic QR Code Generator" autoDynamic>
      <DynamicQrManager />
    </HomePage>
  );
}
