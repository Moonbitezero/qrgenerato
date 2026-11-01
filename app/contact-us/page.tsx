// app/contact-us/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/contact-form';
import { Mail, MessageSquare, Clock, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us — Support, Feedback & Feature Requests',
  description:
    'Get in touch with the QR GENERATO team. Report scanning feedback, request new QR payload types, or inquire about custom integrations.',
  alternates: {
    canonical: '/contact-us',
  },
  openGraph: {
    title: 'Contact Us | QR GENERATO',
    description:
      'Have a question or feature request for QR Code Studio? Reach out to our team anytime.',
    url: 'https://qrcodestudio.app/contact-us',
  },
};

export default function ContactUsPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact QR GENERATO',
    url: 'https://qrcodestudio.app/contact-us',
    description: 'Contact page for QR Code Studio technical support and feature requests.',
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-zinc-400 flex items-center gap-2">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <span className="text-pink-300 font-semibold">Contact Us</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#12121c]/90 border border-white/[0.1] rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold text-pink-300">
              <MessageSquare size={13} /> We&apos;d Love to Hear From You
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Contact QR GENERATO
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Have a question about our Image-Filled QR engine, need help with a batch CSV export, or
              want to request a new payload format? Send us a message and we will respond promptly.
            </p>

            <div className="space-y-3 pt-3 border-t border-white/[0.08] text-xs">
              <div className="flex items-center gap-3 text-zinc-300">
                <Mail size={16} className="text-violet-400 shrink-0" />
                <span>dancemoon248@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <Clock size={16} className="text-emerald-400 shrink-0" />
                <span>Response Time: Within 24–48 Hours</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <HelpCircle size={16} className="text-amber-400 shrink-0" />
                <Link href="/#faq-heading" className="text-amber-300 underline hover:text-amber-200">
                  Browse our 8 Instant SEO FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
            <h2 className="text-lg font-bold text-white mb-5">Send Us a Direct Message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}