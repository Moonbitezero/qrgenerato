// lib/qr-cards-elegant.ts
// "Elegant" cards: Art-Nouveau tarot-style portraits (original artwork, served from
// /public/cards/elegant) inside a gilded frame with a roman-numeral plaque, a serif name
// cartouche and a gold QR frame.

import type { CardDesign, CardFields, CardPlacement } from './qr-cards';

type Id = (n: string) => string;

const W = 300;
const H = 450;
const SERIF = "Georgia, 'Times New Roman', 'Cormorant Garamond', serif";

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(x: number, y: number, value: string, o: { size: number; fill: string; weight?: number; italic?: boolean; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number }): string {
  const est = value.length * o.size * (0.55 + (o.spacing ? o.spacing / o.size : 0));
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-family="${SERIF}" font-size="${o.size}" font-weight="${o.weight ?? 400}"${o.italic ? ' font-style="italic"' : ''} text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${fit} fill="${o.fill}">${esc(value)}</text>`;
}

/** Rectangle with concave (scooped) corners, the classic cartouche shape. */
function cartouche(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 0 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 0 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 0 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 0 ${x + r},${y} Z`;
}

function diamond(cx: number, cy: number, s: number, fill: string): string {
  return `<path d="M${cx - s},${cy} L${cx},${cy - s} L${cx + s},${cy} L${cx},${cy + s} Z" fill="${fill}"/>`;
}

interface ElegantOpts {
  slug: string;
  /** Gold / metallic accent for frames, ornaments and the extra line */
  gold: string;
  /** Deep tone of the cartouche and bottom fade, sampled from the artwork */
  ink: string;
  numeral: string;
}

const IVORY = '#fbf5e6';
const QR = { x: 198, y: 342, size: 76, plate: '#ffffff', radius: 2 };

function elegantCard(o: ElegantOpts) {
  return (f: CardFields, id: Id, place: CardPlacement) => {
    const href = f.art ?? `/cards/elegant/${o.slug}-thumb.webp`;
    const fade = id('fade');
    const clip = id('clip');
    const sheen = id('sheen');
    const g = o.gold;
    const q = place.qr;
    const stack = place.layout === 'stack';
    // Text block: left-aligned beside the QR, or centred above it in the stacked layout.
    const tx = stack ? W / 2 : 32;
    const anchor = stack ? 'middle' : 'start';
    const max = stack ? 228 : 150;
    const panelY = stack ? 258 : 326;
    const textBlock = stack
      ? `${txt(tx, 292, f.name, { size: 19, fill: IVORY, weight: 700, anchor, max })}
         <path d="M96,302 H143" stroke="${g}" stroke-width=".8"/>${diamond(150, 302, 2.5, g)}<path d="M157,302 H204" stroke="${g}" stroke-width=".8"/>
         ${txt(tx, 320, f.title, { size: 10.5, fill: '#efe6d2', italic: true, anchor, max })}
         ${txt(tx, 426, f.extra, { size: 7.5, fill: g, weight: 700, spacing: 1.8, anchor, max })}`
      : `${txt(tx, 367, f.name, { size: 19, fill: IVORY, weight: 700, max })}
         <path d="M32,377 H84" stroke="${g}" stroke-width=".8"/>${diamond(89, 377, 2.5, g)}<path d="M94,377 H146" stroke="${g}" stroke-width=".8"/>
         ${txt(tx, 395, f.title, { size: 10.5, fill: '#efe6d2', italic: true, max })}
         ${txt(tx, 418, f.extra, { size: 7.5, fill: g, weight: 700, spacing: 1.8, max })}`;
    const back = `
      <defs>
        <clipPath id="${clip}"><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="7"/></clipPath>
        <linearGradient id="${fade}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${o.ink}" stop-opacity="0"/>
          <stop offset=".6" stop-color="${o.ink}" stop-opacity=".55"/>
          <stop offset="1" stop-color="${o.ink}" stop-opacity=".9"/>
        </linearGradient>
        <linearGradient id="${sheen}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity=".55"/>
          <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity=".25"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="${o.ink}"/>
      <g clip-path="url(#${clip})">
        <image href="${href}" xlink:href="${href}" x="9" y="9" width="${W - 18}" height="${H - 18}" preserveAspectRatio="xMidYMid slice"/>
        <rect x="9" y="${panelY - 80}" width="${W - 18}" height="${H - panelY + 80}" fill="url(#${fade})"/>
      </g>

      <!-- gilded frame: outer edge sits exactly on the card's 14px rounded corner -->
      <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="10.5" fill="none" stroke="${g}" stroke-width="7"/>
      <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="10.5" fill="none" stroke="url(#${sheen})" stroke-width="7"/>
      <rect x="13" y="13" width="${W - 26}" height="${H - 26}" rx="5" fill="none" stroke="${g}" stroke-width="1" opacity=".85"/>
      ${diamond(13, 13, 4.5, g)}${diamond(W - 13, 13, 4.5, g)}${diamond(13, H - 13, 4.5, g)}${diamond(W - 13, H - 13, 4.5, g)}

      <!-- numeral plaque -->
      <path d="${cartouche(122, 6, 56, 24, 5)}" fill="${o.ink}" stroke="${g}" stroke-width="1.5"/>
      ${diamond(116, 18, 2.5, g)}${diamond(184, 18, 2.5, g)}
      ${txt(150, 23, o.numeral, { size: 12, fill: g, weight: 700, anchor: 'middle', spacing: 1.5 })}

      <!-- name cartouche -->
      <!-- panel slot: the card's own panel, none, or a custom panel from the studio -->
      ${
        f.panel === undefined
          ? `<path d="${cartouche(18, panelY, W - 36, H - 14 - panelY, 8)}" fill="${o.ink}" fill-opacity=".9" stroke="${g}" stroke-width="1.5"/>
      <path d="${cartouche(22, panelY + 4, W - 44, H - 22 - panelY, 6)}" fill="none" stroke="${g}" stroke-width=".6" opacity=".7"/>
      ${diamond(stack ? 150 : 105, panelY, 4, g)}`
          : f.panel ?? ''
      }
      ${textBlock}

      <!-- gilded QR frame (follows the QR wherever it is placed) -->
      <rect x="${q.x - 6}" y="${q.y - 6}" width="${q.size + 12}" height="${q.size + 12}" rx="3" fill="${g}"/>
      <rect x="${q.x - 6}" y="${q.y - 6}" width="${q.size + 12}" height="${q.size + 12}" rx="3" fill="url(#${sheen})"/>
      <rect x="${q.x - 3.5}" y="${q.y - 3.5}" width="${q.size + 7}" height="${q.size + 7}" rx="2" fill="none" stroke="${o.ink}" stroke-width=".8"/>
    `;
    return { back };
  };
}

interface ElegantEntry extends Omit<ElegantOpts, 'numeral'> {
  name: string;
  desc: string;
  title: string;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const ENTRIES: ElegantEntry[] = [
  { slug: 'sun-herald', name: 'Sun Herald', desc: 'Golden-haired youth before a sun wheel', title: 'Keeper of the dawn', gold: '#d4a537', ink: '#3a2a12' },
  { slug: 'violet-sage', name: 'Violet Sage', desc: 'Violet-haired sage in a black robe', title: 'Reader of old stars', gold: '#c9b28a', ink: '#1a1426' },
  { slug: 'forest-warden', name: 'Forest Warden', desc: 'Green-cloaked warden among branches', title: 'Guardian of the grove', gold: '#c8a75a', ink: '#14261c' },
  { slug: 'crimson-rose', name: 'Crimson Rose', desc: 'Red-haired noble framed by roses', title: 'Heart of the garden', gold: '#d4a24c', ink: '#2a0d0f' },
  { slug: 'silver-knight', name: 'Silver Knight', desc: 'Armoured knight before stained glass', title: 'Oath of the glass', gold: '#c9a54e', ink: '#14213a' },
  { slug: 'night-bloom', name: 'Night Bloom', desc: 'Dark-haired wanderer in a starry robe', title: 'Wanderer of dusk', gold: '#d6b25e', ink: '#0f1730' },
  { slug: 'star-queen', name: 'Star Queen', desc: 'Crowned queen under a golden halo', title: 'Crown of the night sky', gold: '#e0b860', ink: '#0e1838' },
  { slug: 'autumn-muse', name: 'Autumn Muse', desc: 'Copper-haired muse among maple leaves', title: 'Song of falling leaves', gold: '#d9a14a', ink: '#2a160b' },
  { slug: 'sea-pearl', name: 'Sea Pearl', desc: 'Pearl-crowned maiden and ocean waves', title: 'Daughter of the tide', gold: '#d8c08a', ink: '#0c2a2e' },
  { slug: 'sakura-muse', name: 'Sakura Muse', desc: 'Pink-haired muse with cherry blossoms', title: 'Spring in bloom', gold: '#d4a64e', ink: '#3a1620' },
  { slug: 'moon-maiden', name: 'Moon Maiden', desc: 'Silver-haired dreamer under a crescent moon', title: 'Dreamer under the moon', gold: '#d6c3a0', ink: '#1c1a36' },
  { slug: 'velvet-rose', name: 'Velvet Rose', desc: 'Rose-crowned lady in a gothic arch', title: 'Gothic rose garden', gold: '#d4a64c', ink: '#240b0e' },
];

export const ELEGANT_DESIGNS: CardDesign[] = ENTRIES.map((e, i) => ({
  id: `elegant-${e.slug}`,
  name: e.name,
  kind: 'elegant',
  desc: e.desc,
  w: W,
  h: H,
  radius: 14,
  artSrc: `/cards/elegant/${e.slug}.webp`,
  panelSlot: true,
  defaults: { name: 'Your Name', title: e.title, extra: `ELEGANT SERIES · ${ROMAN[i]}` },
  qr: QR,
  movable: { stack: { x: 115, y: 334, size: 70 } },
  accent: e.gold,
  draw: elegantCard({ ...e, numeral: ROMAN[i] }),
}));
