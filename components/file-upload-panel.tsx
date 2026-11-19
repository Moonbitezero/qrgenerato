// components/file-upload-panel.tsx — under the PDF / Audio / Image types: upload a file instead of
// pasting a link. The QR then holds a short q.qrgenerato.com/f/<code> link to a viewer/player page,
// and the file can be replaced later without reprinting.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Check, Copy, FileUp, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { FILES_CHANGED_EVENT, FILE_RULES, fileManageUrl, humanSize, loadOwnedFiles, precheck, replaceFile, uploadFile, type FileKind, type OwnedFile } from '@/lib/file-client';

interface Props {
  kind: FileKind;
  isDark: boolean;
  /** The uploaded file the QR currently uses (kept by the studio, so switching types doesn't lose it). */
  value: OwnedFile | null;
  /** New/replaced file, or null to go back to the link field. */
  onChange: (file: OwnedFile | null) => void;
}

const NOUN: Record<FileKind, string> = { pdf: 'a PDF', audio: 'an audio file', image: 'an image' };

export default function FileUploadPanel({ kind, isDark, value, onChange }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pickRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  // A file uploaded for another type (e.g. a PDF, then switching to Image) doesn't apply here.
  const current = value && value.kind === kind ? value : null;
  // Earlier uploads of this kind saved in this browser, for one-tap reuse.
  const [mine, setMine] = useState<OwnedFile[]>([]);
  useEffect(() => {
    const sync = () => setMine(loadOwnedFiles().filter((f) => f.kind === kind && !f.hidden));
    sync();
    window.addEventListener(FILES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FILES_CHANGED_EVENT, sync);
  }, [kind]);

  const start = async (f: File, mode: 'new' | 'replace') => {
    const problem = precheck(f, kind);
    if (problem) return setError(problem);
    setError('');
    setProgress(0);
    try {
      const done = mode === 'replace' && current ? await replaceFile(current, f, setProgress) : await uploadFile(f, { onProgress: setProgress });
      onChange(done);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setProgress(null);
    }
  };

  const copyEdit = async () => {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(fileManageUrl(current));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Could not copy. Open “Manage files” to see the link.');
    }
  };

  const muted = isDark ? 'text-zinc-400' : 'text-slate-500';
  const btn = clsx(
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60',
    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
  );
  const rule = FILE_RULES[kind];

  return (
    <div className={clsx('mt-2.5 rounded-xl border p-3 space-y-2.5', current ? (isDark ? 'border-fuchsia-500/40 bg-fuchsia-500/[0.06]' : 'border-fuchsia-300 bg-fuchsia-50') : isDark ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-slate-50')}>
      {!current ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void start(f, 'new');
          }}
          className={clsx('rounded-lg border-2 border-dashed p-3 text-center transition-colors', dragging ? 'border-fuchsia-500 bg-fuchsia-500/10' : isDark ? 'border-zinc-700' : 'border-slate-300')}
        >
          {progress === null ? (
            <>
              <button
                type="button"
                onClick={() => pickRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 px-4 py-2.5 text-xs font-bold text-white"
              >
                <Upload size={14} /> Upload {NOUN[kind]} instead of a link
              </button>
              <p className={clsx('mt-1.5 text-[11px]', muted)}>
                {rule.label}, up to {rule.max / (1024 * 1024)} MB. Or drag it here. The QR opens a page with {kind === 'pdf' ? 'a PDF viewer' : kind === 'audio' ? 'an audio player' : 'your image'} and a download button.
              </p>
              <p className={clsx('mt-0.5 text-[10.5px]', muted)}>Free: 8 uploads a day, up to 15 files (100 MB) at a time.</p>
            </>
          ) : (
            <div className="space-y-1.5" role="status" aria-live="polite">
              <p className="flex items-center justify-center gap-2 text-xs font-bold">
                <Loader2 size={14} className="animate-spin" /> Uploading… {progress}%
              </p>
              <div className={clsx('h-1.5 rounded-full overflow-hidden', isDark ? 'bg-zinc-800' : 'bg-slate-200')}>
                <div className="h-full bg-fuchsia-500 transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {mine.length > 0 && progress === null && (
            <div className="mt-3 text-left">
              <p className={clsx('text-[10.5px] font-bold uppercase tracking-wider mb-1.5', muted)}>Or use one of your files</p>
              <div className="flex flex-col gap-1.5">
                {mine.slice(0, 4).map((f) => (
                  <button
                    key={f.code}
                    type="button"
                    onClick={() => onChange(f)}
                    className={clsx('flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs text-left transition-colors', isDark ? 'border-zinc-700 hover:border-fuchsia-500' : 'border-slate-300 hover:border-fuchsia-500')}
                  >
                    <span className="truncate font-semibold">{f.title || f.name || 'Uploaded file'}</span>
                    <span className={clsx('shrink-0', muted)}>{humanSize(f.size)} · {f.scans} scans</span>
                  </button>
                ))}
              </div>
              {mine.length > 4 && (
                <Link href="/my-codes#my-files" className="mt-1.5 inline-block text-[11px] font-semibold text-fuchsia-500 hover:underline">
                  See all {mine.length} files
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className={clsx('rounded-lg px-3 py-2 text-[11px] leading-relaxed', isDark ? 'bg-zinc-950/70' : 'bg-white border border-slate-200')}>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <FileUp size={13} className="text-fuchsia-500" /> {current.name || 'Uploaded file'} <span className={clsx('font-normal', muted)}>· {humanSize(current.size)}</span>
            </div>
            <div>
              <span className={muted}>QR opens </span>
              <a href={current.shortUrl} target="_blank" rel="noreferrer" className="font-mono font-semibold break-all hover:underline">
                {current.shortUrl}
              </a>
            </div>
          </div>
          {progress !== null && (
            <p className="flex items-center gap-2 text-xs font-bold" role="status">
              <Loader2 size={14} className="animate-spin" /> Replacing… {progress}%
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button type="button" onClick={() => replaceRef.current?.click()} disabled={progress !== null} className={btn}>
              <RefreshCw size={13} /> Replace file
            </button>
            <button type="button" onClick={copyEdit} className={btn}>
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy edit link'}
            </button>
            <Link href="/my-codes#my-files" className={btn}>
              <FileUp size={13} /> Manage files
            </Link>
            <button
              type="button"
              onClick={() => {
                onChange(null);
              }}
              className={btn}
            >
              <X size={13} /> Use a link
            </button>
          </div>
          <p className={clsx('text-[10.5px] leading-snug', muted)}>
            Replacing keeps the same QR. Files nobody scans for 6 months are deleted. Keep the edit link safe: anyone with it can change this file.
          </p>
        </div>
      )}

      {error && <p className="text-[11px] font-semibold text-rose-500">{error}</p>}

      <input
        ref={pickRef}
        type="file"
        accept={rule.accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void start(f, 'new');
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept={rule.accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void start(f, 'replace');
        }}
      />
    </div>
  );
}
