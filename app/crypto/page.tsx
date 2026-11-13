import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'Crypto Wallet QR Code Generator | QR Generato',
  description: 'Create a secure Crypto QR code for Bitcoin, Ethereum, Solana, and USDT. Get paid in cryptocurrency easily with zero tracking.',
};

export default function CryptoRoute() {
  return <HomePage initialTab="studio" />;
}