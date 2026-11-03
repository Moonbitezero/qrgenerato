// app/contact/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Mail, MessageSquare, Send, CheckCircle2, Sun, Moon } from 'lucide-react';

export default function ContactPage() {
  const [isDark, setIsDark] = useState(true);
  const [submitted, setSubmitted] = useState(false);

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

  const inputClass = clsx(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-indigo-500',
    isDark
      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
  );

  return (
    <div className="py-12 px-4 transition-colors duration-150">
      <div
        className={clsx(
          'max-w-2xl mx-auto border rounded-2xl p-8 space-y-6',
          isDark
            ? 'bg-[#111116] border-zinc-800/90 text-zinc-100 shadow-lg shadow-black/20'
            : 'bg-white border-slate-200/90 text-slate-900 shadow-md shadow-slate-200/60'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="w-3.5 h-3.5" /> Support &amp; Feature Requests
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Us</h1>
          <p className={clsx('text-sm mt-1', isDark ? 'text-zinc-400' : 'text-slate-600')}>
            Have a question, feedback, or custom QR frame request? Send us a message below.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h2 className="text-base font-bold text-emerald-500">Message Received!</h2>
            <p className={clsx('text-xs', isDark ? 'text-zinc-300' : 'text-slate-600')}>
              Thank you for reaching out. Our team will get back to you shortly.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Your Name</label>
                <input type="text" required placeholder="Sameer Kumar" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Email Address</label>
                <input type="email" required placeholder="you@example.com" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Tell us how we can help..."
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className={clsx(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer',
                isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              )}
            >
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
          </form>
        )}

        <div
          className={clsx(
            'pt-5 border-t flex items-center gap-2 text-xs',
            isDark ? 'border-zinc-800 text-zinc-400' : 'border-slate-200 text-slate-500'
          )}
        >
          <Mail className="w-4 h-4 text-indigo-500" />
          <span>Direct Email: support@qrgenerato.com</span>
        </div>
      </div>
    </div>
  );
}