import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/upi',
  'Free UPI QR Code Generator | QR Generato',
  'Generate a custom UPI QR code for your business. Accept payments instantly via PhonePe, GPay, Paytm, and BHIM. Free and secure.'
);

export default function UpiRoute() {
  return <HomePage initialTab="studio" landing="upi" heading="Free UPI QR Code Generator" />;
}
