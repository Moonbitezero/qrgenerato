import { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'PDF & Menu QR Code Generator | QR Generato',
  description: 'Convert your PDF link into a scannable QR code. Perfect for digital restaurant menus, company brochures, and digital catalogs. 100% Free.',
};

export default function PdfRoute() {
  return <HomePage initialTab="studio" />;
}