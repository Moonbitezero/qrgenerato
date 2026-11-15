import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/terms-and-conditions',
  'Terms & Conditions | QR Generato',
  'Terms of use for the QR Generato free online QR code generator.'
);

export default function TermsRoute() {
  return <HomePage initialTab="terms" />;
}
