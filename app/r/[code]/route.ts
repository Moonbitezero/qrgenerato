// GET /r/:code — the address printed inside every dynamic QR. Counts the scan and redirects.
import { CODE_PATTERN, getLink, runInBackground, saveLink } from '@/lib/dynamic-links';

export const runtime = 'edge';

const NOT_FOUND_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>QR code not found</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#09090f;color:#e4e4e7;font-family:system-ui,sans-serif;text-align:center;padding:16px">
<div><h1 style="font-size:20px;margin:0 0 8px">This QR code isn't active</h1><p style="color:#a1a1aa;margin:0 0 20px">The link may have been mistyped or removed.</p>
<a href="/" style="color:#e879f9">Make a free QR code</a></div></body></html>`;

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = CODE_PATTERN.test(code) ? await getLink(code) : null;
  if (!link) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // Counting happens after the redirect is sent so the scan isn't slowed down.
  // KV has no atomic increment, so near-simultaneous scans can occasionally be counted once.
  runInBackground(saveLink(code, { ...link, scans: link.scans + 1, lastScanAt: Date.now() }));

  // 302 + no-store: phones must ask us every time, otherwise a changed destination wouldn't take effect.
  return new Response(null, {
    status: 302,
    headers: { Location: link.target, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
