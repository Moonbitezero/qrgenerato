import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'vCard QR Code Generator | Free Digital Business Card',
  description: 'Generate a free vCard QR code. Instantly share your contact details, phone number, email, and company info directly to smartphones.',
};

export default function VcardRoute() {
  return <HomePage initialTab="studio" />;
}