// lib/dynamic-client.ts — browser client for the dynamic QR server shared with the Play Store app
// (Cloudflare Worker + D1 in qr-generato-mobile/dynamic-server, live at q.qrgenerato.com).
//
// Kept compatible with the app's components/qr-studio/dynamic.ts: same server, same API,
// same localStorage key and record shape. Edit keys never leave the creator's device except
// in an "edit link", which carries the key in the URL hash (not sent to any server).

export interface DynamicStats {
  last7: { day: string; n: number }[];
  countries: { country: string; n: number }[];
  devices: { device: string; n: number }[];
}

export interface DynamicLink {
  code: string;
  shortUrl: string;
  target: string;
  title: string | null;
  active: boolean;
  scans: number;
  createdAt: number;
  updatedAt: number;
  stats?: DynamicStats;
}

/** What this browser keeps: the link plus its secret edit key. */
export interface OwnedLink extends DynamicLink {
  token: string;
}

export const DYNAMIC_SERVER = (process.env.NEXT_PUBLIC_DYNAMIC_API || 'https://q.qrgenerato.com').replace(/\/+$/, '');

const LINKS_KEY = 'qrg.dynamic.links.v1';

export function loadOwnedLinks(): OwnedLink[] {
  try {
    const list = JSON.parse(localStorage.getItem(LINKS_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveOwnedLinks(list: OwnedLink[]) {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(list));
  } catch {
    // Private mode / storage blocked: the code still works, it just isn't remembered here.
  }
}

function upsertOwned(link: OwnedLink) {
  saveOwnedLinks([link, ...loadOwnedLinks().filter((l) => l.code !== link.code)]);
}

export function forgetLink(code: string) {
  saveOwnedLinks(loadOwnedLinks().filter((l) => l.code !== code));
}

/** Opens this code's management page on any device (website). */
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

async function call<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${DYNAMIC_SERVER}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error('Can’t reach the dynamic QR server. Check your internet connection.');
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  return data;
}

export async function createDynamicLink(target: string, title = ''): Promise<OwnedLink> {
  const link = await call<OwnedLink>('/api/links', { method: 'POST', body: JSON.stringify({ target, title }) });
  upsertOwned(link);
  return link;
}

function merge(owned: Pick<OwnedLink, 'code' | 'token'>, link: DynamicLink): OwnedLink {
  const prev = loadOwnedLinks().find((l) => l.code === owned.code);
  const merged = { ...prev, ...link, token: owned.token };
  upsertOwned(merged);
  return merged;
}

export async function fetchDynamicLink(owned: Pick<OwnedLink, 'code' | 'token'>): Promise<OwnedLink> {
  return merge(owned, await call<DynamicLink>(`/api/links/${owned.code}`, { method: 'GET' }, owned.token));
}

export async function updateDynamicLink(
  owned: Pick<OwnedLink, 'code' | 'token'>,
  patch: { target?: string; title?: string; active?: boolean }
): Promise<OwnedLink> {
  return merge(
    owned,
    await call<DynamicLink>(`/api/links/${owned.code}`, { method: 'PATCH', body: JSON.stringify(patch) }, owned.token)
  );
}

export async function deleteDynamicLink(owned: Pick<OwnedLink, 'code' | 'token'>) {
  await call(`/api/links/${owned.code}`, { method: 'DELETE' }, owned.token);
  forgetLink(owned.code);
}
