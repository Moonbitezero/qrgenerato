import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/wifi',
  'Free WiFi QR Code Generator | QR Generato',
  'Create a custom WiFi QR code for your home, cafe, or office. Let guests connect to your network instantly without typing a password. 100% Free.'
);

export default function WifiRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.wifi} heading="Free WiFi QR Code Generator" />;
}
