// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#07070b',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://qrcodestudio.app'),
  title: {
    default: 'Free QR Code Generator Online — No Sign Up, With Logo & UPI | QR Code Studio',
    template: '%s | QR Code Studio',
  },
  description:
    'The best free QR code generator online with no sign up and no expiration. Create custom QR codes with logo, UPI QR codes, link to QR, email, and image-filled artwork in PNG & SVG.',
  keywords: [
    'qr code generator',
    'free qr code generator',
    'upi qr code generator',
    'email qr code generator online',
    'link to qr code generator',
    'qr code generator with logo',
    'qr code generator free',
    'qr code generator free online',
    'free qr code generator no sign up',
    'free qr code generator no expiration',
    'best qr code generator',
    'adobe express qr code generator',
    'best free qr code generator',
    'free qr code generator google',
    'qr code generator online',
    'qr code generator free no expiration',
    'qr code generator google',
    'the qr code generator',
    'qr code generator adobe',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://qrcodestudio.app',
    siteName: 'QR Code Studio',
    title: 'Free QR Code Generator Online (With Logo, UPI & No Expiration)',
    description:
      'Generate permanent, 100% scannable QR codes online for free. Supports UPI payments, website links, custom logos, multi-stop gradients, and image-filled pixel masks.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'QR Code Studio — Best Free Online QR Code Generator with Logo & UPI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free QR Code Generator Online — With Logo, UPI & No Sign Up',
    description:
      'Create custom QR codes with logos, gradients, and UPI payment links online for free. 100% browser-processed with zero expiration.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-93JX2N2RNH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-93JX2N2RNH');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-[#07070b] text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200 flex flex-col">
        {/* Global Ambient Glows */}
        <div className="pointer-events-none fixed top-[-180px] left-[8%] w-[320px] sm:w-[550px] h-[320px] sm:h-[550px] rounded-full bg-violet-600/20 blur-[130px] sm:blur-[150px]" />
        <div className="pointer-events-none fixed top-[20%] right-[-120px] w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-fuchsia-600/15 blur-[130px] sm:blur-[150px]" />
        <div className="pointer-events-none fixed bottom-[-180px] left-[35%] w-[320px] sm:w-[520px] h-[320px] sm:h-[520px] rounded-full bg-cyan-500/10 blur-[130px] sm:blur-[150px]" />

        <SiteHeader />
        <div className="flex-1 relative z-10">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}