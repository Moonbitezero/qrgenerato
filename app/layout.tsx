// app/layout.tsx
import type { Metadata } from 'next';
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('qr-theme');
                  var isDark = saved ? saved === 'dark' : true;
                  document.documentElement.classList.toggle('dark', isDark);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}