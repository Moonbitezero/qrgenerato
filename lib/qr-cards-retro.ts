// lib/qr-cards-retro.ts
// "Retro Aesthetic" cards: full-bleed pixel-art scenes (original artwork, served from
// /public/cards/retro) inside a retro-computer window frame with CRT scanlines and a pixel QR frame.

import type { CardDesign, CardFields, CardPlacement } from './qr-cards';

type Id = (n: string) => string;

const W = 300;
const H = 450;
const MONO = "'Courier New', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(x: number, y: number, value: string, o: { size: number; fill: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number; shadow?: string }): string {
  const est = value.length * o.size * 0.62;
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  const base = `x="${x}" y="${y}" font-family="${MONO}" font-size="${o.size}" font-weight="${o.weight ?? 700}" text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${fit}`;
  const shadow = o.shadow ? `<text ${base.replace(`x="${x}" y="${y}"`, `x="${x + 1.5}" y="${y + 1.5}"`)} fill="${o.shadow}">${esc(value)}</text>` : '';
  return `${shadow}<text ${base} fill="${o.fill}">${esc(value)}</text>`;
}

/** Rectangle with stepped (pixel) corners. */
function pixelRect(x: number, y: number, w: number, h: number, s: number): string {
  return `M${x + s},${y} H${x + w - s} V${y + s} H${x + w} V${y + h - s} H${x + w - s} V${y + h} H${x + s} V${y + h - s} H${x} V${y + s} H${x + s} Z`;
}

interface RetroOpts {
  slug: string;
  /** Accent used for buttons, QR frame and the extra line */
  accent: string;
  /** Dark tone of the bottom fade, sampled from the artwork */
  shade: string;
  /** Frame colour */
  frame: string;
}

const QR = { x: 198, y: 338, size: 84, plate: '#ffffff', radius: 2 };

function retroCard(o: RetroOpts) {
  return (f: CardFields, id: Id, place: CardPlacement) => {
    const q = place.qr;
    const stack = place.layout === 'stack';
    const fadeY = stack ? 200 : 280;
    const href = f.art ?? `/cards/retro/${o.slug}-thumb.webp`;
    const fade = id('fade');
    const vig = id('vig');
    const scan = id('scan');
    const back = `
      <defs>
        <linearGradient id="${fade}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${o.shade}" stop-opacity="0"/>
          <stop offset=".55" stop-color="${o.shade}" stop-opacity=".72"/>
          <stop offset="1" stop-color="${o.shade}" stop-opacity=".95"/>
        </linearGradient>
        <radialGradient id="${vig}" cx=".5" cy=".45" r=".75">
          <stop offset=".6" stop-color="#000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity=".38"/>
        </radialGradient>
        <pattern id="${scan}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".1"/></pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="${o.shade}"/>
      <image href="${href}" xlink:href="${href}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
      <rect width="${W}" height="${H}" fill="url(#${scan})"/>
      <rect width="${W}" height="${H}" fill="url(#${vig})"/>
      <rect x="0" y="${fadeY}" width="${W}" height="${H - fadeY}" fill="url(#${fade})"/>

      <!-- window title bar -->
      <path d="${pixelRect(14, 14, W - 28, 22, 3)}" fill="${o.frame}" stroke="#1c1917" stroke-width="2"/>
      <rect x="22" y="21" width="8" height="8" fill="#ef4444" stroke="#1c1917" stroke-width="1.5"/>
      <rect x="34" y="21" width="8" height="8" fill="#facc15" stroke="#1c1917" stroke-width="1.5"/>
      <rect x="46" y="21" width="8" height="8" fill="#22c55e" stroke="#1c1917" stroke-width="1.5"/>
      ${txt(W / 2 + 14, 29, `${o.slug.replace(/-/g, '_')}.png`, { size: 9, fill: '#1c1917', anchor: 'middle', spacing: 0.5 })}
      <path d="M${W - 40},20 h10 v10 h-10 Z M${W - 36},24 h2 v2 h-2 Z" fill="none" stroke="#1c1917" stroke-width="1.5"/>

      <!-- outer frame: outer edge sits exactly on the card's 14px rounded corner -->
      <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="10" fill="none" stroke="${o.frame}" stroke-width="8"/>
      <rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="8" fill="none" stroke="#1c1917" stroke-width="1.5" opacity=".55"/>

      <!-- name panel -->
      ${
        stack
          ? `<path d="M136,268 h10 v4 h-10 Z M154,268 h10 v4 h-10 Z" fill="${o.accent}"/>
      ${txt(W / 2, 296, f.name, { size: 19, fill: '#fffbeb', weight: 800, anchor: 'middle', max: 240, shadow: '#00000099' })}
      ${txt(W / 2, 314, f.title, { size: 10, fill: '#f5f5f4', weight: 700, anchor: 'middle', max: 240, shadow: '#00000099' })}
      ${txt(W / 2, 331, f.extra, { size: 8.5, fill: o.accent, weight: 800, spacing: 1.5, anchor: 'middle', max: 240, shadow: '#00000099' })}`
          : `<path d="M22,352 h10 v4 h-10 Z M36,352 h10 v4 h-10 Z" fill="${o.accent}"/>
      ${txt(22, 382, f.name, { size: 19, fill: '#fffbeb', weight: 800, max: 166, shadow: '#00000099' })}
      ${txt(22, 401, f.title, { size: 10, fill: '#f5f5f4', weight: 700, max: 166, shadow: '#00000099' })}
      ${txt(22, 424, f.extra, { size: 8.5, fill: o.accent, weight: 800, spacing: 1.5, max: 166, shadow: '#00000099' })}`
      }

      <!-- pixel QR frame -->
      <path d="${pixelRect(q.x - 9, q.y - 9, q.size + 18, q.size + 18, 5)}" fill="${o.frame}" stroke="#1c1917" stroke-width="2"/>
      <path d="${pixelRect(q.x - 5, q.y - 5, q.size + 10, q.size + 10, 3)}" fill="none" stroke="${o.accent}" stroke-width="2"/>
    `;
    return { back };
  };
}

interface RetroEntry extends RetroOpts {
  name: string;
  desc: string;
  title: string;
}

const ENTRIES: RetroEntry[] = [
  { slug: 'rainy-desk', name: 'Rainy Desk', desc: 'Lo-fi desk, rain on the window', title: 'Lo-fi study session', accent: '#fbbf24', shade: '#0f172a', frame: '#e7e5e4' },
  { slug: 'autumn-lane', name: 'Autumn Lane', desc: 'Golden leaves, old bookshop street', title: 'Autumn reading club', accent: '#f59e0b', shade: '#1c1206', frame: '#fde68a' },
  { slug: 'island-hut', name: 'Island Hut', desc: 'Palm island, turquoise sea', title: 'Summer getaway', accent: '#14b8a6', shade: '#134e4a', frame: '#fef3c7' },
  { slug: 'rain-cafe', name: 'Rain Café', desc: 'Warm lamps, rainy café window', title: 'Coffee & rain', accent: '#fb923c', shade: '#1c0a0a', frame: '#fed7aa' },
  { slug: 'snow-village', name: 'Snow Village', desc: 'Snowy cabins under the mountains', title: 'Winter cabin nights', accent: '#93c5fd', shade: '#0f1b33', frame: '#e0f2fe' },
  { slug: 'sunset-harbor', name: 'Sunset Harbor', desc: 'Orange sunset over a fishing harbour', title: 'Golden hour by the sea', accent: '#fb923c', shade: '#2a1410', frame: '#ffedd5' },
  { slug: 'moon-library', name: 'Moon Library', desc: 'Moonlit tower library', title: 'Midnight library', accent: '#c4b5fd', shade: '#140f2e', frame: '#ede9fe' },
  { slug: 'sakura-station', name: 'Sakura Station', desc: 'Pink train under cherry blossoms', title: 'Spring train ride', accent: '#f472b6', shade: '#3b1d2e', frame: '#fce7f3' },
  { slug: 'window-cat', name: 'Window Cat', desc: 'Cat watching the rain', title: 'Cozy rainy day', accent: '#fda4af', shade: '#1f2937', frame: '#ffe4e6' },
  { slug: 'lake-cabin', name: 'Lake Cabin', desc: 'Mountain lake and pine forest', title: 'Off-grid weekend', accent: '#5eead4', shade: '#0b2a24', frame: '#ccfbf1' },
  { slug: 'quiet-alley', name: 'Quiet Alley', desc: 'Retro street, bike and vending machine', title: 'Neighbourhood walk', accent: '#f87171', shade: '#1f2a2a', frame: '#e7e5e4' },
];

export const RETRO_DESIGNS: CardDesign[] = ENTRIES.map((e, i) => ({
  id: `retro-${e.slug}`,
  name: e.name,
  kind: 'retro',
  desc: e.desc,
  w: W,
  h: H,
  radius: 14,
  artSrc: `/cards/retro/${e.slug}.webp`,
  defaults: { name: 'Your Name', title: e.title, extra: `RETRO · No. ${String(i + 1).padStart(2, '0')}` },
  qr: QR,
  movable: { stack: { x: 115, y: 352, size: 70 } },
  draw: retroCard(e),
}));
