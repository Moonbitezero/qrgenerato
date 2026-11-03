// app/error.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('QR Generato Runtime Error:', error);
  }, [error]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <div className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-7">
        {/* Top Warning Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        {/* Icon Badge */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-[#0b0b12] border border-amber-500/40 flex items-center justify-center">
            <AlertTriangle size={38} className="text-amber-400" />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-amber-600 text-[11px] font-mono font-extrabold text-white shadow">
              500
            </span>
          </div>
        </div>

        <div className="space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
            <ShieldAlert size={13} /> Rendering Engine Interrupted
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Something Went Wrong in the Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            An unexpected error occurred while processing the current view. Your browser data remains safe and private. Click below to reset the studio component.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-zinc-500">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Recovery Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw size={16} /> Reload Studio View
          </button>

          <Link
            href="/"
            className="px-5 py-3.5 rounded-2xl bg-[#0b0b12] hover:bg-white/[0.06] border border-white/[0.1] text-zinc-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <Home size={16} className="text-violet-400" /> Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

