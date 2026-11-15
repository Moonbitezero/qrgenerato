import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/paypal',
  'Free PayPal QR Code Generator | QR Generato',
  'Create a custom PayPal.me QR code. Make it easy for international clients and customers to pay you globally. Free, no sign-up.'
);

export default function PaypalRoute() {
  return <HomePage initialTab="studio" heading="Free PayPal QR Code Generator" />;
}
