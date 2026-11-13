import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'WhatsApp QR Code Generator | QR Generato',
  description: 'Create a free custom WhatsApp QR code. Let customers scan to instantly open a chat with your business phone number. No signup required.',
};

export default function WhatsappRoute() {
  return <HomePage initialTab="studio" />;
}