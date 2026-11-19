import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/animated-qr-code',
  'Animated QR Code Generator – Free GIF & MP4 | QR Generato',
  'Make an animated QR code free. 70 moving effects (light sweeps, radar, glitch, rainbow) that still scan. Download GIF, MP4 or SVG. No sign-up, no watermark.'
);

export default function AnimatedQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.animated} heading="Free Animated QR Code Generator" />;
}
