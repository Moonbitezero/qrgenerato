// lib/qr-cards-vintage.ts
// "Vintage" cards: blueprints, botanical plates, old posters, records and collages (original
// artwork, served from /public/cards/vintage) inside a cream printed border with a museum /
// archive label for the name and crop-mark corners around the QR.

import type { CardDesign, CardFields, CardPlacement } from './qr-cards';

type Id = (n: string) => string;

const W = 300;
const H = 450;
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "'Courier New', ui-monospace, Menlo, Consolas, monospace";
const PAPER = '#f4ecd8';
const INK = '#231c14';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(x: number, y: number, value: string, o: { size: number; fill: string; font?: string; weight?: number; italic?: boolean; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number }): string {
  const est = value.length * o.size * ((o.font === MONO ? 0.62 : 0.56) + (o.spacing ? o.spacing / o.size : 0));
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-family="${o.font ?? SERIF}" font-size="${o.size}" font-weight="${o.weight ?? 400}"${o.italic ? ' font-style="italic"' : ''} text-anchor="${o.anchor ?? 'start'}"${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${fit} fill="${o.fill}">${esc(value)}</text>`;
}

/** Four L-shaped printer's crop marks around a box. */
function cropMarks(x: number, y: number, s: number, gap: number, len: number, stroke: string): string {
  const a = x - gap;
  const b = y - gap;
  const c = x + s + gap;
  const d = y + s + gap;
  return `<path d="M${a},${b + len} V${b} H${a + len} M${c - len},${b} H${c} V${b + len} M${c},${d - len} V${d} H${c - len} M${a + len},${d} H${a} V${d - len}" fill="none" stroke="${stroke}" stroke-width="1.4"/>`;
}

interface VintageOpts {
  slug: string;
  /** Rules, extra line and the small tab on the label */
  accent: string;
}

const QR = { x: 198, y: 346, size: 72, plate: '#ffffff', radius: 1 };

function vintageCard(o: VintageOpts, cat: string) {
  return (f: CardFields, id: Id, place: CardPlacement) => {
    const href = f.art ?? `/cards/vintage/${o.slug}-thumb.webp`;
    const clip = id('clip');
    const a = o.accent;
    const q = place.qr;
    const stack = place.layout === 'stack';
    const panelY = stack ? 262 : 332;
    const textBlock = stack
      ? `${txt(W / 2, 297, f.name, { size: 18, fill: INK, weight: 700, anchor: 'middle', spacing: 0.4, max: 230 })}
         <path d="M90,306 H210 M90,309 H210" stroke="${a}" stroke-width=".8"/>
         ${txt(W / 2, 324, f.title, { size: 10.5, fill: '#4a3b2a', italic: true, anchor: 'middle', max: 230 })}
         ${txt(W / 2, 428, f.extra, { size: 7.5, fill: a, font: MONO, weight: 700, spacing: 1.4, anchor: 'middle', max: 230 })}`
      : `${txt(30, 368, f.name, { size: 18, fill: INK, weight: 700, spacing: 0.4, max: 152 })}
         <path d="M30,377 H178 M30,380 H178" stroke="${a}" stroke-width=".8"/>
         ${txt(30, 396, f.title, { size: 10.5, fill: '#4a3b2a', italic: true, max: 152 })}
         ${txt(30, 421, f.extra, { size: 7.5, fill: a, font: MONO, weight: 700, spacing: 1.4, max: 152 })}`;
    const back = `
      <defs><clipPath id="${clip}"><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="5"/></clipPath></defs>
      <rect width="${W}" height="${H}" fill="${PAPER}"/>
      <image href="${href}" xlink:href="${href}" x="8" y="8" width="${W - 16}" height="${H - 16}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clip})"/>

      <!-- printed cream border: outer edge sits on the card's 14px rounded corner -->
      <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" rx="10.5" fill="none" stroke="${PAPER}" stroke-width="7"/>
      <rect x="8.5" y="8.5" width="${W - 17}" height="${H - 17}" rx="5" fill="none" stroke="${INK}" stroke-width="1"/>

      <!-- archive label -->
      <rect x="16" y="${panelY}" width="${W - 32}" height="${H - 14 - panelY}" rx="2" fill="${PAPER}" fill-opacity=".97" stroke="${INK}" stroke-width="1.3"/>
      <rect x="19.5" y="${panelY + 3.5}" width="${W - 39}" height="${H - 21 - panelY}" rx="1" fill="none" stroke="${INK}" stroke-width=".5"/>
      <path d="M${W / 2 - 34},${panelY} h68 v-11 h-68 Z" fill="${INK}"/>
      ${txt(W / 2, panelY - 3, cat, { size: 7, fill: PAPER, font: MONO, weight: 700, anchor: 'middle', spacing: 1.2 })}
      ${textBlock}

      <!-- QR with printer's crop marks (follows the QR wherever it is placed) -->
      <rect x="${q.x - 4}" y="${q.y - 4}" width="${q.size + 8}" height="${q.size + 8}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/>
      ${cropMarks(q.x, q.y, q.size, 8, 9, a)}
    `;
    return { back };
  };
}

interface VintageEntry extends VintageOpts {
  name: string;
  desc: string;
  title: string;
}

const RUST = '#a3401c';
const NAVY = '#1f3a5f';
const TEAL = '#1d6b66';
const RED = '#b3261e';
const MUSTARD = '#9a6b05';
const OLIVE = '#4d5a24';
const PLUM = '#6b2d5c';

const ENTRIES: VintageEntry[] = [
  { slug: 'weather-atlas', name: 'Weather Atlas', desc: 'Clouds, barometers and an old weather chart', title: 'Clouds & barometers', accent: NAVY },
  { slug: 'paper-theatre', name: 'Paper Theatre', desc: 'Toy theatre stage with velvet curtains', title: 'Curtain up tonight', accent: RED },
  { slug: 'gear-blueprint', name: 'Gear Blueprint', desc: 'Mechanical gears on a blueprint', title: 'Mechanical drawings', accent: NAVY },
  { slug: 'clockwork-plan', name: 'Clockwork Plan', desc: 'Clockwork engineering draft', title: 'Engineering draft', accent: RUST },
  { slug: 'botanical-study', name: 'Botanical Study', desc: 'Red flower specimen plate', title: 'Specimen plate', accent: OLIVE },
  { slug: 'pixel-world', name: 'Pixel World', desc: 'Retro floppy-disk game cover', title: 'Insert disk 1', accent: NAVY },
  { slug: 'pixel-disk', name: 'Pixel Disk', desc: 'Retro computer disk label', title: 'Save game · 1.44 MB', accent: RUST },
  { slug: 'motel-key', name: 'Motel Key', desc: 'Retro motel key tag and palm trees', title: 'Check-in anytime', accent: TEAL },
  { slug: 'cyanotype-fern', name: 'Cyanotype Ferns', desc: 'Sun-printed blue fern cyanotype', title: 'Sun-printed botanicals', accent: NAVY },
  { slug: 'rainy-film', name: 'Rainy Film', desc: 'Contact sheet of rainy night photos', title: 'Contact sheet nights', accent: MUSTARD },
  { slug: 'matchbox', name: 'Matchbox Bloom', desc: 'Vintage matchbox with flowers', title: 'Strike a light', accent: RUST },
  { slug: 'specimen-sketch', name: 'Museum Specimen', desc: 'Fossil specimen field drawing', title: 'Field notes', accent: OLIVE },
  { slug: 'form-colour', name: 'Form & Colour', desc: 'Modernist shapes print', title: 'Modernist print', accent: RED },
  { slug: 'bauhaus-sun', name: 'Bauhaus Sun', desc: 'Red sun and geometric blocks', title: 'Shape study', accent: NAVY },
  { slug: 'record-store', name: 'Record Store', desc: 'Record store vinyl poster', title: 'Crate digging', accent: RUST },
  { slug: 'vinyl-collage', name: 'Vinyl Collage', desc: 'Records and liner-note collage', title: 'B-sides & liner notes', accent: TEAL },
  { slug: 'mission-rocket', name: 'Mission Control', desc: 'Retro space rocket poster', title: 'T-minus 10', accent: RUST },
  { slug: 'space-voyage', name: 'Space Voyage', desc: 'Retro starship and orbit chart', title: 'Orbit plotted', accent: RED },
  { slug: 'wildflower-sheet', name: 'Wildflower Sheet', desc: 'Yellow wildflower botanical sketch', title: 'Pressed meadow', accent: OLIVE },
  { slug: 'meadow-notes', name: 'Meadow Notes', desc: 'Herbarium page of meadow flowers', title: 'Herbarium page', accent: MUSTARD },
  { slug: 'midnight-cinema', name: 'Midnight Cinema', desc: 'Film reel between red curtains', title: 'Late show tonight', accent: RED },
  { slug: 'film-reel', name: 'Film Reel', desc: 'Vintage cinema ticket poster', title: 'Now showing', accent: RED },
  { slug: 'world-wonder', name: 'World of Wonder', desc: 'Travel scrapbook with maps', title: 'Travel scrapbook', accent: NAVY },
  { slug: 'nineties-style', name: '90s Style', desc: 'Memphis-style 90s pattern', title: 'Memphis pattern', accent: TEAL },
  { slug: 'eighties-mix', name: '80s Mix', desc: 'Mixtape cassette poster', title: 'Side A · rewind', accent: RED },
  { slug: 'reel-mix', name: 'Reel Mix', desc: 'Reel-to-reel tape poster', title: 'Press play', accent: PLUM },
  { slug: 'sepia-bicycle', name: 'Sepia Bicycle', desc: 'Sepia sketchbook with a bicycle', title: 'Old town journal', accent: RUST },
  { slug: 'paper-collage', name: 'Paper Collage', desc: 'Torn newspaper and colour collage', title: 'Torn headlines', accent: NAVY },
  { slug: 'press-collage', name: 'Press Collage', desc: 'Cut-and-paste newsprint collage', title: 'Cut & paste', accent: RED },
  { slug: 'groovy-vinyl', name: 'Groovy Vinyl', desc: 'Vinyl record on psychedelic swirls', title: 'Psychedelic grooves', accent: RUST },
  { slug: 'underground-gig', name: 'Underground Gig', desc: 'Underground music gig poster', title: 'Access all areas', accent: NAVY },
];

export const VINTAGE_DESIGNS: CardDesign[] = ENTRIES.map((e, i) => {
  const no = String(i + 1).padStart(3, '0');
  return {
    id: `vintage-${e.slug}`,
    name: e.name,
    kind: 'vintage',
    desc: e.desc,
    w: W,
    h: H,
    radius: 14,
    artSrc: `/cards/vintage/${e.slug}.webp`,
    defaults: { name: 'Your Name', title: e.title, extra: `CAT. No. ${no} · EST. 1974` },
    qr: QR,
    movable: { stack: { x: 117, y: 340, size: 64 } },
    accent: e.accent,
    draw: vintageCard(e, `ARCHIVE ${no}`),
  };
});
