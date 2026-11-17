// lib/dynamic-links.ts
// Server-side storage for dynamic QR codes. A dynamic QR encodes a short link
// (https://qrgenerato.com/r/<code>) whose destination can be changed later.
//
// Production: Cloudflare KV namespace bound as QR_LINKS (Pages > Settings > Bindings).
// Local `next dev`: a local KV simulated by wrangler (wrangler.dev.toml, wired up in next.config.ts).

import { getRequestContext } from '@cloudflare/next-on-pages';

export interface DynamicLink {
  target: string;
  /** SHA-256 of the edit token. The raw token is only ever held by the creator's browser. */
  tokenHash: string;
  createdAt: number;
  updatedAt: number;
  scans: number;
  lastScanAt: number | null;
}

interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

function getStore(): KVLike {
  let env: { QR_LINKS?: KVLike } = {};
  try {
    env = getRequestContext().env as typeof env;
  } catch {
    // Outside Cloudflare and without setupDevPlatform (see next.config.ts).
  }
  if (!env.QR_LINKS) {
    throw new Error('Dynamic QR storage is not configured: bind a KV namespace named QR_LINKS.');
  }
  return env.QR_LINKS;
}

/** Schedules work after the response is sent (Cloudflare), or just runs it (dev). */
export function runInBackground(p: Promise<unknown>) {
  try {
    getRequestContext().ctx.waitUntil(p);
  } catch {
    void p;
  }
}

const key = (code: string) => `link:${code}`;

export async function getLink(code: string): Promise<DynamicLink | null> {
  const raw = await getStore().get(key(code));
  return raw ? (JSON.parse(raw) as DynamicLink) : null;
}

export async function saveLink(code: string, link: DynamicLink) {
  await getStore().put(key(code), JSON.stringify(link));
}

// No look-alike characters (0/O, 1/l/I) so printed codes can be read aloud.
const ALPHABET = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

export function randomCode(length = 7) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export const CODE_PATTERN = /^[A-Za-z0-9]{4,16}$/;

/** Accepts only absolute http(s) URLs; adds https:// to bare domains. Returns null if invalid. */
export function normalizeTarget(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let value = input.trim();
  if (!value || value.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    // Don't let a dynamic code point at another dynamic code (redirect loops).
    if (/(^|\.)qrgenerato\.com$/i.test(url.hostname) && url.pathname.startsWith('/r/')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Public view of a link for its owner. */
export function toOwnerView(code: string, link: DynamicLink) {
  return {
    code,
    target: link.target,
    scans: link.scans,
    lastScanAt: link.lastScanAt,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}
