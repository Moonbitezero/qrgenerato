// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Analytics from '@/components/analytics';
import { SITE_NAME, SITE_URL, pageMetadata } from '@/lib/seo';
import './globals.css';

// Same typeface on Windows, macOS, iOS and Android (self-hosted by Next, no request to Google at runtime).
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-jakarta' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets the page use the full screen on notched iPhones; edges are padded with safe-area insets in globals.css.
  viewportFit: 'cover',
  themeColor: '#121217',
  colorScheme: 'dark light',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata(
    '/',
    'Free QR Code Generator Online – Custom QR Codes With Logo | QR Generato',
    'Free online QR code generator with logo, colors and frames. Create QR codes for URLs, Wi-Fi, UPI, PayPal, vCard and WhatsApp. No sign-up, no watermark, codes never expire. Download PNG or SVG.'
  ),
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black' },
  formatDetection: { telephone: false },
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
    <html lang="en" className={`dark ${jakarta.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased selection:bg-indigo-500 selection:text-white"
      >
        {children}
      </body>
      <Analytics gaId="G-93JX2N2RNH" />
    </html>
  );
}
