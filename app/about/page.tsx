// app/about/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Layers,
  IndianRupee,
  Cpu,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — Our Mission for Free, Private & Permanent QR Codes',
  description:
    'Learn how QR GENERATO built the best free online QR code generator with logo, UPI support, image-filled pixel masking, and 100% client-side privacy.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About QR GENERATO — Free Online QR Code Generator',
    description:
      'Discover the engineering and privacy-first mission behind QR GENERATO, the 100% browser-based QR code generator with zero expiration.',
    url: 'https://qrcodestudio.app/about',
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About QR GENERATO',
    url: 'https://qrcodestudio.app/about',
    description:
      'QR GENERATO is a client-side web application for generating customizable, scannable QR codes with logos, gradients, UPI payment payloads, and pixel-masked artwork.',
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-violet-300 font-semibold">About Us</span>
      </nav>

      {/* Hero Card */}
      <section className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-violet-300">
          <Sparkles size={13} /> Built for Creators, Merchants &amp; Developers
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Reinventing the Free QR Code Generator for the Modern Web
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          We built <strong>QR GENERATO</strong> because we were tired of deceptive &ldquo;free&rdquo;
          QR code generators that hold your links hostage. Too many websites let you design a QR code,
          print it on thousands of business cards or restaurant menus, and then deactivate the code
          two weeks later unless you pay a monthly fee.
        </p>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
          Our philosophy is simple: <strong>static QR codes are mathematics, and mathematics should be free forever</strong>.
          By engineering our entire rendering pipeline to run 100% inside your browser using HTML5
          Canvas, SVG path generation, and real-time optical decoding, we eliminated server costs and
          privacy risks simultaneously.
        </p>
      </section>

      {/* Core Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#12121c]/90 border border-white/[0.08] rounded-3xl p-6 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
            <Layers size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Image-Filled Pixel Masking Engine</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Unlike basic generators that only paste a tiny square in the middle, our custom matrix
            renderer masks photographs, anime illustrations, and brand textures directly into the dark
            data modules while protecting the 7×7 corner finder patterns for reliable scanning.
          </p>
        </div>

        <div className="bg-[#12121c]/90 border border-white/[0.08] rounded-3xl p-6 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Zero-Knowledge Browser Architecture</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Your Wi-Fi passwords, private vCard contact details, email templates, and uploaded artwork
            never leave your device. Everything is computed locally in memory, making QR GENERATO
            safe for enterprise and personal use.
          </p>
        </div>

        <div className="bg-[#12121c]/90 border border-white/[0.08] rounded-3xl p-6 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <IndianRupee size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Dedicated UPI &amp; Global Standards</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            We support 12+ standardized payload formats out of the box—including Indian UPI payment
            links (compatible with GPay, PhonePe, and Paytm), iCalendar events, Google Maps pins, and
            App Store smart links.
          </p>
        </div>

        <div className="bg-[#12121c]/90 border border-white/[0.08] rounded-3xl p-6 space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Real-Time Optical Verification</h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Every design change is automatically verified by our built-in optical QR decoder to warn
            you immediately if low contrast or dark backgrounds could reduce camera scannability.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-indigo-600/20 border border-fuchsia-500/30 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-white">Ready to design your custom QR code?</h2>
          <p className="text-xs sm:text-sm text-zinc-300">
            100% free, no account required, unlimited high-res PNG &amp; Vector SVG downloads.
          </p>
        </div>
        <Link
          href="/"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 shrink-0"
        >
          Launch QR Studio <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}