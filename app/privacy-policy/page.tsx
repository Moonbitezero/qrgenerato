// app/privacy/page.tsx
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#111115] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Client-Side Privacy
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Last Updated: November 2026</p>
        </div>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">1. Zero Data Storage on Our Servers</h2>
          <p>
            All QR codes—including URLs, WiFi passwords, UPI IDs, and vCards—are generated directly inside your browser. We never transmit, log, or store your QR payload data or uploaded logos on any external database.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">2. Camera & Scanner Permissions</h2>
          <p>
            When you use the QR Scanner, camera frames and uploaded images are processed locally on your device using WebAssembly/Canvas APIs and are immediately discarded after decoding.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">3. Static & Permanent QR Codes</h2>
          <p>
            Because your information is encoded directly into the QR pattern, your downloaded PNG and SVG files work forever without redirection tracking or subscription fees.
          </p>
        </section>
      </div>
    </main>
  );
}