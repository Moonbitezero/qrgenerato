import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'Bharat UPI QR Code Generator | QR Generato',
  description: 'Generate a custom UPI QR code for your business. Accept payments instantly via PhonePe, GPay, Paytm, and BHIM. Free and secure.',
};

export default function UpiRoute() {
  return <HomePage initialTab="studio" />;
}