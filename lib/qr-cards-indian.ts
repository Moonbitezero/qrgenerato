// lib/qr-cards-indian.ts
// "Indian" cards: vintage travel posters and folk-art pieces (original artwork, served from
// /public/cards/indian) inside a block-print border with dotted trim, a Mughal-style scalloped
// name panel and a coloured QR frame.

import type { CardDesign, CardFields, CardPlacement } from './qr-cards';

type Id = (n: string) => string;

const W = 300;
const H = 450;
const SERIF = "Georgia, 'Times New Roman', 'Noto Serif', serif";
const PAPER = '#fbf3e0';
const INK = '#2b1a10';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(x: number, y: number, value: string, o: { size: number; fill: string; weight?: number; italic?: boolean; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number }): string {
  const est = value.length * o.size * (0.55 + (o.spacing ? o.spacing / o.size : 0));
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-family="${SERIF}" font-size="${o.size}" font-weight="${o.weight ?? 400}"${o.italic ? ' font-style="italic"' : ''} text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${fit} fill="${o.fill}">${esc(value)}</text>`;
}

/** Panel whose top edge is a row of scallops (Mughal multifoil arch feel); bottom corners rounded. */
function scallopPanel(x: number, y: number, w: number, h: number, n: number): string {
  const step = w / n;
  const r = step / 2;
  let d = `M${x},${y + r}`;
  for (let i = 0; i < n; i++) d += ` A${r},${r} 0 0 1 ${x + step * (i + 1)},${y + r}`;
  return `${d} V${y + h - 6} Q${x + w},${y + h} ${x + w - 6},${y + h} H${x + 6} Q${x},${y + h} ${x},${y + h - 6} Z`;
}

/** Tiny four-petal flower used as an ornament. */
function bloom(cx: number, cy: number, r: number, fill: string, centre: string): string {
  return `<g fill="${fill}"><circle cx="${cx}" cy="${cy - r}" r="${r * 0.62}"/><circle cx="${cx}" cy="${cy + r}" r="${r * 0.62}"/><circle cx="${cx - r}" cy="${cy}" r="${r * 0.62}"/><circle cx="${cx + r}" cy="${cy}" r="${r * 0.62}"/></g><circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="${centre}"/>`;
}

interface IndianOpts {
  slug: string;
  /** Border, QR frame and the extra line */
  accent: string;
}

const QR = { x: 198, y: 345, size: 72, plate: '#ffffff', radius: 2 };

function indianCard(o: IndianOpts) {
  return (f: CardFields, id: Id, place: CardPlacement) => {
    const href = f.art ?? `/cards/indian/${o.slug}-thumb.webp`;
    const clip = id('clip');
    const a = o.accent;
    const q = place.qr;
    const stack = place.layout === 'stack';
    const panelY = stack ? 262 : 330;
    const tx = stack ? W / 2 : 32;
    const anchor = stack ? 'middle' : 'start';
    const max = stack ? 228 : 152;
    const textBlock = stack
      ? `${txt(tx, 300, f.name, { size: 19, fill: INK, weight: 700, anchor, max })}
         <path d="M98,310 H140 M160,310 H202" stroke="${a}" stroke-width=".9"/>${bloom(150, 310, 3, a, PAPER)}
         ${txt(tx, 327, f.title, { size: 10.5, fill: '#5b4030', italic: true, anchor, max })}
         ${txt(tx, 427, f.extra, { size: 7.5, fill: a, weight: 700, spacing: 1.8, anchor, max })}`
      : `${txt(tx, 370, f.name, { size: 19, fill: INK, weight: 700, max })}
         <path d="M32,380 H82 M96,380 H146" stroke="${a}" stroke-width=".9"/>${bloom(89, 380, 3, a, PAPER)}
         ${txt(tx, 398, f.title, { size: 10.5, fill: '#5b4030', italic: true, max })}
         ${txt(tx, 421, f.extra, { size: 7.5, fill: a, weight: 700, spacing: 1.8, max })}`;
    const back = `
      <defs><clipPath id="${clip}"><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6"/></clipPath></defs>
      <rect width="${W}" height="${H}" fill="${PAPER}"/>
      <image href="${href}" xlink:href="${href}" x="10" y="10" width="${W - 20}" height="${H - 20}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clip})"/>

      <!-- block-print border: outer edge sits on the card's 14px rounded corner -->
      <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="10.5" fill="none" stroke="${a}" stroke-width="7"/>
      <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="10.5" fill="none" stroke="${PAPER}" stroke-width="1.6" stroke-dasharray="0.01 5" stroke-linecap="round"/>
      <rect x="10.5" y="10.5" width="${W - 21}" height="${H - 21}" rx="6" fill="none" stroke="${a}" stroke-width="1.5"/>
      ${bloom(18, 18, 3.2, a, PAPER)}${bloom(W - 18, 18, 3.2, a, PAPER)}${bloom(18, H - 18, 3.2, a, PAPER)}${bloom(W - 18, H - 18, 3.2, a, PAPER)}

      <!-- scalloped name panel -->
      <path d="${scallopPanel(18, panelY, W - 36, H - 14 - panelY, 12)}" fill="${PAPER}" fill-opacity=".96" stroke="${a}" stroke-width="1.6"/>
      <path d="M26,${panelY + 19} H${W - 26} M26,${H - 20} H${W - 26}" stroke="${a}" stroke-width=".6" stroke-dasharray="1 3" opacity=".8"/>
      ${bloom(150, panelY - 1, 4, a, PAPER)}
      ${textBlock}

      <!-- QR frame (follows the QR wherever it is placed) -->
      <rect x="${q.x - 6}" y="${q.y - 6}" width="${q.size + 12}" height="${q.size + 12}" rx="3" fill="${a}"/>
      <rect x="${q.x - 4.5}" y="${q.y - 4.5}" width="${q.size + 9}" height="${q.size + 9}" rx="2" fill="none" stroke="${PAPER}" stroke-width=".9" stroke-dasharray="0.01 3" stroke-linecap="round"/>
    `;
    return { back };
  };
}

interface IndianEntry extends IndianOpts {
  name: string;
  desc: string;
  title: string;
}

const MAROON = '#8b1e1e';
const SAFFRON = '#b4470f';
const TEAL = '#0f5e5a';
const LEAF = '#2f5233';
const INDIGO = '#1e3a5f';
const GOLD = '#9a6a0b';

const ENTRIES: IndianEntry[] = [
  { slug: 'hill-railway', name: 'Hill Railway', desc: 'Toy train through misty tea hills', title: 'Toy train to the tea hills', accent: LEAF },
  { slug: 'memorial-gardens', name: 'Memorial Gardens', desc: 'White marble memorial and reflecting pool', title: 'Evening by the reflecting pool', accent: TEAL },
  { slug: 'sandstone-gate', name: 'Sandstone Gate', desc: 'Grand red sandstone gateway and steps', title: 'Steps of red sandstone', accent: MAROON },
  { slug: 'royal-steps', name: 'Royal Steps', desc: 'Domed gateway above a long stairway', title: 'Gateway of the kings', accent: SAFFRON },
  { slug: 'stone-pillars', name: 'Stone Pillars', desc: 'Rock-cut pillared hall', title: 'Carved in living rock', accent: INDIGO },
  { slug: 'cave-temple', name: 'Cave Temple', desc: 'Temple seen through an ancient arch', title: 'Through the ancient arch', accent: LEAF },
  { slug: 'ancient-stupa', name: 'Ancient Stupa', desc: 'Stupa framed by a carved doorway', title: 'Stillness of the stupa', accent: SAFFRON },
  { slug: 'temple-courtyard', name: 'Temple Courtyard', desc: 'Sunlit temple courtyard', title: 'Afternoon at the temple', accent: GOLD },
  { slug: 'golden-temple', name: 'Golden Temple', desc: 'Golden shrine reflected in the pool', title: 'Reflections in gold', accent: GOLD },
  { slug: 'pink-city', name: 'Pink City Gate', desc: 'Pink city gate with elephants', title: 'Welcome to the pink city', accent: MAROON },
  { slug: 'taj-mahal', name: 'Taj Mahal', desc: 'Marble mausoleum and cypress garden', title: 'A monument to love', accent: TEAL },
  { slug: 'river-ghats', name: 'River Ghats', desc: 'Stone ghats and boats at dawn', title: 'Dawn on the holy river', accent: SAFFRON },
  { slug: 'lake-palace', name: 'Lake Palace', desc: 'White palace through a carved arch', title: 'Palace on the lake', accent: TEAL },
  { slug: 'grand-gateway', name: 'Grand Gateway', desc: 'Red gateway with tall minarets', title: 'Old city gateway', accent: MAROON },
  { slug: 'warli-village', name: 'Warli Village', desc: 'Warli-style village life', title: 'Warli folk art', accent: SAFFRON },
  { slug: 'tiger-forest', name: 'Tiger Forest', desc: 'Folk-art tiger in a flowering forest', title: 'Spirit of the jungle', accent: LEAF },
  { slug: 'sun-temple', name: 'Sun Temple', desc: 'Temple tower under a golden sun', title: 'Temple under the sun', accent: LEAF },
  { slug: 'mandala-print', name: 'Mandala Print', desc: 'Hand block-printed mandala', title: 'Hand block print', accent: MAROON },
  { slug: 'kitchen-cat', name: 'Kitchen Cat', desc: 'Black cat eyeing the fish curry', title: 'The fish curry thief', accent: SAFFRON },
  { slug: 'lotus-elephant', name: 'Lotus Elephant', desc: 'Elephant among lotus blooms', title: 'Blessings & lotus', accent: LEAF },
  { slug: 'palace-court', name: 'Palace Court', desc: 'Miniature-style royal court', title: 'Royal court miniature', accent: TEAL },
  { slug: 'silk-saree', name: 'Silk Saree', desc: 'Woven silk saree with elephants', title: 'Woven heritage', accent: MAROON },
  { slug: 'tree-of-life', name: 'Tree of Life', desc: 'Tribal tree of life', title: 'Tree of life', accent: SAFFRON },
  { slug: 'deer-tree', name: 'Deer Tree', desc: 'Dotted tree with deer and birds', title: 'Forest of deer', accent: TEAL },
  { slug: 'warli-dance', name: 'Warli Dance', desc: 'Warli-style harvest dance', title: 'Harvest dance', accent: SAFFRON },
  { slug: 'bird-garden', name: 'Bird Garden', desc: 'Birds and butterflies in a garden border', title: 'Garden of birds', accent: LEAF },
];

export const INDIAN_DESIGNS: CardDesign[] = ENTRIES.map((e, i) => ({
  id: `indian-${e.slug}`,
  name: e.name,
  kind: 'indian',
  desc: e.desc,
  w: W,
  h: H,
  radius: 14,
  artSrc: `/cards/indian/${e.slug}.webp`,
  defaults: { name: 'Your Name', title: e.title, extra: `INDIA SERIES · No. ${String(i + 1).padStart(2, '0')}` },
  qr: QR,
  movable: { stack: { x: 117, y: 340, size: 66 } },
  draw: indianCard(e),
}));
