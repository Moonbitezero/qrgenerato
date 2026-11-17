// components/dynamic-qr-panel.tsx
// Sits under the URL field in the studio. When on, the QR encodes a short q.qrgenerato.com/<code> link
// whose destination (the URL field) can be changed later without reprinting.
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { BarChart3, Check, Copy, Loader2, RefreshCw, Repeat } from 'lucide-react';
import { createDynamicLink, manageUrl, normalizeForCompare, updateDynamicLink, type OwnedLink } from '@/lib/dynamic-client';

interface Props {
  isDark: boolean;
  /** The URL field's current value — used as the destination. */
  destination: string;
  /** Called with the short URL to encode, or null to go back to a static QR. */
  onEncodeUrl: (url: string | null) => void;
  /** Start with the switch on (the /dynamic-qr landing page). */
  defaultEnabled?: boolean;
}

export default function DynamicQrPanel({ isDark, destination, onEncodeUrl, defaultEnabled = false }: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [link, setLink] = useState<OwnedLink | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async (fn: () => Promise<OwnedLink>) => {
    setBusy(true);
    setError('');
    try {
      const next = await fn();
      setLink(next);
      onEncodeUrl(next.shortUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setError('');
    onEncodeUrl(next && link ? link.shortUrl : null);
  };

  const copyManage = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(manageUrl(link));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy. Open "Manage codes" to see the link.');
    }
  };

  const changed = link && normalizeForCompare(destination) !== normalizeForCompare(link.target);
  const muted = isDark ? 'text-zinc-400' : 'text-slate-500';
  const btn = clsx(
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60',
    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
  );
  const primary =
    'w-full inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-60';

  return (
    <div
      className={clsx(
        'mt-2.5 rounded-xl border p-3 space-y-2.5',
        enabled
          ? isDark ? 'border-fuchsia-500/40 bg-fuchsia-500/[0.06]' : 'border-fuchsia-300 bg-fuchsia-50'
          : isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50'
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby="dynamic-qr-label"
          onClick={toggle}
          className={clsx(
            'mt-0.5 relative h-5 w-9 shrink-0 rounded-full transition-colors',
            enabled ? 'bg-fuchsia-500' : isDark ? 'bg-zinc-700' : 'bg-slate-300'
          )}
        >
          <span className={clsx('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', enabled ? 'left-[18px]' : 'left-0.5')} />
        </button>
        <button type="button" onClick={toggle} className="min-w-0 text-left">
          <span id="dynamic-qr-label" className="flex items-center gap-1.5 text-xs font-bold">
            <Repeat size={13} className="text-fuchsia-500" /> Dynamic QR
          </span>
          <span className={clsx('block text-[11px] leading-snug', muted)}>
            Change where the code points after printing, and count scans. Free, no sign-up. Works with the QR Generato app.
          </span>
        </button>
      </div>

      {enabled && !link && (
        <button type="button" disabled={busy} onClick={() => run(() => createDynamicLink(destination))} className={primary}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Repeat size={14} />}
          Create dynamic link for this URL
        </button>
      )}

      {enabled && link && (
        <div className="space-y-2.5">
          <div className={clsx('rounded-lg px-3 py-2 text-[11px] leading-relaxed', isDark ? 'bg-zinc-950/70' : 'bg-white border border-slate-200')}>
            <div>
              <span className={muted}>QR encodes </span>
              <span className="font-mono font-semibold break-all">{link.shortUrl}</span>
            </div>
            <div>
              <span className={muted}>Opens </span>
              <span className="font-mono break-all">{link.target}</span>
            </div>
            <div className={clsx('flex items-center gap-1', muted)}>
              <BarChart3 size={12} /> {link.scans} scan{link.scans === 1 ? '' : 's'}
            </div>
          </div>

          {changed && (
            <button type="button" disabled={busy} onClick={() => run(() => updateDynamicLink(link, { target: destination }))} className={primary}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Point this QR to the new URL
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={copyManage} className={btn}>
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy edit link'}
            </button>
            <Link href="/dynamic-qr#my-codes" className={btn}>
              <BarChart3 size={13} /> Manage codes
            </Link>
          </div>
          <p className={clsx('text-[10.5px] leading-snug', muted)}>
            Keep the edit link safe: anyone with it can change this code. It&apos;s also saved in this browser.
          </p>
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
