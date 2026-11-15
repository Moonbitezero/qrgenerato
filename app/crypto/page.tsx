import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/crypto',
  'Free Crypto Wallet QR Code Generator | QR Generato',
  'Create a secure Crypto QR code for Bitcoin, Ethereum, Solana, and USDT. Get paid in cryptocurrency easily with zero tracking.'
);

export default function CryptoRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.crypto} heading="Free Crypto Wallet QR Code Generator" />;
}
