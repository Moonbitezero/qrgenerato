// POST /api/links  { target }  ->  { code, shortUrl, token, ...link }
import { getLink, hashToken, normalizeTarget, randomCode, randomToken, saveLink, toOwnerView } from '@/lib/dynamic-links';

export const runtime = 'edge';

export async function POST(request: Request) {
  let body: { target?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const target = normalizeTarget(body.target);
  if (!target) {
    return Response.json({ error: 'Enter a valid website address (http or https).' }, { status: 400 });
  }

  // Pick an unused code; collisions are astronomically unlikely but cheap to rule out.
  let code = randomCode();
  for (let i = 0; i < 4 && (await getLink(code)); i++) code = randomCode();

  const token = randomToken();
  const now = Date.now();
  const link = { target, tokenHash: await hashToken(token), createdAt: now, updatedAt: now, scans: 0, lastScanAt: null };
  await saveLink(code, link);

  const origin = new URL(request.url).origin;
  return Response.json(
    { ...toOwnerView(code, link), shortUrl: `${origin}/r/${code}`, token },
    { status: 201, headers: { 'Cache-Control': 'no-store' } }
  );
}
