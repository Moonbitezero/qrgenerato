// lib/qr-cards.ts
// Printable card layouts (retro aesthetic, retro girl, elegant, indian, vintage, art posters, business/membership/event) that
// wrap the live QR code. All artwork is original vector art generated here.

import { buildCardMotion } from './qr-card-motion';
import { RETRO_DESIGNS } from './qr-cards-retro';
import { GIRL_DESIGNS } from './qr-cards-girl';
import { ELEGANT_DESIGNS } from './qr-cards-elegant';
import { INDIAN_DESIGNS } from './qr-cards-indian';
import { VINTAGE_DESIGNS } from './qr-cards-vintage';
import { POSTER_DESIGNS } from './qr-cards-poster';

export type CardKind = 'retro' | 'girl' | 'elegant' | 'indian' | 'vintage' | 'poster' | 'business';

export interface CardFields {
  name: string;
  title: string;
  extra: string;
  /** Artwork URL or data URL for image-based cards (retro). Defaults to the small thumbnail. */
  art?: string;
  /** Optional 4th line, shown only with custom text (the built-in designs have three lines). */
  subtitle?: string;
}

export type CardTextFont = 'sans' | 'serif' | 'mono' | 'bold' | 'script';

/**
 * Custom text layout chosen in the studio. When set, the design's own text is hidden and this block is
 * drawn instead: position (centre as 0–1 of width/height), size, alignment, font, colour and backing.
 */
export interface CardTextStyle {
  cx: number;
  cy: number;
  scale: number;
  align: 'left' | 'center' | 'right';
  font: CardTextFont;
  color: string;
  bg: 'none' | 'shadow' | 'panel';
  show: { name: boolean; title: boolean; subtitle: boolean; extra: boolean };
}

export const DEFAULT_CARD_TEXT: CardTextStyle = {
  cx: 0.32,
  cy: 0.84,
  scale: 1,
  align: 'left',
  font: 'sans',
  color: '#ffffff',
  bg: 'shadow',
  show: { name: true, title: true, subtitle: true, extra: true },
};

export interface CardDesign {
  id: string;
  name: string;
  kind: CardKind;
  desc: string;
  w: number;
  h: number;
  defaults: CardFields;
  /** Full-resolution artwork for image-based cards; the studio inlines it as a data URL for downloads */
  artSrc?: string;
  /** Where the QR sits (a white plate with padding is drawn behind it) */
  qr: { x: number; y: number; size: number; plate?: string; radius?: number };
  /** Corner radius of the card outline; everything is clipped to it (default 14) */
  radius?: number;
  /** Cards whose artwork follows the QR (frame, text layout) can move it; `stack` = QR centred under the text */
  movable?: { stack: QrBox };
  /** The card's signature colour; the studio derives scan-safe "match card" QR colours from it */
  accent?: string;
  /** Returns markup drawn behind and in front of the QR. Movable cards receive the resolved placement. */
  draw: (f: CardFields, id: (name: string) => string, place: CardPlacement) => { back: string; front?: string };
}

export interface QrBox {
  x: number;
  y: number;
  size: number;
}

/** corner = the card's own spot, stack = centred under the text, free = user-positioned */
export type CardLayout = 'corner' | 'stack' | 'free';

export interface CardPlacement {
  layout: CardLayout;
  qr: QrBox;
}

/** User choice from the studio. `free` is normalised: centre as 0–1 of width/height, size as 0–1 of width. */
export interface CardQrOption {
  layout: CardLayout;
  free?: { cx: number; cy: number; size: number };
  /** Overrides the colour of the backing plate drawn behind the QR */
  plate?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The card's default QR spot expressed as a normalised `free` value (used to seed the custom sliders). */
export function defaultFreeQr(design: CardDesign): { cx: number; cy: number; size: number } {
  const { x, y, size } = design.qr;
  return { cx: (x + size / 2) / design.w, cy: (y + size / 2) / design.h, size: size / design.w };
}

export function resolveCardPlacement(design: CardDesign, opt?: CardQrOption): CardPlacement {
  const base = { x: design.qr.x, y: design.qr.y, size: design.qr.size };
  if (!design.movable || !opt || opt.layout === 'corner') return { layout: 'corner', qr: base };
  if (opt.layout === 'stack') return { layout: 'stack', qr: design.movable.stack };
  const f = opt.free ?? defaultFreeQr(design);
  const margin = 26; // keeps the QR and its frame inside the card border
  const size = clamp(f.size * design.w, 56, Math.min(design.w, design.h) - margin * 2);
  return {
    layout: 'free',
    qr: {
      x: clamp(f.cx * design.w - size / 2, margin, design.w - margin - size),
      y: clamp(f.cy * design.h - size / 2, margin, design.h - margin - size),
      size,
    },
  };
}

// ── Utilities ───────────────────────────────────────────────────

export function escapeCardText(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

function text(
  x: number,
  y: number,
  value: string,
  o: { size: number; fill: string; weight?: number; family?: string; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number; italic?: boolean }
): string {
  const v = escapeCardText(value);
  // Shrink long strings to fit `max` width (approx. 0.58em per character).
  const est = value.length * o.size * 0.58;
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-family="${o.family ?? SANS}" font-size="${o.size}" font-weight="${o.weight ?? 600}" fill="${o.fill}" text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${o.italic ? ' font-style="italic"' : ''}${fit}>${v}</text>`;
}

function stars(x: number, y: number, n: number, size: number, fill: string, gap = 4): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    const cx = x + i * (size + gap) + size / 2;
    const pts = Array.from({ length: 10 }, (_, k) => {
      const r = k % 2 ? size * 0.22 : size / 2;
      const a = (Math.PI / 5) * k - Math.PI / 2;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    out += `<polygon points="${pts}" fill="${fill}"/>`;
  }
  return out;
}

function lg(id: string, stops: string[], x2 = 1, y2 = 1): string {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map((c, i) => `<stop offset="${((i / (stops.length - 1)) * 100).toFixed(0)}%" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;
}

// ── Business / event helpers ────────────────────────────────────

function personIcon(x: number, y: number, w: number, h: number, bg: string, fg: string, r = 8): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${bg}"/><circle cx="${x + w / 2}" cy="${y + h * 0.4}" r="${w * 0.2}" fill="${fg}"/><path d="M${x + w * 0.18},${y + h} C${x + w * 0.2},${y + h * 0.66} ${x + w * 0.8},${y + h * 0.66} ${x + w * 0.82},${y + h} Z" fill="${fg}"/>`;
}

// ── Card catalogue ──────────────────────────────────────────────

export const CARD_DESIGNS: CardDesign[] = [
  // Business, membership & event cards
  {
    id: 'modern-business',
    name: 'Modern Business',
    kind: 'business',
    desc: 'Minimal professional card',
    w: 350,
    h: 200,
    defaults: { name: 'Alex Morgan', title: 'Product Designer', extra: 'alexmorgan.com' },
    qr: { x: 222, y: 40, size: 112, plate: '#ffffff', radius: 10 },
    draw: (f) => ({
      back: `<rect width="350" height="200" rx="14" fill="#ffffff"/><rect width="10" height="200" rx="0" fill="#4f46e5"/><rect x="10" y="0" width="4" height="200" fill="#a5b4fc"/>
        ${text(34, 74, f.name, { size: 22, fill: '#0f172a', weight: 800, max: 172 })}
        ${text(34, 96, f.title, { size: 12, fill: '#4f46e5', weight: 700, max: 172 })}
        <rect x="34" y="112" width="40" height="3" rx="1.5" fill="#4f46e5"/>
        ${text(34, 150, f.extra, { size: 11, fill: '#475569', weight: 600, max: 172 })}
        ${text(34, 168, 'Scan to save my contact →', { size: 9, fill: '#94a3b8', weight: 600 })}
        <rect x="216" y="34" width="124" height="124" rx="14" fill="none" stroke="#e2e8f0" stroke-width="2"/>`,
    }),
  },
  {
    id: 'luxury-black',
    radius: 10,
    name: 'Luxury Black',
    kind: 'business',
    desc: 'Black & gold premium',
    w: 350,
    h: 200,
    defaults: { name: 'JULIAN EVAN', title: 'Title & Position', extra: 'julianevan.co' },
    qr: { x: 236, y: 64, size: 92, plate: '#ffffff', radius: 4 },
    draw: (f, id) => {
      const g = id('gold');
      return {
        back: `<defs>${lg(g, ['#a16207', '#fde68a', '#b45309', '#fef3c7', '#a16207'])}</defs>
          <rect width="350" height="200" rx="10" fill="#0c0a09"/>
          <rect x="196" y="30" width="96" height="96" fill="url(#${g})"/>
          <rect x="226" y="54" width="112" height="112" fill="#0c0a09"/>
          <path d="M24,132 H214" stroke="url(#${g})" stroke-width="2"/>
          ${text(24, 120, f.name, { size: 20, fill: `url(#${g})`, weight: 500, family: SERIF, spacing: 3, max: 180 })}
          ${text(24, 154, f.title, { size: 11, fill: '#d6d3d1', weight: 400, family: SERIF, spacing: 2, max: 180 })}
          ${text(24, 176, f.extra, { size: 10, fill: '#a8a29e', weight: 400, family: SERIF, spacing: 1, max: 180 })}`,
      };
    },
  },
  {
    id: 'minimal-white',
    radius: 16,
    name: 'Minimal White',
    kind: 'business',
    desc: 'Clean white layout with QR',
    w: 350,
    h: 200,
    defaults: { name: 'Name Surname', title: 'Title or profession', extra: 'YOURWEBSITE.COM' },
    qr: { x: 26, y: 30, size: 118, plate: '#ffffff', radius: 6 },
    draw: (f) => ({
      back: `<rect width="350" height="200" rx="16" fill="#fafafa"/><rect x="0.5" y="0.5" width="349" height="199" rx="16" fill="none" stroke="#e5e7eb"/>
        ${text(85, 172, f.extra, { size: 9, fill: '#525252', weight: 600, anchor: 'middle', spacing: 1.5, max: 118 })}
        <path d="M172,48 V152" stroke="#e5e5e5" stroke-width="1.5"/>
        ${text(192, 96, f.name, { size: 17, fill: '#171717', weight: 700, family: SERIF, max: 140 })}
        ${text(192, 116, f.title, { size: 10.5, fill: '#737373', weight: 500, italic: true, max: 140 })}`,
    }),
  },
  {
    id: 'neon-business',
    radius: 16,
    name: 'Neon Business',
    kind: 'business',
    desc: 'Colourful futuristic card',
    w: 350,
    h: 200,
    defaults: { name: 'Nova Chen', title: 'Creative Technologist', extra: '@nova.codes' },
    qr: { x: 222, y: 44, size: 108, plate: '#ffffff', radius: 12 },
    draw: (f, id) => {
      const g = id('neon');
      const b = id('nbg');
      return {
        back: `<defs>${lg(g, ['#22d3ee', '#a855f7', '#ec4899'])}${lg(b, ['#0b1026', '#1e1b4b'])}</defs>
          <rect width="350" height="200" rx="16" fill="url(#${b})"/>
          <rect x="3" y="3" width="344" height="194" rx="14" fill="none" stroke="url(#${g})" stroke-width="3"/>
          <circle cx="44" cy="160" r="38" fill="#a855f7" opacity=".18"/><circle cx="306" cy="42" r="38" fill="#22d3ee" opacity=".12"/>
          ${text(28, 78, f.name, { size: 24, fill: '#ffffff', weight: 800, max: 180 })}
          ${text(28, 102, f.title, { size: 12, fill: `url(#${g})`, weight: 700, max: 180 })}
          ${text(28, 160, f.extra, { size: 12, fill: '#67e8f9', weight: 600, family: MONO, max: 180 })}
          <rect x="216" y="38" width="120" height="120" rx="16" fill="none" stroke="url(#${g})" stroke-width="2.5"/>`,
      };
    },
  },
  {
    id: 'vip-membership',
    radius: 16,
    name: 'VIP Membership',
    kind: 'business',
    desc: 'Premium membership card',
    w: 350,
    h: 200,
    defaults: { name: 'Priya Sharma', title: 'Platinum Member', extra: 'No. 0042 7781 · VALID 12/28' },
    qr: { x: 246, y: 76, size: 88, plate: '#ffffff', radius: 8 },
    draw: (f, id) => {
      const bg = id('vbg');
      const gold = id('vgold');
      return {
        back: `<defs>${lg(bg, ['#18181b', '#3f3f46', '#18181b'])}${lg(gold, ['#a16207', '#fde68a', '#ca8a04'])}</defs>
          <rect width="350" height="200" rx="16" fill="url(#${bg})"/>
          <path d="M0,150 C90,110 200,190 350,120 V200 H0 Z" fill="#000" opacity=".25"/>
          ${text(24, 52, 'VIP', { size: 38, fill: `url(#${gold})`, weight: 900, family: SERIF, spacing: 4 })}
          ${text(26, 70, 'MEMBERSHIP', { size: 9, fill: '#d4d4d8', weight: 700, spacing: 4 })}
          <rect x="26" y="88" width="40" height="30" rx="5" fill="url(#${gold})"/><path d="M26,103 H66 M40,88 V118 M52,88 V118" stroke="#78350f" stroke-width="1" opacity=".6"/>
          ${text(26, 150, f.name, { size: 16, fill: '#ffffff', weight: 700, max: 200, spacing: 1 })}
          ${text(26, 168, f.title, { size: 10, fill: `url(#${gold})`, weight: 700, max: 200, spacing: 1 })}
          ${text(26, 186, f.extra, { size: 8.5, fill: '#a1a1aa', weight: 600, family: MONO, max: 210 })}
          ${stars(256, 40, 5, 12, '#fde68a', 2)}`,
      };
    },
  },
  {
    id: 'student-id',
    name: 'Student ID',
    kind: 'business',
    desc: 'Photo, details & QR',
    w: 350,
    h: 200,
    defaults: { name: 'Arjun Patel', title: 'B.Tech Computer Science', extra: 'ID 23CS1042 · 2023–2027' },
    qr: { x: 244, y: 76, size: 90, plate: '#ffffff', radius: 8 },
    draw: (f) => ({
      back: `<rect width="350" height="200" rx="14" fill="#ffffff"/>
        <rect width="350" height="48" rx="14" fill="#0f766e"/><rect y="34" width="350" height="14" fill="#0f766e"/>
        ${text(20, 30, 'GREENFIELD UNIVERSITY', { size: 13, fill: '#ffffff', weight: 800, spacing: 1.5 })}
        ${text(330, 30, 'STUDENT', { size: 10, fill: '#99f6e4', weight: 800, anchor: 'end', spacing: 2 })}
        ${personIcon(20, 62, 70, 86, '#ccfbf1', '#0f766e')}
        ${text(102, 82, f.name, { size: 15, fill: '#0f172a', weight: 800, max: 130 })}
        ${text(102, 100, f.title, { size: 9.5, fill: '#0f766e', weight: 700, max: 130 })}
        ${text(102, 128, f.extra, { size: 8.5, fill: '#475569', weight: 600, family: MONO, max: 134 })}
        <rect x="0" y="176" width="350" height="24" fill="#f0fdfa"/><rect y="176" width="350" height="2" fill="#14b8a6"/>
        ${text(20, 192, 'If found, please return to the campus office', { size: 8, fill: '#64748b', weight: 500 })}`,
    }),
  },
  {
    id: 'employee-id',
    radius: 16,
    name: 'Employee ID',
    kind: 'business',
    desc: 'Vertical staff badge',
    w: 220,
    h: 340,
    defaults: { name: 'Sara Ali', title: 'Senior Engineer', extra: 'EMP-20431' },
    qr: { x: 62, y: 226, size: 96, plate: '#ffffff', radius: 8 },
    draw: (f) => ({
      back: `<rect width="220" height="340" rx="16" fill="#ffffff"/>
        <path d="M0,16 A16,16 0 0 1 16,0 H204 A16,16 0 0 1 220,16 V110 C150,130 70,90 0,110 Z" fill="#1d4ed8"/>
        <rect x="88" y="14" width="44" height="8" rx="4" fill="#ffffff" opacity=".8"/>
        ${text(110, 46, 'ACME CORP', { size: 13, fill: '#ffffff', weight: 800, anchor: 'middle', spacing: 3 })}
        <circle cx="110" cy="110" r="42" fill="#ffffff"/>
        ${personIcon(74, 72, 72, 76, '#dbeafe', '#1d4ed8', 36)}
        ${text(110, 178, f.name, { size: 17, fill: '#0f172a', weight: 800, anchor: 'middle', max: 190 })}
        ${text(110, 196, f.title, { size: 10.5, fill: '#1d4ed8', weight: 700, anchor: 'middle', max: 190 })}
        ${text(110, 214, f.extra, { size: 9, fill: '#64748b', weight: 700, anchor: 'middle', family: MONO, max: 190 })}
        <rect y="332" width="220" height="8" fill="#1d4ed8"/>`,
    }),
  },
  {
    id: 'cinema-ticket',
    name: 'Cinema Ticket',
    kind: 'business',
    desc: 'Movie-themed ticket',
    w: 360,
    h: 170,
    defaults: { name: 'MIDNIGHT ORBIT', title: 'Hall 3 · Row F · Seat 12', extra: 'SAT 21 NOV · 9:30 PM' },
    qr: { x: 262, y: 38, size: 86, plate: '#ffffff', radius: 6 },
    draw: (f, id) => {
      const g = id('cin');
      let holes = '';
      for (let i = 0; i < 10; i++) holes += `<circle cx="244" cy="${10 + i * 17}" r="3" fill="#18181b"/>`;
      return {
        back: `<defs>${lg(g, ['#7f1d1d', '#b91c1c'])}</defs>
          <path d="M14,0 H346 A14,14 0 0 0 360,14 V156 A14,14 0 0 0 346,170 H14 A14,14 0 0 0 0,156 V14 A14,14 0 0 0 14,0 Z" fill="url(#${g})"/>
          <rect x="250" y="0" width="96" height="170" fill="#fef3c7"/>
          ${holes}
          ${stars(20, 26, 5, 10, '#fde68a', 3)}
          ${text(20, 58, 'ADMIT ONE', { size: 10, fill: '#fde68a', weight: 800, spacing: 3 })}
          ${text(20, 92, f.name, { size: 22, fill: '#ffffff', weight: 900, max: 210, spacing: 1 })}
          ${text(20, 116, f.title, { size: 11, fill: '#fecaca', weight: 700, max: 210 })}
          ${text(20, 146, f.extra, { size: 11, fill: '#fde68a', weight: 800, family: MONO, max: 210 })}
          ${text(305, 146, 'SCAN AT GATE', { size: 7.5, fill: '#7f1d1d', weight: 800, anchor: 'middle', spacing: 1 })}`,
      };
    },
  },
  {
    id: 'concert-pass',
    radius: 16,
    name: 'Concert Pass',
    kind: 'business',
    desc: 'Music event access card',
    w: 360,
    h: 180,
    defaults: { name: 'NUIT SONORE', title: 'Classique & Jazz', extra: '28 MAI 2026 · 19H00' },
    qr: { x: 252, y: 44, size: 92, plate: '#ffffff', radius: 6 },
    draw: (f, id) => {
      const g = id('cp');
      return {
        back: `<defs>${lg(g, ['#f97316', '#db2777', '#7c3aed', '#2563eb'])}</defs>
          <rect width="360" height="180" rx="16" fill="#ffffff"/>
          <rect width="18" height="180" rx="0" fill="url(#${g})"/><rect x="342" width="18" height="180" fill="url(#${g})"/>
          <path d="M236,14 V166" stroke="#d4d4d8" stroke-width="2" stroke-dasharray="5 5"/>
          ${text(36, 40, 'ALL ACCESS', { size: 9, fill: '#db2777', weight: 800, spacing: 3 })}
          ${text(36, 78, f.name, { size: 26, fill: '#18181b', weight: 900, max: 190, spacing: 1 })}
          ${text(36, 100, f.title, { size: 12, fill: '#52525b', weight: 700, max: 190 })}
          <rect x="36" y="118" width="190" height="2" fill="url(#${g})"/>
          ${text(36, 146, f.extra, { size: 12, fill: '#18181b', weight: 800, family: MONO, max: 190 })}
          <path d="M210,40 V24 L222,20 V36 M210,40 a4,4 0 1 1 -1,-1 M222,36 a4,4 0 1 1 -1,-1" stroke="#7c3aed" stroke-width="2" fill="none"/>`,
      };
    },
  },
  {
    id: 'hotel-key',
    radius: 16,
    name: 'Hotel Key',
    kind: 'business',
    desc: 'Elegant hospitality card',
    w: 350,
    h: 200,
    defaults: { name: 'THE AURELIA', title: 'Room 1208 · Deluxe Suite', extra: 'Check-out 12:00 · Wi-Fi inside' },
    qr: { x: 236, y: 56, size: 96, plate: '#ffffff', radius: 8 },
    draw: (f, id) => {
      const g = id('hk');
      return {
        back: `<defs>${lg(g, ['#b45309', '#fde68a', '#b45309'])}</defs>
          <rect width="350" height="200" rx="16" fill="#0f1b2d"/>
          <rect x="10" y="10" width="330" height="180" rx="10" fill="none" stroke="url(#${g})" stroke-width="1.5"/>
          <g transform="translate(26 36)" fill="none" stroke="url(#${g})" stroke-width="2.4"><circle cx="10" cy="10" r="9"/><path d="M19,10 H46 M38,10 V18 M44,10 V16"/></g>
          ${text(26, 98, f.name, { size: 22, fill: `url(#${g})`, weight: 500, family: SERIF, spacing: 3, max: 190 })}
          ${text(26, 120, 'HOTEL & RESIDENCES', { size: 8, fill: '#94a3b8', weight: 700, spacing: 3 })}
          ${text(26, 150, f.title, { size: 11, fill: '#e2e8f0', weight: 600, max: 190 })}
          ${text(26, 170, f.extra, { size: 9, fill: '#94a3b8', weight: 500, max: 190 })}`,
      };
    },
  },
  {
    id: 'wedding-invitation',
    radius: 12,
    name: 'Wedding Invitation',
    kind: 'business',
    desc: 'Floral invite with RSVP QR',
    w: 280,
    h: 400,
    defaults: { name: 'Aisha & Rahul', title: 'Saturday, 12 December 2026', extra: 'Scan to RSVP' },
    qr: { x: 90, y: 248, size: 100, plate: '#ffffff', radius: 8 },
    draw: (f) => {
      const bloom = (x: number, y: number, s: number, c: string) =>
        `<g transform="translate(${x} ${y}) scale(${s})">${[0, 60, 120, 180, 240, 300].map((d) => `<ellipse cx="0" cy="-10" rx="7" ry="11" fill="${c}" transform="rotate(${d})"/>`).join('')}<circle r="5" fill="#fde68a"/></g>`;
      const leafP = (x: number, y: number, d: number) => `<path d="M0,0 C8,-10 22,-10 30,0 C22,10 8,10 0,0 Z" fill="#86efac" transform="translate(${x} ${y}) rotate(${d})"/>`;
      return {
        back: `<rect width="280" height="400" rx="12" fill="#fffaf5"/>
          <rect x="12" y="12" width="256" height="376" rx="8" fill="none" stroke="#e7c9a9" stroke-width="1.5"/>
          ${leafP(20, 40, -20)}${leafP(40, 18, 30)}${leafP(230, 30, 200)}${leafP(250, 60, 150)}${leafP(30, 370, 20)}${leafP(240, 360, 160)}
          ${bloom(36, 40, 1.2, '#f9a8d4')}${bloom(64, 30, 0.8, '#fbcfe8')}${bloom(244, 40, 1.2, '#f9a8d4')}${bloom(218, 28, 0.8, '#fecdd3')}
          ${bloom(36, 362, 1, '#fecdd3')}${bloom(244, 362, 1, '#fbcfe8')}
          ${text(140, 86, 'TOGETHER WITH THEIR FAMILIES', { size: 8, fill: '#a16207', weight: 700, anchor: 'middle', spacing: 2 })}
          ${text(140, 138, f.name, { size: 28, fill: '#7c2d12', weight: 400, family: SERIF, anchor: 'middle', italic: true, max: 240 })}
          ${text(140, 168, 'request the pleasure of your company', { size: 9.5, fill: '#78716c', weight: 400, family: SERIF, anchor: 'middle', italic: true })}
          <path d="M100,186 H180" stroke="#e7c9a9" stroke-width="1.5"/>
          ${text(140, 212, f.title, { size: 11, fill: '#44403c', weight: 700, family: SERIF, anchor: 'middle', max: 240 })}
          ${text(140, 372, f.extra, { size: 10, fill: '#a16207', weight: 700, anchor: 'middle', spacing: 2, max: 200 })}`,
      };
    },
  },
  {
    id: 'restaurant-menu',
    radius: 16,
    name: 'Restaurant Menu',
    kind: 'business',
    desc: 'Table card with menu QR',
    w: 260,
    h: 380,
    defaults: { name: 'Olive & Ember', title: 'Wood-fired Kitchen', extra: 'SCAN FOR MENU' },
    qr: { x: 70, y: 176, size: 120, plate: '#ffffff', radius: 10 },
    draw: (f) => ({
      back: `<rect width="260" height="380" rx="16" fill="#1f2a1c"/>
        <rect x="12" y="12" width="236" height="356" rx="10" fill="none" stroke="#d6c08a" stroke-width="1.5"/>
        <g transform="translate(130 50)" fill="none" stroke="#d6c08a" stroke-width="2.2" stroke-linecap="round">
          <path d="M-30,-14 V14 M-36,-14 V-2 Q-30,4 -24,-2 V-14"/><path d="M30,-14 C20,-6 20,6 30,8 V14"/><circle cx="0" cy="0" r="14"/>
        </g>
        ${text(130, 102, f.name, { size: 24, fill: '#f5ecd7', weight: 500, family: SERIF, anchor: 'middle', max: 220 })}
        ${text(130, 124, f.title, { size: 10, fill: '#d6c08a', weight: 600, anchor: 'middle', spacing: 2, max: 220 })}
        <path d="M90,142 H170" stroke="#d6c08a" stroke-width="1"/>
        <rect x="60" y="166" width="140" height="140" rx="16" fill="#f5ecd7"/>
        ${text(130, 334, f.extra, { size: 12, fill: '#f5ecd7', weight: 800, anchor: 'middle', spacing: 3, max: 220 })}
        ${text(130, 352, 'Order & pay from your table', { size: 8.5, fill: '#a3a38a', weight: 500, anchor: 'middle' })}`,
    }),
  },
];

CARD_DESIGNS.unshift(...RETRO_DESIGNS, ...GIRL_DESIGNS, ...ELEGANT_DESIGNS, ...INDIAN_DESIGNS, ...VINTAGE_DESIGNS, ...POSTER_DESIGNS);

export const CARD_MAP: Record<string, CardDesign> = Object.fromEntries(CARD_DESIGNS.map((c) => [c.id, c]));

/**
 * Wraps a full QR <svg> string (as produced by the studio, width/height 100%) inside a card.
 * The QR keeps its own animation/styles because it is nested as an inner <svg>.
 */
/** Optional ambient motion drawn over the whole card (see lib/qr-card-motion.ts). */
export interface CardMotionOpt {
  id: string;
  speed: number;
}

const TEXT_FONTS: Record<CardTextFont, { family: string; charW: number; weight?: number; italic?: boolean }> = {
  sans: { family: SANS, charW: 0.56 },
  serif: { family: SERIF, charW: 0.55 },
  mono: { family: MONO, charW: 0.62 },
  bold: { family: "'Arial Black', 'Helvetica Neue', Impact, sans-serif", charW: 0.68, weight: 900 },
  script: { family: "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive", charW: 0.5, italic: true },
};

function isLight(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return true;
  const n = parseInt(m[1], 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
}

/** The custom text block (see CardTextStyle). Kept inside the card with a 22-unit margin. */
function customTextBlock(d: CardDesign, f: CardFields, t: CardTextStyle): string {
  const s = Math.min(2, Math.max(0.5, t.scale));
  const font = TEXT_FONTS[t.font] ?? TEXT_FONTS.sans;
  const rows = [
    t.show.name && f.name ? { v: f.name, size: 22 * s, weight: font.weight ?? 800, spacing: 0 } : null,
    t.show.title && f.title ? { v: f.title, size: 12.5 * s, weight: font.weight ?? 600, spacing: 0 } : null,
    t.show.subtitle && f.subtitle ? { v: f.subtitle, size: 11 * s, weight: font.weight ?? 500, spacing: 0 } : null,
    t.show.extra && f.extra ? { v: f.extra, size: 9 * s, weight: font.weight ?? 800, spacing: 1.4 * s } : null,
  ].filter((r): r is { v: string; size: number; weight: number; spacing: number } => r !== null);
  if (!rows.length) return '';
  const margin = 22;
  const maxW = d.w - margin * 2;
  const est = (r: (typeof rows)[number]) => r.v.length * (r.size * font.charW + r.spacing);
  const bw = Math.min(maxW, Math.max(...rows.map(est)));
  const bh = rows.reduce((h, r, i) => h + r.size * (i === 0 ? 1.02 : 1.3), 0);
  const left = clamp(t.cx * d.w - bw / 2, margin, d.w - margin - bw);
  const top = clamp(t.cy * d.h - bh / 2, margin, d.h - margin - bh);
  const x = t.align === 'left' ? left : t.align === 'center' ? left + bw / 2 : left + bw;
  const anchor = t.align === 'left' ? 'start' : t.align === 'center' ? 'middle' : 'end';
  const light = isLight(t.color);
  const outline = light ? '#000000' : '#ffffff';
  let y = top;
  const texts = rows
    .map((r, i) => {
      y += r.size * (i === 0 ? 0.86 : 1.3);
      const fit = est(r) > maxW ? ` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"` : '';
      const halo = t.bg === 'shadow' ? ` paint-order="stroke" stroke="${outline}" stroke-opacity=".55" stroke-width="${(r.size * 0.12).toFixed(2)}" stroke-linejoin="round"` : '';
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${font.family}" font-size="${r.size.toFixed(2)}" font-weight="${r.weight}"${font.italic ? ' font-style="italic"' : ''} fill="${t.color}" text-anchor="${anchor}"${r.spacing ? ` letter-spacing="${r.spacing.toFixed(2)}"` : ''}${fit}${halo}>${escapeCardText(r.v)}</text>`;
    })
    .join('');
  const panel =
    t.bg === 'panel'
      ? `<rect x="${(left - 10).toFixed(1)}" y="${(top - 8).toFixed(1)}" width="${(bw + 20).toFixed(1)}" height="${(bh + 16).toFixed(1)}" rx="8" fill="${light ? '#000000' : '#ffffff'}" fill-opacity="${light ? 0.55 : 0.85}"/>`
      : '';
  return `<g class="card-custom-text">${panel}${texts}</g>`;
}

export function renderCardSvg(
  design: CardDesign,
  fields: CardFields,
  qrSvg: string,
  uid: string,
  qrOpt?: CardQrOption,
  motion?: CardMotionOpt,
  text?: CardTextStyle
): string {
  const id = (n: string) => `card_${uid}_${design.id.replace(/[^a-z0-9]/gi, '')}_${n}`;
  const place = resolveCardPlacement(design, qrOpt);
  // Custom text: the design draws without its own lines, and our block goes on top.
  const { back, front = '' } = design.draw(text ? { ...fields, name: '', title: '', extra: '' } : fields, id, place);
  const { radius = 8 } = design.qr;
  const plate = qrOpt?.plate ?? design.qr.plate ?? '#ffffff';
  const { x, y, size } = place.qr;
  const clip = id('outline');
  const cardR = design.radius ?? 14;
  const pad = Math.max(3, size * 0.04);
  const inner = qrSvg.replace(
    /width="100%" height="100%"/,
    `x="${x}" y="${y}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet"`
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${design.w} ${design.h}" width="100%" height="100%">
    <defs><clipPath id="${clip}"><rect width="${design.w}" height="${design.h}" rx="${cardR}"/></clipPath></defs>
    <g clip-path="url(#${clip})">
    ${back}
    <rect x="${x - pad}" y="${y - pad}" width="${size + pad * 2}" height="${size + pad * 2}" rx="${radius}" fill="${plate}"/>
    ${inner}
    ${front}
    ${motion ? buildCardMotion(motion.id, { uid: `${uid}${design.id}`, w: design.w, h: design.h, hole: place.qr, speed: motion.speed }) : ''}
    ${text ? customTextBlock(design, fields, text) : ''}
    </g>
  </svg>`;
}

/** Simple QR-looking placeholder used for picker thumbnails (not scannable). */
export const SAMPLE_QR_SVG = (() => {
  const n = 21;
  let cells = '';
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const eye = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
      if (eye) continue;
      const s = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      if (s - Math.floor(s) > 0.5) cells += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
    }
  const eyeAt = (x: number, y: number) =>
    `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" fill="none" stroke="#111" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 23 23" width="100%" height="100%"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#111">${cells}${eyeAt(0, 0)}${eyeAt(14, 0)}${eyeAt(0, 14)}</g></svg>`;
})();
