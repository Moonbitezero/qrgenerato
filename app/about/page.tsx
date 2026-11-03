// app/about/page.tsx
import React from 'react';
import Link from 'next/link';
import { QrCode, Zap, ShieldCheck, Sparkles, IndianRupee, Layers, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      color: 'text-amber-500',
      title: 'Instant Vector Engine',
      desc: 'Built on a zero-lag SVG & HTML5 Canvas rendering pipeline that generates crisp, print-ready QR codes in real time.',
    },
    {
      icon: ShieldCheck,
      color: 'text-emerald-500',
      title: '100% Client-Side Privacy',
      desc: 'Your URLs, WiFi credentials, vCards, and payment details are encoded directly inside your browser—never stored on external servers.',
    },
    {
      icon: IndianRupee,
      color: 'text-indigo-500',
      title: '30+ Smart QR Payloads',
      desc: 'From Bharat UPI, PayPal, and Crypto to WhatsApp, WiFi, Restaurant Menus, and vCards—all static and permanent.',
    },
    {
      icon: Layers,
      color: 'text-pink-500',
      title: 'Custom Eyes, Frames & Batch ZIP',
      desc: 'Style independent corner eyes, add center brand badges, wrap codes in illustrated frames, or batch-export up to 50 SVGs at once.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Hero Card */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 shadow-sm space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Built for Speed & Simplicity
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            About QR Generato
          </h1>

          <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
            Most online QR code generators trick users into creating &ldquo;dynamic&rdquo; links that expire after a 7-day trial unless you pay a monthly subscription. <strong>QR Generato</strong> was built to fix that—giving creators, businesses, shops, and developers a fast, minimalist studio where every QR code is 100% static, permanent, and free forever.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-1.5"
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 dark:bg-zinc-800 text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold">No Sign-Up Required</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Unlimited high-res PNG & Vector SVG downloads
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Open QR Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}