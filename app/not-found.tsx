// app/not-found.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode, Home, Compass, HelpCircle, Mail, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The QR code or page you are looking for could not be found. Return to QR GENERATO to generate free custom QR codes online.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <div className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-8">
        {/* Top Iridescent Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500" />

        {/* Broken Matrix Graphic */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-fuchsia-500/20 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-[#0b0b12] border border-fuchsia-500/40 flex items-center justify-center shadow-inner">
            <QrCode size={44} className="text-fuchsia-400 opacity-80" />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-rose-600 text-[11px] font-mono font-extrabold text-white shadow">
              404
            </span>
          </div>
        </div>

        <div className="space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-300">
            <AlertCircle size={13} /> Matrix Pattern Not Found
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            404 — This Link Couldn&apos;t Be Decoded
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            The page you are looking for might have been moved, renamed, or never existed in our QR matrix. Let&apos;s get you back to the studio.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-fuchsia-600/25 flex items-center gap-2 transition-all"
          >
            <Home size={16} /> Back to Free QR Generator
          </Link>
          <Link
            href="/contact-us"
            className="px-5 py-3.5 rounded-2xl bg-[#0b0b12] hover:bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <Mail size={16} className="text-violet-400" /> Report Broken Link
          </Link>
        </div>

        {/* Helpful Internal Links for Users & Crawlers */}
        <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <Link
            href="/"
            className="p-3.5 rounded-2xl bg-[#0b0b12] border border-white/[0.06] hover:border-violet-500/40 transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-violet-300">
              <QrCode size={14} className="text-violet-400" /> Create QR Code
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Generate URL, UPI, Wi-Fi &amp; Image-Filled QR codes.
            </p>
          </Link>

          <Link
            href="/about"
            className="p-3.5 rounded-2xl bg-[#0b0b12] border border-white/[0.06] hover:border-pink-500/40 transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-pink-300">
              <Compass size={14} className="text-pink-400" /> About Studio
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Learn how our 100% client-side engine works.
            </p>
          </Link>

          <Link
            href="/#faq-heading"
            className="p-3.5 rounded-2xl bg-[#0b0b12] border border-white/[0.06] hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-emerald-300">
              <HelpCircle size={14} className="text-emerald-400" /> Help &amp; FAQs
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Answers on scan reliability, SVG exports &amp; UPI.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}