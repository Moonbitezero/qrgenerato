import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/youtube-qr',
  'YouTube QR Code Generator – Channel & Video | QR Generato',
  'Make a free YouTube QR code for your channel, video or playlist. Add the YouTube logo and a frame, then download high-resolution PNG or SVG.'
);

export default function YoutubeQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.youtube} heading="Free YouTube QR Code Generator" />;
}
