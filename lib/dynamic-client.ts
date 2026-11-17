// lib/dynamic-client.ts — browser-side helpers for dynamic QR codes.
// Edit keys are kept in this browser's localStorage. A "manage link" carries the key in the
// URL hash (never sent to the server) so the owner can open their code on another device.

export interface OwnedLink {
  code: string;
  token: string;
  shortUrl: string;
  target: string;
  scans: number;
  lastScanAt: number | null;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'qr-dynamic-links';

export function loadOwnedLinks(): OwnedLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as OwnedLink[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeOwnedLinks(list: OwnedLink[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Private mode / storage blocked: the code still works, it just isn't remembered here.
  }
}

export function rememberLink(link: OwnedLink) {
  writeOwnedLinks([link, ...loadOwnedLinks().filter((l) => l.code !== link.code)]);
}

export function forgetLink(code: string) {
  writeOwnedLinks(loadOwnedLinks().filter((l) => l.code !== code));
}

export function manageUrl(link: Pick<OwnedLink, 'code' | 'token'>) {
  return `${window.location.origin}/dynamic-qr#code=${link.code}&key=${link.token}`;
}

/** Mirrors the server's URL normalisation so "example.com" and "https://example.com/" compare equal. */
export function normalizeForCompare(input: string) {
  const value = input.trim();
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return value;
  }
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function createDynamicLink(target: string): Promise<OwnedLink> {
  const link = await call<OwnedLink>('/api/links', { method: 'POST', body: JSON.stringify({ target }) });
  rememberLink(link);
  return link;
}

type ServerView = Omit<OwnedLink, 'token' | 'shortUrl'>;

function merge(prev: Pick<OwnedLink, 'code' | 'token'>, view: ServerView): OwnedLink {
  const link = { ...view, token: prev.token, shortUrl: `${window.location.origin}/r/${prev.code}` };
  rememberLink(link);
  return link;
}

export async function fetchDynamicLink(prev: Pick<OwnedLink, 'code' | 'token'>): Promise<OwnedLink> {
  const view = await call<ServerView>(`/api/links/${prev.code}`, { method: 'GET', headers: { 'X-Edit-Token': prev.token } });
  return merge(prev, view);
}

export async function updateDynamicLink(prev: Pick<OwnedLink, 'code' | 'token'>, target: string): Promise<OwnedLink> {
  const view = await call<ServerView>(`/api/links/${prev.code}`, {
    method: 'PATCH',
    headers: { 'X-Edit-Token': prev.token },
    body: JSON.stringify({ target }),
  });
  return merge(prev, view);
}
