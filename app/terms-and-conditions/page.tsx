// app/terms/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { FileText, CheckCircle2, Sun, Moon } from 'lucide-react';

export default function TermsPage() {
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

  return (
    <div className="py-12 px-4 transition-colors duration-150">
      <div
        className={clsx(
          'max-w-3xl mx-auto border rounded-2xl p-8 space-y-6',
          isDark
            ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
            : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/60'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <FileText className="w-3.5 h-3.5" /> Fair Use &amp; Commercial License
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

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Terms &amp; Conditions</h1>
          <p className={clsx('text-xs mt-1', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            Last Updated: November 2026
          </p>
        </div>

        <section className={clsx('space-y-2 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            1. Free Personal &amp; Commercial Use
          </h2>
          <p>
            All QR codes generated on QR Generato are 100% free to use for both personal projects and commercial applications—including product packaging, restaurant menus, business cards, flyers, and payment stands—with no attribution or subscription required.
          </p>
        </section>

        <section className={clsx('space-y-2 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            2. User Responsibility &amp; Acceptable Use
          </h2>
          <p>
            Because QR Generato encodes information directly in your browser without server moderation, you are solely responsible for the URLs, payment addresses, and text you encode. You agree not to use this tool to generate QR codes pointing to phishing pages, malware, fraudulent UPI/payment requests, or illegal content.
          </p>
        </section>

        <section className={clsx('space-y-2 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            3. Print Verification &amp; Scannability
          </h2>
          <p>
            While our rendering engine uses high error-correction levels (<code>H</code> by default) to ensure maximum scannability with custom logos and colors, you must always test your downloaded QR code with a smartphone camera before mass printing.
          </p>
        </section>

        <div
          className={clsx(
            'pt-4 border-t flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold',
            isDark ? 'border-zinc-800' : 'border-slate-200'
          )}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Static QR codes generated here never expire and have no scan limits.</span>
        </div>
      </div>
    </div>
  );
}