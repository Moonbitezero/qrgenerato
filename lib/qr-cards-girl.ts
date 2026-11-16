// lib/qr-cards-girl.ts
// "Retro Girl" cards: lo-fi pixel-art scenes (original artwork, served from /public/cards/girl)
// framed like a retro game screen: pixel hearts HUD, a level badge and an RPG dialogue box
// for the name, with a pixel QR frame. 3:4 format to match the artwork.

import type { CardDesign, CardFields, CardPlacement } from './qr-cards';

type Id = (n: string) => string;

const W = 300;
const H = 400;
const MONO = "'Courier New', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(x: number, y: number, value: string, o: { size: number; fill: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number; shadow?: string }): string {
  const est = value.length * o.size * 0.62 + (o.spacing ?? 0) * value.length;
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  const attrs = (dx: number) =>
    `x="${x + dx}" y="${y + dx}" font-family="${MONO}" font-size="${o.size}" font-weight="${o.weight ?? 700}" text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${fit}`;
  const shadow = o.shadow ? `<text ${attrs(1.5)} fill="${o.shadow}">${esc(value)}</text>` : '';
  return `${shadow}<text ${attrs(0)} fill="${o.fill}">${esc(value)}</text>`;
}

/** Rectangle with stepped (pixel) corners. */
function pixelRect(x: number, y: number, w: number, h: number, s: number): string {
  return `M${x + s},${y} H${x + w - s} V${y + s} H${x + w} V${y + h - s} H${x + w - s} V${y + h} H${x + s} V${y + h - s} H${x} V${y + s} H${x + s} Z`;
}

const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

/** 7×6 pixel heart; `empty` draws the outline-only "lost life" version. */
function pixelHeart(x: number, y: number, s: number, fill: string, empty = false): string {
  let d = '';
  HEART.forEach((row, r) =>
    [...row].forEach((c, col) => {
      if (c === 'X') d += `M${x + col * s},${y + r * s}h${s}v${s}h-${s}Z`;
    })
  );
  return `<path d="${d}" fill="${empty ? '#ffffff33' : fill}"/>`;
}

interface GirlOpts {
  slug: string;
  /** Hearts, frame accents and the extra line */
  accent: string;
  /** Frame colour */
  frame: string;
  /** Dialogue box fill */
  box: string;
  level: number;
}

const QR = { x: 200, y: 303, size: 72, plate: '#ffffff', radius: 2 };

function girlCard(o: GirlOpts) {
  return (f: CardFields, id: Id, place: CardPlacement) => {
    const href = f.art ?? `/cards/girl/${o.slug}-thumb.webp`;
    const scan = id('scan');
    const glow = id('glow');
    const q = place.qr;
    const stack = place.layout === 'stack';
    const boxY = stack ? 222 : 292;
    const lv = `LV.${String(o.level).padStart(2, '0')}`;
    const textBlock = stack
      ? `${txt(W / 2, 252, f.name, { size: 17, fill: '#fff7fb', weight: 800, anchor: 'middle', max: 236, shadow: '#00000099' })}
         ${txt(W / 2, 269, f.title, { size: 9.5, fill: '#f3e8ff', anchor: 'middle', max: 236 })}
         ${txt(W / 2, 374, f.extra, { size: 8, fill: o.accent, weight: 800, spacing: 1.2, anchor: 'middle', max: 236 })}`
      : `${txt(28, 324, f.name, { size: 17, fill: '#fff7fb', weight: 800, max: 152, shadow: '#00000099' })}
         ${txt(28, 342, f.title, { size: 9.5, fill: '#f3e8ff', max: 152 })}
         ${txt(28, 366, f.extra, { size: 8, fill: o.accent, weight: 800, spacing: 1.2, max: 152 })}
         <path d="M168,368 h8 l-4,5 Z" fill="${o.accent}"/>`;
    const back = `
      <defs>
        <pattern id="${scan}" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".08"/></pattern>
        <radialGradient id="${glow}" cx=".5" cy=".42" r=".78">
          <stop offset=".62" stop-color="#1e1030" stop-opacity="0"/>
          <stop offset="1" stop-color="#1e1030" stop-opacity=".42"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="${o.box}"/>
      <image href="${href}" xlink:href="${href}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
      <rect width="${W}" height="${H}" fill="url(#${scan})"/>
      <rect width="${W}" height="${H}" fill="url(#${glow})"/>

      <!-- HUD: hearts + level badge -->
      <path d="${pixelRect(16, 16, 74, 20, 3)}" fill="#1e1030" fill-opacity=".72" stroke="${o.frame}" stroke-width="1.5"/>
      ${pixelHeart(22, 20.6, 1.8, o.accent)}${pixelHeart(38, 20.6, 1.8, o.accent)}${pixelHeart(54, 20.6, 1.8, o.accent)}${pixelHeart(70, 20.6, 1.8, o.accent, true)}
      <path d="${pixelRect(W - 74, 16, 58, 20, 3)}" fill="#1e1030" fill-opacity=".72" stroke="${o.frame}" stroke-width="1.5"/>
      ${txt(W - 45, 30.5, lv, { size: 10, fill: '#fff7fb', weight: 800, anchor: 'middle', spacing: 1 })}

      <!-- pixel frame: outer edge sits exactly on the card's 14px rounded corner -->
      <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="10" fill="none" stroke="${o.frame}" stroke-width="8"/>
      <rect x="8.5" y="8.5" width="${W - 17}" height="${H - 17}" rx="6" fill="none" stroke="#1e1030" stroke-width="1.5" opacity=".6"/>
      <path d="M10,10 h6 v3 h-3 v3 h-3 Z M${W - 10},10 h-6 v3 h3 v3 h3 Z M10,${H - 10} h6 v-3 h-3 v-3 h-3 Z M${W - 10},${H - 10} h-6 v-3 h3 v-3 h3 Z" fill="${o.accent}"/>

      <!-- RPG dialogue box -->
      <path d="${pixelRect(16, boxY, W - 32, H - 14 - boxY, 5)}" fill="${o.box}" fill-opacity=".88" stroke="${o.frame}" stroke-width="2.5"/>
      <path d="${pixelRect(21, boxY + 5, W - 42, H - 24 - boxY, 3)}" fill="none" stroke="${o.accent}" stroke-width="1" opacity=".8"/>
      ${textBlock}

      <!-- pixel QR frame (follows the QR wherever it is placed) -->
      <path d="${pixelRect(q.x - 7, q.y - 7, q.size + 14, q.size + 14, 4)}" fill="${o.frame}" stroke="#1e1030" stroke-width="1.5"/>
      <path d="${pixelRect(q.x - 4, q.y - 4, q.size + 8, q.size + 8, 2)}" fill="none" stroke="${o.accent}" stroke-width="1.5"/>
    `;
    return { back };
  };
}

interface GirlEntry extends Omit<GirlOpts, 'level'> {
  name: string;
  desc: string;
  title: string;
}

const ENTRIES: GirlEntry[] = [
  { slug: 'arcade-frog', name: 'Arcade Frog', desc: 'Frog-hat gamer at the arcade', title: 'Insert coin to continue', accent: '#f472b6', frame: '#e9d5ff', box: '#2a1740' },
  { slug: 'fox-mask', name: 'Fox Mask', desc: 'Fox mask and fan at a lantern festival', title: 'Lantern night festival', accent: '#f87171', frame: '#fecaca', box: '#1c1530' },
  { slug: 'rooftop-sunset', name: 'Rooftop Sunset', desc: 'Headphones and skateboard at sunset', title: 'Skate & chill', accent: '#f9a8d4', frame: '#f5d0fe', box: '#2b1840' },
  { slug: 'sakura-snap', name: 'Sakura Snap', desc: 'Photographer under cherry blossoms', title: 'Spring photo walk', accent: '#f472b6', frame: '#fce7f3', box: '#2d1a3d' },
  { slug: 'kimono-arcade', name: 'Kimono Arcade', desc: 'Kimono girl among arcade cabinets', title: 'High score dreams', accent: '#fb7185', frame: '#fbcfe8', box: '#26163a' },
  { slug: 'seaside-station', name: 'Seaside Station', desc: 'Waiting at a seaside train stop', title: 'Waiting for summer', accent: '#fda4af', frame: '#ffe4e6', box: '#2a1a36' },
  { slug: 'golden-dusk', name: 'Golden Dusk', desc: 'Orange-haired girl on a rooftop at dusk', title: 'Wind in my hair', accent: '#fdba74', frame: '#fed7aa', box: '#2b1730' },
  { slug: 'cassette-room', name: 'Cassette Room', desc: 'Lo-fi bedroom with cassettes and CRT', title: 'Mixtape memories', accent: '#fb7185', frame: '#fecdd3', box: '#2a1424' },
  { slug: 'night-laundry', name: 'Night Laundry', desc: 'Reading manga at a late-night laundromat', title: 'Spin cycle stories', accent: '#c4b5fd', frame: '#ede9fe', box: '#221a3a' },
  { slug: 'rain-train', name: 'Rain Train', desc: 'Window seat on a rainy train', title: 'Window seat daydream', accent: '#93c5fd', frame: '#dbeafe', box: '#1c1f38' },
  { slug: 'greenhouse', name: 'Greenhouse', desc: 'Flowers and butterflies in a greenhouse', title: 'Petals & butterflies', accent: '#f9a8d4', frame: '#fce7f3', box: '#2a1e2e' },
  { slug: 'harbor-breeze', name: 'Harbor Breeze', desc: 'Sea wall, lighthouse and sailboats', title: 'Summer sea breeze', accent: '#5eead4', frame: '#ccfbf1', box: '#15283a' },
];

export const GIRL_DESIGNS: CardDesign[] = ENTRIES.map((e, i) => ({
  id: `girl-${e.slug}`,
  name: e.name,
  kind: 'girl',
  desc: e.desc,
  w: W,
  h: H,
  radius: 14,
  artSrc: `/cards/girl/${e.slug}.webp`,
  defaults: { name: 'Your Name', title: e.title, extra: `PLAYER 1 · STAGE ${String(i + 1).padStart(2, '0')}` },
  qr: QR,
  movable: { stack: { x: 118, y: 282, size: 64 } },
  accent: e.accent,
  draw: girlCard({ ...e, level: (i * 7) % 90 + 7 }),
}));
