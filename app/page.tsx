'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRStudio from '@/components/qr-studio';
import clsx from 'clsx';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  Wifi,
  Utensils,
  Contact,
  HelpCircle,
  CheckCircle2,
  Download,
  Palette,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  // Default to true (Dark Mode) so it matches your dark header & studio on first load!
  // (Or change to false if you convert all cards inside qr-studio.tsx to use cardClass)
const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved
      ? saved === 'dark'
      : document.documentElement.classList.contains('dark');
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
  const cardClass = isDark
    ? 'bg-[#111115] border-zinc-800/80 text-zinc-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  const subCardClass = isDark
    ? 'bg-zinc-900/70 border-zinc-800 text-zinc-100'
    : 'bg-slate-50 border-slate-200 text-slate-900';

  const mutedText = isDark ? 'text-zinc-400' : 'text-slate-500';

  const steps = [
    {
      step: '01',
      title: 'Choose Among 30+ QR Types',
      desc: 'Select URL, Bharat UPI, WiFi, WhatsApp, vCard, Restaurant Menu, PDF, or Social links.',
      icon: Layers,
      accent: 'text-indigo-500',
      svg: (
        <svg
          viewBox="0 0 160 90"
          className={clsx(
            'w-full h-24 rounded-lg border p-2',
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
          )}
        >
          <rect x="14" y="14" width="40" height="26" rx="6" className="fill-indigo-500" />
          <rect x="60" y="14" width="40" height="26" rx="6" fill={isDark ? '#27272a' : '#cbd5e1'} />
          <rect x="106" y="14" width="40" height="26" rx="6" fill={isDark ? '#27272a' : '#cbd5e1'} />
          <rect
            x="14"
            y="48"
            width="132"
            height="24"
            rx="6"
            fill={isDark ? '#18181b' : '#f8fafc'}
            stroke={isDark ? '#3f3f46' : '#cbd5e1'}
            strokeWidth="1.5"
          />
          <circle cx="28" cy="60" r="4" className="fill-indigo-500" />
          <rect x="38" y="57" width="75" height="6" rx="3" fill={isDark ? '#52525b' : '#94a3b8'} />
        </svg>
      ),
    },
    {
      step: '02',
      title: 'Customize Eyes, Frames & Logo',
      desc: 'Pick custom dot patterns, corner eye shapes, illustrated frames, or convert artwork into a center badge.',
      icon: Palette,
      accent: 'text-pink-500',
      svg: (
        <svg
          viewBox="0 0 160 90"
          className={clsx(
            'w-full h-24 rounded-lg border p-2',
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
          )}
        >
          <rect x="18" y="15" width="28" height="28" rx="7" className="fill-none stroke-indigo-500" strokeWidth="4" />
          <circle cx="32" cy="29" r="6" className="fill-pink-500" />
          <rect
            x="64"
            y="15"
            width="60"
            height="60"
            rx="12"
            fill={isDark ? '#18181b' : '#f8fafc'}
            stroke={isDark ? '#3f3f46' : '#cbd5e1'}
            strokeWidth="1.5"
          />
          <circle cx="94" cy="45" r="14" className="fill-indigo-500/20 stroke-indigo-500" strokeWidth="2" />
          <polygon points="94,35 97,42 105,42 99,47 101,54 94,49 87,54 89,47 83,42 91,42" className="fill-indigo-500" />
        </svg>
      ),
    },
    {
      step: '03',
      title: 'Download Print-Ready PNG or SVG',
      desc: 'Export high-resolution 1200px PNGs or infinite-scale Vector SVGs that work forever with zero scan limits.',
      icon: Download,
      accent: 'text-emerald-500',
      svg: (
        <svg
          viewBox="0 0 160 90"
          className={clsx(
            'w-full h-24 rounded-lg border p-2',
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
          )}
        >
          <rect
            x="48"
            y="10"
            width="64"
            height="52"
            rx="8"
            fill={isDark ? '#18181b' : '#ffffff'}
            className="stroke-emerald-500/60"
            strokeWidth="2"
          />
          <rect x="58" y="18" width="14" height="14" rx="3" fill={isDark ? '#ffffff' : '#0f172a'} />
          <rect x="88" y="18" width="14" height="14" rx="3" fill={isDark ? '#ffffff' : '#0f172a'} />
          <rect x="58" y="40" width="14" height="14" rx="3" fill={isDark ? '#ffffff' : '#0f172a'} />
          <circle cx="88" cy="47" r="6" className="fill-emerald-500" />
          <rect x="38" y="68" width="84" height="14" rx="5" className="fill-emerald-500" />
        </svg>
      ),
    },
  ];

  const useCases = [
    {
      icon: IndianRupee,
      color: 'text-emerald-500',
      badge: 'Zero Commission',
      title: 'Bharat UPI & Shop Payments',
      desc: 'Generate direct PhonePe, GPay, and Paytm QR stands with fixed or open amounts and custom shop logos.',
    },
    {
      icon: Utensils,
      color: 'text-amber-500',
      badge: 'Illustrated Frames',
      title: 'Cafe & Restaurant Menus',
      desc: 'Use our Coffee Cup, Chef Hat, Waiter Tray, or Delivery Scooter frames so guests scan your digital PDF menu.',
    },
    {
      icon: Wifi,
      color: 'text-sky-500',
      badge: '1-Scan Connect',
      title: 'Instant Guest WiFi Access',
      desc: 'Let visitors, airbnb guests, or office clients join your WPA2/WPA3 WiFi network without typing passwords.',
    },
    {
      icon: Contact,
      color: 'text-indigo-500',
      badge: 'Digital Business Card',
      title: 'vCard & WhatsApp Direct',
      desc: 'Save your phone number, company, email, and website straight into a client’s contacts in a single scan.',
    },
  ];

  const faqs = [
    {
      q: 'Do QR codes created on QR Generato ever expire?',
      a: 'No. Every QR code generated here is 100% static. Your URL, UPI ID, WiFi password, or vCard is encoded directly into the dots of the image—meaning it will work forever with unlimited scans and no subscription fees.',
    },
    {
      q: 'Can I use these QR codes for commercial printing and packaging?',
      a: 'Yes! All downloaded PNG and Vector SVG files are completely free for commercial use on product labels, restaurant table tents, flyers, billboards, and business cards with zero attribution required.',
    },
    {
      q: 'Will my QR code still scan if I add a center logo or custom artwork?',
      a: 'Yes. Our rendering engine uses Level H (High 30%) Reed-Solomon error correction and automatically clears the center modules around your logo or artwork so smartphone cameras scan it effortlessly.',
    },
    {
      q: 'Is my data or WiFi password stored on your servers?',
      a: 'Never. QR Generato runs 100% client-side inside your web browser. Your text, links, uploaded logos, and camera scans never leave your device.',
    },
    {
      q: 'What is the difference between PNG and Vector SVG downloads?',
      a: 'PNG exports a crisp 1200×1200 pixel image ready for websites, WhatsApp sharing, and standard printing. Vector SVG exports mathematical paths that graphic designers can scale to billboard size in Illustrator, CorelDRAW, or Figma without losing sharpness.',
    },
  ];

  return (
    <div
      className={clsx(
        'min-h-screen transition-colors duration-150',
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
      )}
    >
      {/* 1. MAIN INTERACTIVE QR STUDIO */}
      <QRStudio />

      {/* 2. MATCHING CLEAN INFORMATION, VISUAL GUIDE & FAQ SECTION BELOW */}
      <section className="max-w-7xl mx-auto px-4 pb-16 pt-4 space-y-8">
        {/* Card A: Visual 3-Step "How It Works" */}
        <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-6', cardClass)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Simple 3-Step Workflow
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                How to Create a Custom QR Code in Seconds
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="w-4 h-4" /> No Sign-Up • 100% Permanent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className={clsx('p-4 rounded-xl border space-y-3 flex flex-col justify-between', subCardClass)}
                >
                  {item.svg}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className={clsx('text-[11px] font-bold uppercase tracking-wider', mutedText)}>
                        Step {item.step}
                      </span>
                      <Icon className={`w-4 h-4 ${item.accent}`} />
                    </div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className={clsx('text-xs leading-relaxed', mutedText)}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card B: Popular Use Cases */}
        <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-6', cardClass)}>
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Built for Speed & Privacy
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Why Creators & Businesses Use QR Generato
            </h2>
            <p className={clsx('text-sm leading-relaxed', mutedText)}>
              Unlike subscription QR tools that deactivate your links after a trial, QR Generato encodes your data directly into the QR matrix inside your browser—delivering instant live SVG previews, custom brand badges, and permanent codes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((u) => {
              const Icon = u.icon;
              return (
                <div key={u.title} className={clsx('p-4 rounded-xl border space-y-2', subCardClass)}>
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${u.color}`} />
                    <span
                      className={clsx(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-600'
                      )}
                    >
                      {u.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold pt-1">{u.title}</h3>
                  <p className={clsx('text-xs leading-relaxed', mutedText)}>{u.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card C: Accordion FAQ */}
        <div className={clsx('border rounded-2xl p-6 sm:p-8 space-y-5', cardClass)}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className={clsx('text-xs', mutedText)}>
                Everything you need to know about static QR codes, logos, and printing.
              </p>
            </div>
          </div>

          <div className={clsx('divide-y', isDark ? 'divide-zinc-800/80' : 'divide-slate-200')}>
            {faqs.map((item) => (
              <details key={item.q} className="group py-3.5">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold hover:text-indigo-400 transition-colors">
                  <span>{item.q}</span>
                  <span
                    className={clsx(
                      'ml-4 text-xs px-2 py-0.5 rounded border group-open:rotate-45 transition-transform',
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
                    )}
                  >
                    +
                  </span>
                </summary>
                <p className={clsx('mt-2.5 text-xs sm:text-sm leading-relaxed pr-6', mutedText)}>{item.a}</p>
              </details>
            ))}
          </div>

          {/* Minimalist Footer Bar */}
          <div
            className={clsx(
              'pt-5 border-t flex flex-wrap items-center justify-between gap-4 text-xs',
              isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'
            )}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span className={clsx('font-semibold', isDark ? 'text-zinc-200' : 'text-slate-800')}>
                QR Generato PRO
              </span>
              <span>• Free Online QR Code Studio</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:underline">About Us</Link>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
              <Link href="/contact" className="hover:underline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}