// GET   /api/links/:code            (header X-Edit-Token)  -> link details + scan count
// PATCH /api/links/:code { target } (header X-Edit-Token)  -> change destination
import { CODE_PATTERN, getLink, hashToken, normalizeTarget, saveLink, toOwnerView } from '@/lib/dynamic-links';

export const runtime = 'edge';

type Ctx = { params: Promise<{ code: string }> };

const noStore = { 'Cache-Control': 'no-store' };

async function authorize(request: Request, code: string) {
  if (!CODE_PATTERN.test(code)) return { error: Response.json({ error: 'Not found.' }, { status: 404 }) };
  const link = await getLink(code);
  const token = request.headers.get('x-edit-token') ?? '';
  // Same response for "missing" and "wrong token" so codes can't be probed.
  if (!link || !token || (await hashToken(token)) !== link.tokenHash) {
    return { error: Response.json({ error: 'Code not found or edit key is wrong.' }, { status: 404, headers: noStore }) };
  }
  return { link };
}

export async function GET(request: Request, { params }: Ctx) {
  const { code } = await params;
  const { link, error } = await authorize(request, code);
  if (error) return error;
  return Response.json(toOwnerView(code, link), { headers: noStore });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { code } = await params;
  const { link, error } = await authorize(request, code);
  if (error) return error;

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

  const updated = { ...link, target, updatedAt: Date.now() };
  await saveLink(code, updated);
  return Response.json(toOwnerView(code, updated), { headers: noStore });
}
