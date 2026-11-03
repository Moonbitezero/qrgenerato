// app/about/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  QrCode,
  Zap,
  ShieldCheck,
  Sparkles,
  IndianRupee,
  Layers,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

export default function AboutPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved ? saved === 'dark' : true;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    const handler = (e: Event) => {
      const nextDark = Boolean((e as CustomEvent).detail);
      setIsDark(nextDark);
      document.documentElement.classList.toggle('dark', nextDark);
    };
    window.addEventListener('qr-theme-change', handler);
    return () => window.removeEventListener('qr-theme-change', handler);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('qr-theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
    window.dispatchEvent(new CustomEvent('qr-theme-change', { detail: nextDark }));
  };

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
      title: '34+ Smart QR Payloads',
      desc: 'From Bharat UPI, PayPal, and Crypto to WhatsApp, WiFi, Restaurant Menus, and vCards—all static and permanent.',
    },
    {
      icon: Layers,
      color: 'text-pink-500',
      title: 'Custom Eyes, Frames & Batch Studio',
      desc: 'Style independent corner eyes, add center brand badges, wrap codes in illustrated frames, or batch-print QR sheets.',
    },
  ];

  return (
    <div className="py-12 px-4 transition-colors duration-150">
      <div className="max-w-3xl mx-auto space-y-6">
        <div
          className={clsx(
            'border rounded-2xl p-8 space-y-6',
            isDark
              ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
              : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/60'
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Built for Speed &amp; Simplicity
            </span>

            <button
              onClick={toggleTheme}
              className={clsx(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
              )}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">About QR Generato</h1>

          <p className={clsx('text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
            Most online QR code generators trick users into creating &ldquo;dynamic&rdquo; links that expire after a 7-day trial unless you pay a monthly subscription. <strong>QR Generato</strong> was built to fix that—giving creators, businesses, shops, and developers a fast, minimalist studio where every QR code is 100% static, permanent, and free forever.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={clsx(
                    'p-4 rounded-xl border space-y-1.5',
                    isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-slate-50 border-slate-200/90'
                  )}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <h2 className="text-sm font-bold">{item.title}</h2>
                  <p className={clsx('text-xs leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            className={clsx(
              'pt-6 border-t flex flex-wrap items-center justify-between gap-4',
              isDark ? 'border-zinc-800' : 'border-slate-200'
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-600 text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">No Sign-Up Required</p>
                <p className={clsx('text-[11px]', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                  Unlimited high-res PNG &amp; Vector SVG downloads
                </p>
              </div>
            </div>

            <Link
              href="/"
              className={clsx(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90',
                isDark ? 'bg-white text-black' : 'bg-indigo-600 text-white'
              )}
            >
              Open QR Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}