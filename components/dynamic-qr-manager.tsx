// components/dynamic-qr-manager.tsx — lists the dynamic QR codes saved in this browser,
// shows scan counts and lets the owner change each destination.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, Check, Copy, ExternalLink, Loader2, Plus, RefreshCw, Repeat, Trash2 } from 'lucide-react';
import {
  fetchDynamicLink,
  forgetLink,
  loadOwnedLinks,
  manageUrl,
  normalizeForCompare,
  updateDynamicLink,
  type OwnedLink,
} from '@/lib/dynamic-client';

function formatDate(ms: number | null) {
  return ms ? new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';
}

function LinkRow({ link, onChange, onForget }: { link: OwnedLink; onChange: (l: OwnedLink) => void; onForget: () => void }) {
  const [target, setTarget] = useState(link.target);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'short' | 'edit' | null>(null);

  const changed = normalizeForCompare(target) !== normalizeForCompare(link.target);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const next = await updateDynamicLink(link, target);
      setTarget(next.target);
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (kind: 'short' | 'edit') => {
    try {
      await navigator.clipboard.writeText(kind === 'short' ? link.shortUrl : manageUrl(link));
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('Could not copy to the clipboard.');
    }
  };

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-[#111116] p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <a href={link.shortUrl} target="_blank" rel="noreferrer" className="font-mono text-sm font-bold text-fuchsia-300 hover:underline break-all">
            {link.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          <p className="text-[11px] text-zinc-500 mt-0.5">Created {formatDate(link.createdAt)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-2xl font-extrabold text-white tabular-nums">
            <BarChart3 size={18} className="text-fuchsia-400" /> {link.scans}
          </div>
          <p className="text-[11px] text-zinc-500">Last scan: {formatDate(link.lastScanAt)}</p>
        </div>
      </div>

      <div>
        <label htmlFor={`target-${link.code}`} className="block text-xs font-semibold text-zinc-300 mb-1.5">
          Destination
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id={`target-${link.code}`}
            type="url"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 min-w-0 rounded-xl border border-zinc-700/90 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-fuchsia-500"
          />
          <button
            type="button"
            onClick={save}
            disabled={!changed || busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <button type="button" onClick={() => copy('short')} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-zinc-100">
          {copied === 'short' ? <Check size={13} /> : <Copy size={13} />} Copy QR link
        </button>
        <button type="button" onClick={() => copy('edit')} className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-zinc-100">
          {copied === 'edit' ? <Check size={13} /> : <Copy size={13} />} Copy edit link
        </button>
        <a href={link.target} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-zinc-100">
          <ExternalLink size={13} /> Open destination
        </a>
        <button
          type="button"
          onClick={() => {
            if (confirm('Remove this code from this browser? The QR keeps working, but you can only edit it again with its edit link.')) onForget();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-400 hover:text-rose-400"
        >
          <Trash2 size={13} /> Forget
        </button>
      </div>

      {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}
    </li>
  );
}

export default function DynamicQrManager() {
  const [links, setLinks] = useState<OwnedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const saved = loadOwnedLinks();
    const results = await Promise.allSettled(saved.map((l) => fetchDynamicLink(l)));
    setLinks(results.map((r, i) => (r.status === 'fulfilled' ? r.value : saved[i])));
    setLoading(false);
  }, []);

  useEffect(() => {
    // An edit link (#code=…&key=…) imports a code from another device. The key stays in the hash,
    // so it never reaches server logs; we clear it from the address bar once read.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = hash.get('code');
    const key = hash.get('key');
    const run = async () => {
      if (code && key) {
        history.replaceState(null, '', window.location.pathname);
        try {
          await fetchDynamicLink({ code, token: key });
          setNotice('Code added. You can edit it from this browser now.');
        } catch {
          setNotice('That edit link is not valid.');
        }
      }
      await refresh();
    };
    void run();
  }, [refresh]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <header className="space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-bold text-fuchsia-300">
          <Repeat size={12} /> Dynamic QR codes
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Your dynamic QR codes</h1>
        <p className="text-sm text-zinc-400 max-w-xl">
          Change where a printed QR code goes and see how many times it was scanned. Codes are saved in this
          browser. Use an edit link to manage a code on another device.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white">
            <Plus size={14} /> Create a dynamic QR
          </Link>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-100 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh scans
          </button>
        </div>
        {notice && <p className="text-xs font-semibold text-emerald-400">{notice}</p>}
      </header>

      {loading && links.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 size={16} className="animate-spin" /> Loading your codes…
        </div>
      ) : links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.12] p-8 text-center space-y-2">
          <p className="text-sm font-bold text-white">No dynamic codes in this browser yet</p>
          <p className="text-xs text-zinc-400">
            In the generator, pick <strong>URL / Web</strong> and turn on <strong>Dynamic QR</strong>.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {links.map((link) => (
            <LinkRow
              key={link.code}
              link={link}
              onChange={(next) => setLinks((all) => all.map((l) => (l.code === next.code ? next : l)))}
              onForget={() => {
                forgetLink(link.code);
                setLinks((all) => all.filter((l) => l.code !== link.code));
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
