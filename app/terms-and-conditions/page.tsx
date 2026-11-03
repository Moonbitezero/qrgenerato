// app/terms/page.tsx
import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#111115] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
            <FileText className="w-3.5 h-3.5" /> Fair Use & Commercial License
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Terms & Conditions</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Last Updated: November 2026</p>
        </div>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            1. Free Personal & Commercial Use
          </h2>
          <p>
            All QR codes generated on QR Generato are 100% free to use for both personal projects and commercial applications—including product packaging, restaurant menus, business cards, flyers, and payment stands—with no attribution or subscription required.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            2. User Responsibility & Acceptable Use
          </h2>
          <p>
            Because QR Generato encodes information directly in your browser without server moderation, you are solely responsible for the URLs, payment addresses, and text you encode. You agree not to use this tool to generate QR codes pointing to phishing pages, malware, fraudulent UPI/payment requests, or illegal content.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            3. Print Verification & Scannability
          </h2>
          <p>
            While our rendering engine uses high error-correction levels (`H` by default) to ensure maximum scannability with custom logos and colors, you must always test your downloaded QR code with a smartphone camera before mass printing. QR Generato is not liable for printing costs resulting from low-contrast color choices or damaged destination links.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            4. Trademarks & Uploaded Logos
          </h2>
          <p>
            Any third-party brand icons or custom logos added to a QR code remain the property of their respective owners. You are responsible for ensuring you have the right to display any logo or artwork you embed.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Static QR codes generated here never expire and have no scan limits.</span>
        </div>
      </div>
    </main>
  );
}