// app/global-error.tsx
'use client';

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070b] text-zinc-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-[#12121c] border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertOctagon size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
              System Error 500
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Critical Application Error
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              QR GENERATO encountered a critical layout error. Click below to reinitialize the application.
            </p>
            {error?.digest && (
              <p className="text-[11px] font-mono text-zinc-500 pt-1">
                ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={15} /> Try Again
            </button>
            <a
              href="/"
              className="px-5 py-3 rounded-xl bg-white/10 text-zinc-200 font-bold text-xs flex items-center justify-center"
            >
              Hard Refresh Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

