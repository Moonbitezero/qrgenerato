import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/terms-and-conditions',
  'Terms & Conditions | QR Generato',
  'Terms of use for QR Generato: free commercial use of QR codes, rules for uploaded files and dynamic codes, limits, and how content is removed.'
);

export default function TermsRoute() {
  return <HomePage initialTab="terms" />;
}
