// lib/turnstile.ts — Cloudflare Turnstile (privacy-friendly bot check) for uploads and the contact form.
// Runs on demand: a token is fetched only when someone actually uploads or sends a message. Most visitors
// never see anything; if Cloudflare needs a click, a small box appears in the bottom-right corner.
//
// The site key is public by design. Set it here (or via NEXT_PUBLIC_TURNSTILE_SITE_KEY at build time).
// Until it's set, no check runs and the server doesn't enforce one either (TURNSTILE_SECRET unset).

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAGIOxDFD6UnJuahQ';

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  remove(id: string): void;
}

let loading: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  const w = window as unknown as { turnstile?: TurnstileApi };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => (w.turnstile ? resolve(w.turnstile) : reject(new Error('Security check failed to load.')));
    s.onerror = () => {
      loading = null;
      reject(new Error('Couldn’t load the security check. Check your connection, or disable content blockers for this site.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Returns a one-time token, or '' when Turnstile isn't configured. Tokens are single-use: call once per request. */
export async function getTurnstileToken(): Promise<string> {
  if (!TURNSTILE_SITE_KEY) return '';
  const ts = await loadTurnstile();
  return new Promise((resolve, reject) => {
    const box = document.createElement('div');
    box.setAttribute('aria-live', 'polite');
    Object.assign(box.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: '9999' });
    document.body.appendChild(box);
    let id = '';
    const done = (fn: () => void) => {
      try {
        if (id) ts.remove(id);
      } catch {
        // already removed
      }
      box.remove();
      fn();
    };
    id = ts.render(box, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: 'interaction-only', // invisible unless Cloudflare needs a click
      callback: (token: string) => done(() => resolve(token)),
      'error-callback': () => done(() => reject(new Error('The security check failed. Please try again.'))),
      'timeout-callback': () => done(() => reject(new Error('The security check timed out. Please try again.'))),
    });
  });
}
