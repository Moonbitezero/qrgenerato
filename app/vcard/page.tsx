import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/vcard',
  'Free vCard QR Code Generator – Digital Business Card | QR Generato',
  'Generate a free vCard QR code. Instantly share your contact details, phone number, email, and company info directly to smartphones.'
);

export default function VcardRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.vcard} heading="Free vCard QR Code Generator" />;
}
