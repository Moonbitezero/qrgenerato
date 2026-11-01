// app/privacy-policy/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, ServerOff, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — 100% Client-Side Data Protection',
  description:
    'Read the QR Code Studio Privacy Policy. Learn how our 100% browser-based QR code generator protects your URLs, Wi-Fi passwords, UPI IDs, and uploaded images.',
  alternates: {
    canonical: '/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | QR GENERATO',
    description:
      'We never upload or store your QR payloads or images. Read our full client-side privacy commitment.',
    url: 'https://qrcodestudio.app/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-emerald-300 font-semibold">Privacy Policy</span>
      </nav>

      <article className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />

        <div className="space-y-3 border-b border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
            <ShieldCheck size={13} /> Zero Server Uploads • GDPR &amp; DPDP Compliant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400">
            Effective Date: October 30, 2026 • Last Updated: October 30, 2026
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0b0b12] border border-white/[0.07] rounded-2xl p-4 space-y-1.5">
            <ServerOff size={18} className="text-emerald-400" />
            <div className="text-xs font-bold text-white">No Payload Storage</div>
            <p className="text-[11px] text-zinc-400">
              URLs, Wi-Fi keys, vCards, and UPI IDs never leave your web browser.
            </p>
          </div>
          <div className="bg-[#0b0b12] border border-white/[0.07] rounded-2xl p-4 space-y-1.5">
            <Lock size={18} className="text-cyan-400" />
            <div className="text-xs font-bold text-white">Local Image Processing</div>
            <p className="text-[11px] text-zinc-400">
              Uploaded photos and logos are rendered via local HTML5 FileReader &amp; Canvas APIs.
            </p>
          </div>
          <div className="bg-[#0b0b12] border border-white/[0.07] rounded-2xl p-4 space-y-1.5">
            <EyeOff size={18} className="text-violet-400" />
            <div className="text-xs font-bold text-white">Local Webcam Access</div>
            <p className="text-[11px] text-zinc-400">
              Camera streams in the QR Scanner tab are decoded locally and never recorded.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Do Not Collect</h2>
            <p>
              Unlike traditional cloud-based QR generators, <strong>QR Code Studio</strong> executes
              all QR matrix generation, color styling, image masking, and optical decoding locally on
              your device. We do <strong>not</strong> transmit, log, or store:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-zinc-400">
              <li>Website URLs, plain text messages, or email drafts entered into the generator.</li>
              <li>Wi-Fi network names (SSIDs) or Wi-Fi passwords.</li>
              <li>UPI IDs (VPAs), payee names, or transaction notes.</li>
              <li>vCard contact details, phone numbers, or SMS messages.</li>
              <li>Uploaded images, brand logos, or batch CSV files.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Camera &amp; File Permissions</h2>
            <p>
              When you use our <em>Optical QR Scanner</em> tab, your browser may request permission to
              access your device camera. The video stream is processed frame-by-frame inside your
              browser memory using the open-source <code className="text-violet-300">jsQR</code> library
              and is immediately terminated when you close the scanner or switch tabs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Cookies, Local Storage &amp; Analytics</h2>
            <p>
              We do not require user accounts or login credentials. If you share a custom theme preset
              link, your color and shape preferences are encoded directly into the URL query string. We
              may use privacy-preserving, aggregate web analytics or standard advertising cookies (such
              as Google AdSense, if enabled) to measure anonymous page traffic and keep the tool free.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Third-Party Links inside QR Codes</h2>
            <p>
              QR codes generated with our tool may point to external websites, payment apps, or social
              media platforms. Once you or your users scan a QR code and visit a third-party link, that
              destination website&apos;s own privacy policy governs your interaction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Contact Our Privacy Team</h2>
            <p>
              If you have any questions about this Privacy Policy or our data protection practices,
              please reach out via our{' '}
              <Link href="/contact-us" className="text-violet-400 underline hover:text-violet-300">
                Contact Us
              </Link>{' '}
              page.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}