// components/dynamic-qr-manager.tsx — "Your dynamic QR codes" section under the studio on /dynamic-qr.
// Uses the same server as the Play Store app (q.qrgenerato.com): change destinations, rename,
// pause/resume, delete, and see scans for the last 7 days with top countries and devices.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { BarChart3, Check, Copy, ExternalLink, Loader2, Pause, Play, RefreshCw, Repeat, Trash2 } from 'lucide-react';
import {
  deleteDynamicLink,
  fetchDynamicLink,
  forgetLink,
  LINKS_CHANGED_EVENT,
  loadOwnedLinks,
  manageUrl,
  normalizeForCompare,
  updateDynamicLink,
  type OwnedLink,
} from '@/lib/dynamic-client';

function formatDate(ms: number | null | undefined) {
  return ms ? new Date(ms).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '';
}

const chip = 'inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-zinc-100 disabled:opacity-50';
const field =
  'w-full min-w-0 rounded-xl border border-zinc-700/90 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-fuchsia-500';

function Last7({ days }: { days: { day: string; n: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.n));
  return (
    <div className="flex items-end gap-1.5 h-20" role="img" aria-label={`Scans, last 7 days: ${days.map((d) => d.n).join(', ')}`}>
      {days.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <span className="text-[10px] text-zinc-400 tabular-nums">{d.n || ''}</span>
          <div className="w-full rounded-t bg-fuchsia-500/80" style={{ height: `${Math.max(4, (d.n / max) * 100)}%` }} />
          <span className="text-[10px] text-zinc-500">{new Date(d.day + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'narrow', timeZone: 'UTC' })}</span>
        </div>
      ))}
    </div>
  );
}

function LinkRow({ link, onChange, onRemove }: { link: OwnedLink; onChange: (l: OwnedLink) => void; onRemove: () => void }) {
  const [target, setTarget] = useState(link.target);
  const [title, setTitle] = useState(link.title ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'short' | 'edit' | null>(null);

  const changed = normalizeForCompare(target) !== normalizeForCompare(link.target) || title.trim() !== (link.title ?? '');

  const act = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const save = () =>
    act('save', async () => {
      const next = await updateDynamicLink(link, { target, title: title.trim() });
      setTarget(next.target);
      setTitle(next.title ?? '');
      onChange(next);
    });

  const togglePause = () => act('pause', async () => onChange(await updateDynamicLink(link, { active: !link.active })));

  const remove = () => {
    if (!confirm('Delete this QR code permanently? Anyone who scans it will see "not found". This can’t be undone.')) return;
    void act('delete', async () => {
      await deleteDynamicLink(link);
      onRemove();
    });
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

  const stats = link.stats;

  return (
    <li className={clsx('rounded-2xl border bg-[#111116] p-4 sm:p-5 space-y-4', link.active ? 'border-white/[0.08]' : 'border-amber-500/30')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{link.title || 'Untitled QR'}</p>
          <a href={link.shortUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-fuchsia-300 hover:underline break-all">
            {link.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Created {formatDate(link.createdAt)}
            {!link.active && <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-bold text-amber-300">Paused</span>}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-2xl font-extrabold text-white tabular-nums">
            <BarChart3 size={18} className="text-fuchsia-400" /> {link.scans}
          </div>
          <p className="text-[11px] text-zinc-500">total scans</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-4 rounded-xl bg-zinc-950/60 p-3">
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 mb-1">Last 7 days</p>
            <Last7 days={stats.last7} />
          </div>
          <div className="text-xs">
            <p className="text-[11px] font-semibold text-zinc-400 mb-1">Top countries</p>
            {stats.countries.length ? (
              stats.countries.map((c) => (
                <div key={c.country || '?'} className="flex justify-between text-zinc-300">
                  <span>{c.country || 'Unknown'}</span>
                  <span className="tabular-nums">{c.n}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No scans yet</p>
            )}
          </div>
          <div className="text-xs">
            <p className="text-[11px] font-semibold text-zinc-400 mb-1">Devices</p>
            {stats.devices.length ? (
              stats.devices.map((d) => (
                <div key={d.device || '?'} className="flex justify-between text-zinc-300">
                  <span>{d.device || 'Other'}</span>
                  <span className="tabular-nums">{d.n}</span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No scans yet</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2">
        <div>
          <label htmlFor={`title-${link.code}`} className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Name
          </label>
          <input id={`title-${link.code}`} value={title} maxLength={80} placeholder="e.g. Cafe menu" onChange={(e) => setTitle(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor={`target-${link.code}`} className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Destination
          </label>
          <input id={`target-${link.code}`} type="url" value={target} onChange={(e) => setTarget(e.target.value)} className={field} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={save}
          disabled={!changed || !!busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2 text-white disabled:opacity-40"
        >
          {busy === 'save' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
        </button>
        <button type="button" onClick={() => copy('short')} className={chip}>
          {copied === 'short' ? <Check size={13} /> : <Copy size={13} />} Copy QR link
        </button>
        <button type="button" onClick={() => copy('edit')} className={chip}>
          {copied === 'edit' ? <Check size={13} /> : <Copy size={13} />} Copy edit link
        </button>
        <a href={link.target} target="_blank" rel="noreferrer" className={chip}>
          <ExternalLink size={13} /> Open destination
        </a>
        <button type="button" onClick={togglePause} disabled={!!busy} className={chip}>
          {busy === 'pause' ? <Loader2 size={13} className="animate-spin" /> : link.active ? <Pause size={13} /> : <Play size={13} />}
          {link.active ? 'Pause' : 'Resume'}
        </button>
        <button type="button" onClick={remove} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-400 hover:text-rose-400 disabled:opacity-50">
          {busy === 'delete' ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
        </button>
      </div>

      {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}
    </li>
  );
}

/** `alwaysShow`: on the My QR Codes page the section stays visible (with a message) even when empty. */
export default function DynamicQrManager({ alwaysShow = false }: { alwaysShow?: boolean } = {}) {
  const [links, setLinks] = useState<OwnedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const saved = loadOwnedLinks();
    const results = await Promise.allSettled(saved.map((l) => fetchDynamicLink(l)));
    const next: OwnedLink[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') next.push(r.value);
      // Deleted elsewhere (e.g. in the app): drop it from this browser too.
      else if (/not found/i.test(String(r.reason?.message))) forgetLink(saved[i].code);
      else next.push(saved[i]);
    });
    setLinks(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    // An edit link (#code=…&key=…) adds a code from another device. The key stays in the hash,
    // so it never reaches server logs; it is cleared from the address bar once read.
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

  // A code created in the studio above (or deleted in another row) updates this list without a reload.
  useEffect(() => {
    const sync = () => setLinks(loadOwnedLinks());
    window.addEventListener(LINKS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(LINKS_CHANGED_EVENT, sync);
  }, []);

  // Shown under the studio on /dynamic-qr; stays out of the way until the visitor has a code.
  if (!alwaysShow && !loading && links.length === 0 && !notice) return null;

  return (
    <section id="my-codes" aria-labelledby="my-codes-title" className="max-w-7xl mx-auto px-4 pt-2 pb-6 scroll-mt-[calc(var(--header-h)+12px)]">
      <div className="rounded-2xl border border-zinc-800/90 bg-[#0c0c11] p-4 sm:p-6 space-y-4 text-zinc-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="my-codes-title" className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <Repeat size={18} className="text-fuchsia-400" /> Your dynamic QR codes
            </h2>
            <p className="text-xs text-zinc-400">
              Saved in this browser. Change destinations, pause codes and see scans. Use an edit link to manage a code on another device.
            </p>
          </div>
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

        {loading && links.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" /> Loading your codes…
          </div>
        ) : links.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/[0.12] p-5 text-center text-xs text-zinc-400">
            No dynamic QR codes in this browser yet. In the generator, choose <strong className="text-zinc-200">URL / Web</strong> and turn on <strong className="text-zinc-200">Dynamic QR</strong>.
          </p>
        ) : (
          <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {links.map((link) => (
              <LinkRow
                key={link.code}
                link={link}
                onChange={(next) => setLinks((all) => all.map((l) => (l.code === next.code ? next : l)))}
                onRemove={() => setLinks((all) => all.filter((l) => l.code !== link.code))}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
