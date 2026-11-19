// components/files-manager.tsx — "Your uploaded files" on /dynamic-qr: the PDF / audio / image QR codes
// saved in this browser. Rename, replace, pause, delete, and see scans.
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { BarChart3, Check, Copy, ExternalLink, FileUp, Loader2, Pause, Play, RefreshCw, Trash2 } from 'lucide-react';
import {
  FILES_CHANGED_EVENT,
  FILE_RULES,
  deleteFile,
  fetchFile,
  fileManageUrl,
  forgetFile,
  humanSize,
  loadOwnedFiles,
  precheck,
  replaceFile,
  updateFile,
  type OwnedFile,
} from '@/lib/file-client';

const KIND_LABEL = { pdf: 'PDF', audio: 'Audio', image: 'Image' } as const;
const chip = 'inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-zinc-100 disabled:opacity-50';

function Bars({ days }: { days: { day: string; n: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.n));
  return (
    <div className="flex items-end gap-1 h-12" role="img" aria-label={`Scans, last 7 days: ${days.map((d) => d.n).join(', ')}`}>
      {days.map((d) => (
        <div key={d.day} className="flex-1 rounded-t bg-fuchsia-500/80" style={{ height: `${Math.max(6, (d.n / max) * 100)}%` }} title={`${d.day}: ${d.n}`} />
      ))}
    </div>
  );
}

function FileRow({ file, onChange, onRemove }: { file: OwnedFile; onChange: (f: OwnedFile) => void; onRemove: () => void }) {
  const [title, setTitle] = useState(file.title ?? '');
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'link' | 'edit' | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  const act = async (name: string, fn: () => Promise<void>) => {
    setBusy(name);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(null);
      setProgress(null);
    }
  };

  const copy = async (what: 'link' | 'edit') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? file.shortUrl : fileManageUrl(file));
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('Could not copy to the clipboard.');
    }
  };

  return (
    <li className={clsx('rounded-2xl border bg-[#111116] p-4 space-y-3', file.hidden ? 'border-rose-500/40' : file.active ? 'border-white/[0.08]' : 'border-amber-500/30')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{file.title || file.name || 'Uploaded file'}</p>
          <p className="text-[11px] text-zinc-400">
            {KIND_LABEL[file.kind]} · {humanSize(file.size)}
            {file.name && file.title ? ` · ${file.name}` : ''}
          </p>
          <a href={file.shortUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-fuchsia-300 hover:underline break-all">
            {file.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          {file.hidden && <p className="text-[11px] font-bold text-rose-400 mt-1">Hidden after reports from visitors</p>}
          {!file.active && !file.hidden && <p className="text-[11px] font-bold text-amber-300 mt-1">Paused</p>}
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-2xl font-extrabold text-white tabular-nums">
            <BarChart3 size={18} className="text-fuchsia-400" /> {file.scans}
          </div>
          <p className="text-[11px] text-zinc-500">scans</p>
        </div>
      </div>

      {file.stats && <Bars days={file.stats.last7} />}

      <div className="flex gap-2">
        <label htmlFor={`ftitle-${file.code}`} className="sr-only">Name</label>
        <input
          id={`ftitle-${file.code}`}
          value={title}
          maxLength={80}
          placeholder="Name shown on the scan page"
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-0 rounded-xl border border-zinc-700/90 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-fuchsia-500"
        />
        <button
          type="button"
          disabled={title.trim() === (file.title ?? '') || !!busy}
          onClick={() => act('title', async () => onChange(await updateFile(file, { title: title.trim() })))}
          className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          {busy === 'title' ? <Loader2 size={13} className="animate-spin" /> : 'Save'}
        </button>
      </div>

      {progress !== null && <p className="text-xs font-bold text-zinc-300">Replacing… {progress}%</p>}

      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <a href={file.shortUrl} target="_blank" rel="noreferrer" className={chip}>
          <ExternalLink size={13} /> Open
        </a>
        <button type="button" onClick={() => copy('link')} className={chip}>
          {copied === 'link' ? <Check size={13} /> : <Copy size={13} />} Copy QR link
        </button>
        <button type="button" onClick={() => copy('edit')} className={chip}>
          {copied === 'edit' ? <Check size={13} /> : <Copy size={13} />} Copy edit link
        </button>
        <button type="button" onClick={() => replaceRef.current?.click()} disabled={!!busy} className={chip}>
          {busy === 'replace' ? <Loader2 size={13} className="animate-spin" /> : <FileUp size={13} />} Replace file
        </button>
        <button type="button" onClick={() => act('pause', async () => onChange(await updateFile(file, { active: !file.active })))} disabled={!!busy} className={chip}>
          {busy === 'pause' ? <Loader2 size={13} className="animate-spin" /> : file.active ? <Pause size={13} /> : <Play size={13} />} {file.active ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => {
            if (!confirm('Delete this file permanently? Its QR code will show “File not found”. This can’t be undone.')) return;
            void act('delete', async () => {
              await deleteFile(file);
              onRemove();
            });
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-400 hover:text-rose-400 disabled:opacity-50"
        >
          {busy === 'delete' ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
        </button>
      </div>
      {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}

      <input
        ref={replaceRef}
        type="file"
        accept={FILE_RULES[file.kind].accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          // A replacement may be any allowed type of the same kind (e.g. a new PDF for a PDF code).
          const problem = precheck(f, file.kind);
          if (problem) return setError(problem);
          void act('replace', async () => onChange(await replaceFile(file, f, setProgress)));
        }}
      />
    </li>
  );
}

/** `alwaysShow`: on the My QR Codes page the section stays visible (with a message) even when empty. */
export default function FilesManager({ alwaysShow = false }: { alwaysShow?: boolean } = {}) {
  const [files, setFiles] = useState<OwnedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const saved = loadOwnedFiles();
    const results = await Promise.allSettled(saved.map((f) => fetchFile(f)));
    const next: OwnedFile[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') next.push(r.value);
      else if (/not found/i.test(String(r.reason?.message))) forgetFile(saved[i].code); // deleted elsewhere
      else next.push(saved[i]);
    });
    setFiles(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Edit link from another device: /my-codes#file=<code>&key=<token> (older links use /dynamic-qr)
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = hash.get('file');
    const key = hash.get('key');
    const run = async () => {
      if (code && key) {
        history.replaceState(null, '', `${window.location.pathname}#my-files`);
        try {
          await fetchFile({ code, token: key });
          setNotice('File added. You can manage it from this browser now.');
        } catch {
          setNotice('That edit link is not valid.');
        }
      }
      await refresh();
    };
    void run();
  }, [refresh]);

  useEffect(() => {
    const sync = () => setFiles(loadOwnedFiles());
    window.addEventListener(FILES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FILES_CHANGED_EVENT, sync);
  }, []);

  if (!alwaysShow && !loading && files.length === 0 && !notice) return null;

  return (
    <section id="my-files" aria-labelledby="my-files-title" className="max-w-7xl mx-auto px-4 pt-2 pb-6 scroll-mt-[calc(var(--header-h)+12px)]">
      <div className="rounded-2xl border border-zinc-800/90 bg-[#0c0c11] p-4 sm:p-6 space-y-4 text-zinc-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="my-files-title" className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <FileUp size={18} className="text-fuchsia-400" /> Your uploaded files
            </h2>
            <p className="text-xs text-zinc-400">PDF, audio and image QR codes saved in this browser. Files nobody scans for 6 months are deleted.</p>
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
        {loading && files.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" /> Loading your files…
          </p>
        ) : files.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/[0.12] p-5 text-center text-xs text-zinc-400">
            No uploaded files in this browser yet. In the generator, choose <strong className="text-zinc-200">PDF</strong>, <strong className="text-zinc-200">Audio</strong> or <strong className="text-zinc-200">Image</strong> and upload a file.
          </p>
        ) : (
          <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {files.map((f) => (
              <FileRow
                key={f.code}
                file={f}
                onChange={(next) => setFiles((all) => all.map((x) => (x.code === next.code ? next : x)))}
                onRemove={() => setFiles((all) => all.filter((x) => x.code !== f.code))}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
