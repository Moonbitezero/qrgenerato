import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'Free WiFi QR Code Generator | QR Generato',
  description: 'Create a custom WiFi QR code for your home, cafe, or office. Let guests connect to your network instantly without typing a password. 100% Free.',
};

export default function WifiRoute() {
  return <HomePage initialTab="studio" />;
}