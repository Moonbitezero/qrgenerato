// lib/file-client.ts — browser client for file QR codes (PDF / audio / image uploads) on the shared
// QR Generato server (q.qrgenerato.com, see qr-generato-mobile/dynamic-server/src/files.ts).
// Like dynamic links, there are no accounts: each upload returns a secret edit key kept in this browser.

import { DYNAMIC_SERVER } from '@/lib/dynamic-client';

export type FileKind = 'pdf' | 'audio' | 'image';

export interface FileStats {
  last7: { day: string; n: number }[];
  countries: { country: string; n: number }[];
  devices: { device: string; n: number }[];
}

export interface UploadedFile {
  code: string;
  shortUrl: string;
  kind: FileKind;
  mime: string;
  size: number;
  name: string | null;
  title: string | null;
  active: boolean;
  hidden: boolean;
  scans: number;
  createdAt: number;
  updatedAt: number;
  lastScanAt: number | null;
  stats?: FileStats;
}

export interface OwnedFile extends UploadedFile {
  token: string;
}

const KEY = 'qrg.files.v1';
export const FILES_CHANGED_EVENT = 'qrg-files-changed';
const MB = 1024 * 1024;

/** What each QR type accepts (checked again on the server from the file's own bytes). */
export const FILE_RULES: Record<FileKind, { accept: string; max: number; label: string; exts: RegExp }> = {
  pdf: { accept: 'application/pdf,.pdf', max: 20 * MB, label: 'PDF', exts: /\.pdf$/i },
  audio: { accept: 'audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a', max: 20 * MB, label: 'MP3 or M4A audio', exts: /\.(mp3|m4a)$/i },
  image: { accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp', max: 10 * MB, label: 'JPG, PNG or WebP image', exts: /\.(jpe?g|png|webp)$/i },
};

export const humanSize = (n: number) => (n >= MB ? `${(n / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Quick check before uploading, so people don't wait for a server rejection. */
export function precheck(file: File, kind: FileKind): string | null {
  const rule = FILE_RULES[kind];
  const okType = rule.exts.test(file.name) || rule.accept.split(',').includes(file.type);
  if (!okType) return `Please choose a ${rule.label} file.`;
  if (file.size > rule.max) return `That file is ${humanSize(file.size)}. The limit is ${rule.max / MB} MB.`;
  if (!file.size) return 'That file is empty.';
  return null;
}

export function loadOwnedFiles(): OwnedFile[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list: OwnedFile[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage blocked: the QR still works, it just isn't remembered here
  }
  window.dispatchEvent(new Event(FILES_CHANGED_EVENT));
}

function upsert(f: OwnedFile) {
  save([f, ...loadOwnedFiles().filter((x) => x.code !== f.code)]);
}

export function forgetFile(code: string) {
  save(loadOwnedFiles().filter((x) => x.code !== code));
}

export function fileManageUrl(f: Pick<OwnedFile, 'code' | 'token'>) {
  return `${window.location.origin}/my-codes#file=${f.code}&key=${f.token}`;
}

/** Sends a file with upload progress (fetch can't report upload progress, XHR can). */
function send<T>(method: 'POST' | 'PUT', path: string, file: File, opts: { title?: string; token?: string; onProgress?: (pct: number) => void }): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${DYNAMIC_SERVER}${path}`);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
    if (opts.title) xhr.setRequestHeader('X-Title', opts.title.replace(/[\r\n]/g, ' ').slice(0, 80));
    if (opts.token) xhr.setRequestHeader('Authorization', `Bearer ${opts.token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: (T & { error?: string }) | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON error page
      }
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else reject(new Error(data?.error || `Upload failed (error ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check your internet connection and try again.'));
    xhr.send(file);
  });
}

export async function uploadFile(file: File, opts: { title?: string; onProgress?: (pct: number) => void } = {}): Promise<OwnedFile> {
  const f = await send<OwnedFile>('POST', '/api/files', file, opts);
  upsert(f);
  return f;
}

export async function replaceFile(owned: Pick<OwnedFile, 'code' | 'token'>, file: File, onProgress?: (pct: number) => void): Promise<OwnedFile> {
  const f = await send<UploadedFile>('PUT', `/api/files/${owned.code}`, file, { token: owned.token, onProgress });
  const merged = { ...f, token: owned.token };
  upsert(merged);
  return merged;
}

async function call<T>(path: string, init: RequestInit, token: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${DYNAMIC_SERVER}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } });
  } catch {
    throw new Error('Can’t reach the server. Check your internet connection.');
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  return data;
}

export async function fetchFile(owned: Pick<OwnedFile, 'code' | 'token'>): Promise<OwnedFile> {
  const f = await call<UploadedFile>(`/api/files/${owned.code}`, { method: 'GET' }, owned.token);
  const merged = { ...f, token: owned.token };
  upsert(merged);
  return merged;
}

export async function updateFile(owned: Pick<OwnedFile, 'code' | 'token'>, patch: { title?: string; active?: boolean }): Promise<OwnedFile> {
  const f = await call<UploadedFile>(`/api/files/${owned.code}`, { method: 'PATCH', body: JSON.stringify(patch) }, owned.token);
  const merged = { ...f, token: owned.token };
  upsert(merged);
  return merged;
}

export async function deleteFile(owned: Pick<OwnedFile, 'code' | 'token'>) {
  await call(`/api/files/${owned.code}`, { method: 'DELETE' }, owned.token);
  forgetFile(owned.code);
}
