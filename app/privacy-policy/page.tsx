'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { ShieldCheck, Lock, EyeOff, ServerOff, Sun, Moon } from 'lucide-react';

export default function PrivacyPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('qr-theme');
    const prefersDark = saved ? saved === 'dark' : true;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);

    const handler = (e: Event) => setIsDark(Boolean((e as CustomEvent).detail));
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
    <div
      className={clsx(
        'min-h-[80vh] py-12 px-4 transition-colors duration-150',
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#eef2f6] text-slate-900'
      )}
    >
      <div
        className={clsx(
          'max-w-3xl mx-auto border rounded-2xl p-8 space-y-6',
          isDark
            ? 'bg-[#111116] border-zinc-800/90 shadow-lg shadow-black/20'
            : 'bg-white border-slate-200/90 shadow-md shadow-slate-200/60'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Architecture
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className={clsx('text-xs mt-1', isDark ? 'text-zinc-400' : 'text-slate-500')}>
            Last Updated: November 2026
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: ServerOff, title: 'Zero Server Storage', desc: 'Your links, WiFi passwords, and UPI IDs never leave your browser.' },
            { icon: Lock, title: 'Local Image Processing', desc: 'Uploaded brand logos and artwork are rendered locally in memory.' },
            { icon: EyeOff, title: 'No Scan Tracking', desc: 'Static QR codes connect scanners directly to your destination URL.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={clsx(
                  'p-4 rounded-xl border space-y-1.5',
                  isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-slate-50 border-slate-200/90'
                )}
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-bold">{item.title}</h2>
                <p className={clsx('text-[11px] leading-relaxed', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <section className={clsx('space-y-2 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            1. How We Process Your Data
          </h2>
          <p>
            QR Generato is engineered as a purely client-side web application. When you enter a website URL, Bharat UPI ID, WiFi password, or vCard contact details, the QR matrix is calculated directly inside your device&apos;s browser using JavaScript. We do not transmit, log, or store your encoded payloads on any external database.
          </p>
        </section>

        <section className={clsx('space-y-2 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            2. Uploaded Logos, Photos &amp; Camera Access
          </h2>
          <p>
            When you upload a custom brand logo, background photo, or QR screenshot—or grant camera permission in the QR Scanner tab—all image data is processed locally via the HTML5 FileReader and Canvas APIs. Your images are never uploaded to any cloud server.
          </p>
        </section>

        <section className={clsx('space-y-2 text-sm leading-relaxed', isDark ? 'text-zinc-300' : 'text-slate-600')}>
          <h2 className={clsx('text-base font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            3. LocalStorage Theme Preference
          </h2>
          <p>
            We use a single browser `localStorage` key (`qr-theme`) solely to remember whether you prefer Dark Mode or Light Mode across page visits. No tracking cookies or personal identifiers are stored.
          </p>
        </section>
      </div>
    </div>
  );
}