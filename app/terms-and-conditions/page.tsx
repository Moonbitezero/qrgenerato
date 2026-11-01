// app/terms-and-conditions/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions — Commercial Use & Service Guidelines',
  description:
    'Read the Terms and Conditions for QR Code Studio. Free commercial and personal use license, print verification guidelines, and acceptable use policies.',
  alternates: {
    canonical: '/terms-and-conditions',
  },
  openGraph: {
    title: 'Terms and Conditions | QR GENERATO',
    description:
      'Review our free commercial use rights, scannability testing guidelines, and acceptable use policy.',
    url: 'https://qrcodestudio.app/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-cyan-300 font-semibold">Terms &amp; Conditions</span>
      </nav>

      <article className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" />

        <div className="space-y-3 border-b border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300">
            <Scale size={13} /> Royalty-Free Commercial &amp; Personal Use
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Terms and Conditions
          </h1>
          <p className="text-xs text-zinc-400">
            Last Updated: October 30, 2026
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using <strong>QR GENERATO</strong>, you agree to comply with and be
              bound by these Terms and Conditions. If you do not agree with any part of these terms,
              please discontinue use of our web application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Commercial &amp; Personal License</h2>
            <p>
              All QR codes generated using QR Code Studio (including PNG raster images, SVG vector
              files, A4 sticker sheets, and batch ZIP archives) are <strong>100% royalty-free</strong>{' '}
              for both personal and commercial use. You may print them on product packaging, business
              cards, apparel, billboards, and digital media without attribution or recurring fees.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. User Responsibility &amp; Acceptable Use</h2>
            <p>
              Because QR GENERATO encodes your input directly into the QR matrix without human
              moderation, you are solely responsible for the content you encode. You agree{' '}
              <strong>not</strong> to use this tool to generate QR codes that point to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-zinc-400">
              <li>Phishing websites, malware downloads, or fraudulent UPI payment requests.</li>
              <li>Illegal, defamatory, or copyright-infringing material.</li>
              <li>Deceptive redirects intended to harvest unauthorized personal or financial data.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              4. Scannability Verification &amp; Print Disclaimer
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Mandatory Pre-Print Testing:</strong> Highly customized QR codes—especially
                those using low-contrast colors, inverted backgrounds, or complex <em>Image-Filled</em>{' '}
                photographs—may scan differently across various smartphone cameras and lighting
                conditions. Always test-scan your downloaded QR code with multiple physical phones
                before ordering mass print runs.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Limitation of Liability</h2>
            <p>
              QR GENERATO is provided &ldquo;AS IS&rdquo; without warranties of any kind. In no
              event shall QR Code Studio or its creators be liable for any printing costs, lost
              revenue, or indirect damages arising from an unscannable QR code or a typo entered into a
              payload field.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}