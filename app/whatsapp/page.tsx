import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/whatsapp',
  'Free WhatsApp QR Code Generator | QR Generato',
  'Create a free custom WhatsApp QR code. Let customers scan to instantly open a chat with your business phone number. No signup required.'
);

export default function WhatsappRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.whatsapp} heading="Free WhatsApp QR Code Generator" />;
}
