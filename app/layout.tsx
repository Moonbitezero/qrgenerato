// app/layout.tsx
import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Generato | Free Online QR Code Generator With Logo, UPI & Global Payments',
  description:
    'Create custom QR codes with logo, Bharat UPI, Europe SEPA, PayPal, Pix, Wi-Fi, vCards, 20 illustrated frames, and 16 artwork presets 100% free and client-side.',
  applicationName: 'QR Generato',
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