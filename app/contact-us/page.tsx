import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/contact-us',
  'Contact Us | QR Generato',
  'Questions or feedback about the free QR code generator? Contact the QR Generato team.'
);

export default function ContactRoute() {
  return <HomePage initialTab="contact" />;
}
