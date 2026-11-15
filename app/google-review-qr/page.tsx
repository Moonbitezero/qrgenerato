import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { LANDING_CONTENT } from '@/lib/landing-content';
import HomePage from '../page';

export const metadata: Metadata = pageMetadata(
  '/google-review-qr',
  'Google Review QR Code Generator – Free | QR Generato',
  'Get more Google reviews with a free Google review QR code. Customers scan and land on your review form. Add a 5-star frame and print it for your counter.'
);

export default function GoogleReviewQrRoute() {
  return <HomePage initialTab="studio" landing={LANDING_CONTENT.googleReview} heading="Free Google Review QR Code Generator" />;
}
