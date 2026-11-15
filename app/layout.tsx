// app/layout.tsx
import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SITE_NAME, SITE_URL, pageMetadata } from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata(
    '/',
    'Free QR Code Generator Online – Custom QR Codes With Logo | QR Generato',
    'Free online QR code generator with logo, colors and frames. Create QR codes for URLs, Wi-Fi, UPI, PayPal, vCard and WhatsApp. No sign-up, no watermark, codes never expire. Download PNG or SVG.'
  ),
  applicationName: SITE_NAME,
  icons: { icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon', type: 'image/png', sizes: '32x32' }], apple: '/apple-touch-icon.png' },
  keywords: [
    'qr generator',
    'qr code generator',
    'free qr generator',
    'qr generator free',
    'online qr generator',
    'qr code generator with logo',
    'custom qr code',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased selection:bg-indigo-500 selection:text-white"
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-93JX2N2RNH" />
    </html>
  );
}
