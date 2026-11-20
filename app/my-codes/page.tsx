import type { Metadata } from 'next';
import HomePage from '../page';

// Personal page: shows codes saved in the visitor's own browser, so keep it out of search results.
// Rendered as a section of the main page, so moving between My QR Codes and the generator is instant
// (the studio stays loaded instead of being rebuilt).
export const metadata: Metadata = {
  title: 'My QR Codes – Edit, Pause or Delete | QR Generato',
  description: 'Manage the dynamic QR codes and uploaded files you created on QR Generato.',
  alternates: { canonical: '/my-codes' },
  robots: { index: false, follow: true },
};

export default function MyCodesRoute() {
  return <HomePage initialTab="my-codes" />;
}
