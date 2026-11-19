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
  try {
    // Usually invisible: a token arrives without the visitor noticing.
    return await runWidget(ts, false);
  } catch (err) {
    // Strict browsers (Brave Shields, privacy extensions, VPNs) can fail the invisible check (code 600010).
    // Give them one more go with a visible "Verify you are human" box they can click.
    const code = (err as Error & { code?: string }).code || '';
    if (code.startsWith('110')) throw err; // site setup problem (e.g. web address not allowed): retrying won't help
    return runWidget(ts, true);
  }
}

function runWidget(ts: TurnstileApi, visible: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const box = document.createElement('div');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Security check');
    Object.assign(box.style, { position: 'fixed', right: '16px', bottom: '16px', zIndex: '9999' });
    if (visible) {
      Object.assign(box.style, {
        background: '#111116',
        border: '1px solid #3f3f46',
        borderRadius: '14px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,.5)',
        color: '#e4e4e7',
        font: '600 13px system-ui, sans-serif',
      });
      const label = document.createElement('p');
      label.textContent = 'Quick security check: please confirm you’re human';
      Object.assign(label.style, { margin: '0 0 8px' });
      box.appendChild(label);
    }
    const slot = document.createElement('div');
    box.appendChild(slot);
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
    const fail = (code?: string) => {
      const hint = code === '600010' || code?.startsWith('300') ? ' If you use Brave Shields, an ad blocker or a VPN, try turning it off for this site.' : '';
      const e = new Error(`The security check failed${code ? ` (code ${code})` : ''}.${hint} Please reload the page and try again.`) as Error & { code?: string };
      e.code = code;
      return e;
    };
    id = ts.render(slot, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: visible ? 'always' : 'interaction-only', // invisible unless Cloudflare needs a click
      theme: 'dark',
      retry: 'auto',
      callback: (token: string) => done(() => resolve(token)),
      // Cloudflare passes an error code (e.g. 110200 = web address not allowed, 600010 = browser not trusted).
      'error-callback': (code?: string) => {
        done(() => reject(fail(code)));
        return true; // we handle the error ourselves
      },
      'timeout-callback': () => done(() => reject(fail('timeout'))),
    });
  });
}
