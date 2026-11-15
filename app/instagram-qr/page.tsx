import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/instagram-qr',
  'Instagram QR Code Generator – Free & Custom | QR Generato',
  'Create a custom Instagram QR code free. Link to your profile, post or reel, add the Instagram logo and your colours, and download PNG, SVG or MP4.'
);

export default function InstagramQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.instagram} heading="Free Instagram QR Code Generator" />;
}
