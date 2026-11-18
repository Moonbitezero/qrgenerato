// lib/smart-import.ts — turn pasted text, a scanned QR, a contact (.vcf) file or a phone contact into
// ready-filled QR fields, so people don't have to type everything by hand.

export type Detected =
  | { type: 'wifi'; ssid: string; password: string; security: 'WPA' | 'WEP' | 'nopass'; hidden: boolean }
  | { type: 'vcard'; name: string; org: string; phone: string; email: string; website: string; city: string }
  | { type: 'upi'; id: string; name: string; amount: string; note: string }
  | { type: 'whatsapp'; phone: string; message: string }
  | { type: 'email'; to: string; subject: string; body: string }
  | { type: 'sms'; phone: string; body: string }
  | { type: 'phone'; phone: string }
  | { type: 'maps'; query: string }
  | { type: 'url'; url: string }
  | { type: 'text'; text: string };

/** Short human description, e.g. for "Filled from clipboard: …". */
export function describe(d: Detected): string {
  switch (d.type) {
    case 'wifi': return `Wi-Fi network “${d.ssid}”`;
    case 'vcard': return `contact ${d.name || d.phone || d.email}`.trim();
    case 'upi': return `UPI ID ${d.id}`;
    case 'whatsapp': return `WhatsApp ${d.phone}`;
    case 'email': return `email to ${d.to}`;
    case 'sms': return `SMS to ${d.phone}`;
    case 'phone': return `phone number ${d.phone}`;
    case 'maps': return `location ${d.query}`;
    case 'url': return 'link';
    case 'text': return 'text';
  }
}

// For the address part of tel:/mailto:/sms: links. "+" stays "+" (international numbers);
// query strings go through URLSearchParams, which handles "+" as a space itself.
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

function query(url: string): URLSearchParams {
  const i = url.indexOf('?');
  return new URLSearchParams(i >= 0 ? url.slice(i + 1) : '');
}

/** Splits `KEY:value;KEY:value;;` strings (WIFI:, MECARD:, MATMSG:) honouring backslash escapes. */
function splitFields(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  let key = '';
  let val = '';
  let inKey = true;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    let ch = c;
    if (c === '\\' && i + 1 < body.length) {
      ch = body[++i]; // escaped character is taken literally
    } else if (inKey && c === ':') {
      inKey = false;
      continue;
    } else if (!inKey && c === ';') {
      if (key) out[key.trim().toUpperCase()] ??= val;
      key = '';
      val = '';
      inKey = true;
      continue;
    }
    if (inKey) key += ch;
    else val += ch;
  }
  if (key && !inKey) out[key.trim().toUpperCase()] ??= val;
  return out;
}

const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Works out what a piece of text is and extracts its fields. */
export function detect(raw: string): Detected {
  const text = raw.trim();
  const lower = text.toLowerCase();

  if (lower.startsWith('wifi:')) {
    const f = splitFields(text.slice(5));
    const t = (f.T || '').toUpperCase();
    return {
      type: 'wifi',
      ssid: f.S || '',
      password: f.P || '',
      security: t === 'WEP' ? 'WEP' : t === 'NOPASS' || (!t && !f.P) ? 'nopass' : 'WPA',
      hidden: (f.H || '').toLowerCase() === 'true',
    };
  }
  if (/^begin:vcard/i.test(text)) {
    const c = parseVCard(text)[0];
    if (c) return { type: 'vcard', ...c };
  }
  if (lower.startsWith('mecard:')) {
    const f = splitFields(text.slice(7));
    const n = (f.N || '').split(',');
    return {
      type: 'vcard',
      name: n.length > 1 ? `${n[1]} ${n[0]}`.trim() : n[0] || '',
      org: f.ORG || '',
      phone: f.TEL || '',
      email: f.EMAIL || '',
      website: f.URL || '',
      city: '',
    };
  }
  if (lower.startsWith('upi://')) {
    const q = query(text);
    return { type: 'upi', id: q.get('pa') || '', name: q.get('pn') || '', amount: q.get('am') || '', note: q.get('tn') || '' };
  }
  if (lower.startsWith('matmsg:')) {
    const f = splitFields(text.slice(7));
    return { type: 'email', to: f.TO || '', subject: f.SUB || '', body: f.BODY || '' };
  }
  if (lower.startsWith('mailto:')) {
    const q = query(text);
    return { type: 'email', to: safeDecode(text.slice(7).split('?')[0]), subject: q.get('subject') || '', body: q.get('body') || '' };
  }
  if (lower.startsWith('smsto:') || lower.startsWith('sms:')) {
    const rest = text.slice(text.indexOf(':') + 1);
    if (lower.startsWith('smsto:')) {
      const i = rest.indexOf(':');
      return { type: 'sms', phone: i >= 0 ? rest.slice(0, i) : rest, body: i >= 0 ? rest.slice(i + 1) : '' };
    }
    return { type: 'sms', phone: safeDecode(rest.split('?')[0]), body: query(text).get('body') || '' };
  }
  if (lower.startsWith('tel:')) return { type: 'phone', phone: safeDecode(text.slice(4)) };
  if (lower.startsWith('geo:')) {
    const [lat, lng] = text.slice(4).split(/[,;?]/);
    return { type: 'maps', query: `${lat},${lng}` };
  }
  const wa = text.match(/^(?:https?:\/\/)?(?:wa\.me\/(\+?\d+)|(?:api|web)\.whatsapp\.com\/send)/i);
  if (wa) {
    const q = query(text);
    return { type: 'whatsapp', phone: wa[1] || q.get('phone') || '', message: q.get('text') || '' };
  }
  if (/^https?:\/\//i.test(text) || /^www\./i.test(text) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(text)) {
    return { type: 'url', url: /^https?:\/\//i.test(text) ? text : `https://${text}` };
  }
  if (EMAIL_RE.test(text)) return { type: 'email', to: text, subject: '', body: '' };
  if (PHONE_RE.test(text) && text.replace(/\D/g, '').length >= 7) return { type: 'phone', phone: text.replace(/[^\d+]/g, '') };
  return { type: 'text', text };
}

// ── vCard (.vcf) files: iPhone and Android "Share contact" both produce these ──

export interface ContactFields {
  name: string;
  org: string;
  phone: string;
  email: string;
  website: string;
  city: string;
}

function decodeQuotedPrintable(s: string) {
  const bytes: number[] = [];
  const src = s.replace(/=\r?\n/g, '');
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '=' && /^[0-9A-F]{2}$/i.test(src.slice(i + 1, i + 3))) {
      bytes.push(parseInt(src.slice(i + 1, i + 3), 16));
      i += 2;
    } else bytes.push(src.charCodeAt(i));
  }
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return s;
  }
}

const unescapeV = (s: string) => s.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim();

/** Parses every contact in a .vcf file (vCard 2.1, 3.0 and 4.0). */
export function parseVCard(text: string): ContactFields[] {
  const lines = text.replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n'); // unfold continued lines
  const cards: ContactFields[] = [];
  let cur: (ContactFields & { _cell?: string; _n?: string }) | null = null;
  for (const line of lines) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const head = line.slice(0, i);
    let value = line.slice(i + 1);
    const parts = head.split(';');
    const prop = parts[0].replace(/^item\d+\./i, '').toUpperCase();
    const params = parts.slice(1).join(';').toUpperCase();
    if (prop === 'BEGIN' && value.toUpperCase() === 'VCARD') {
      cur = { name: '', org: '', phone: '', email: '', website: '', city: '' };
      continue;
    }
    if (!cur) continue;
    if (prop === 'END') {
      if (!cur.name && cur._n) {
        const [last = '', first = ''] = cur._n.split(';').map(unescapeV);
        cur.name = `${first} ${last}`.trim();
      }
      if (cur._cell) cur.phone = cur._cell;
      cards.push({ name: cur.name, org: cur.org, phone: cur.phone, email: cur.email, website: cur.website, city: cur.city });
      cur = null;
      continue;
    }
    if (params.includes('QUOTED-PRINTABLE')) value = decodeQuotedPrintable(value);
    switch (prop) {
      case 'FN': cur.name ||= unescapeV(value); break;
      case 'N': cur._n ||= value; break;
      case 'ORG': cur.org ||= unescapeV(value.split(';')[0]); break;
      case 'TEL': {
        const num = unescapeV(value.replace(/^tel:/i, ''));
        if (/CELL|MOBILE|IPHONE/.test(params)) cur._cell ||= num;
        cur.phone ||= num;
        break;
      }
      case 'EMAIL': cur.email ||= unescapeV(value); break;
      case 'URL': cur.website ||= unescapeV(value); break;
      case 'ADR': {
        const a = value.split(';').map(unescapeV); // PO box; ext; street; city; region; postcode; country
        cur.city ||= a[3] || a[4] || a[6] || '';
        break;
      }
    }
  }
  return cards;
}

// ── Phone contacts (Contact Picker API: Android Chrome, Samsung Internet) ──

interface ContactsManager {
  select(props: string[], opts?: { multiple?: boolean }): Promise<{ name?: string[]; tel?: string[]; email?: string[]; address?: { city?: string }[] }[]>;
  getProperties(): Promise<string[]>;
}

export function contactPickerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'contacts' in navigator && typeof window !== 'undefined' && 'ContactsManager' in window;
}

/** Opens the phone's contact list and returns the chosen contact, or null if cancelled. */
export async function pickPhoneContact(): Promise<ContactFields | null> {
  const contacts = (navigator as unknown as { contacts: ContactsManager }).contacts;
  const supported = await contacts.getProperties().catch(() => ['name', 'tel', 'email']);
  const props = ['name', 'tel', 'email', 'address'].filter((p) => supported.includes(p));
  const [c] = await contacts.select(props, { multiple: false });
  if (!c) return null;
  return {
    name: c.name?.[0] || '',
    phone: c.tel?.[0] || '',
    email: c.email?.[0] || '',
    city: c.address?.[0]?.city || '',
    org: '',
    website: '',
  };
}
