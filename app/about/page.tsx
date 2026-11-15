import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/about',
  'About QR Generato – Free QR Code Generator Online',
  'Learn about QR Generato, a free online QR code generator that runs entirely in your browser. No sign-up, no tracking, no expiring codes.'
);

export default function AboutRoute() {
  return <HomePage initialTab="about" />;
}
