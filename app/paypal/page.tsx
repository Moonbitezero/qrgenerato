import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'PayPal QR Code Generator | QR Generato',
  description: 'Create a custom PayPal.me QR code. Make it easy for international clients and customers to pay you globally.',
};

export default function PaypalRoute() { 
  return <HomePage initialTab="studio" />; 
}