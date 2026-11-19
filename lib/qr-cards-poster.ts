// lib/qr-cards-poster.ts
// "Art Posters" cards: full-bleed screen-print style poster artwork (served from /public/cards/poster)
// finished like a gallery print — fine cream border with crop marks, a dark fade for the caption,
// and the QR on a cream "gallery label" plate.

import type { CardDesign, CardFields, CardPlacement } from './qr-cards';

type Id = (n: string) => string;

const W = 300;
const H = 450;
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const CREAM = '#fbf5e9';

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string);
}

function txt(
  x: number,
  y: number,
  value: string,
  o: { size: number; fill: string; weight?: number; family?: string; anchor?: 'start' | 'middle' | 'end'; spacing?: number; max?: number; italic?: boolean }
): string {
  const est = value.length * o.size * 0.56;
  const fit = o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" font-family="${o.family ?? SANS}" font-size="${o.size}" font-weight="${o.weight ?? 600}" fill="${o.fill}" text-anchor="${o.anchor ?? 'start'}"${
    o.spacing ? ` letter-spacing="${o.spacing}"` : ''
  }${o.italic ? ' font-style="italic"' : ''}${fit} paint-order="stroke" stroke="#000" stroke-opacity=".25" stroke-width=".6">${esc(value)}</text>`;
}

/** Small L-shaped crop marks just inside each corner, like a fine-art print. */
function cropMarks(color: string): string {
  const m = 16;
  const l = 9;
  const c = [
    [m, m, 1, 1],
    [W - m, m, -1, 1],
    [m, H - m, 1, -1],
    [W - m, H - m, -1, -1],
  ];
  return c.map(([x, y, sx, sy]) => `<path d="M${x},${y + sy * l} V${y} H${x + sx * l}" fill="none" stroke="${color}" stroke-width="1.2" opacity=".85"/>`).join('');
}

interface PosterOpts {
  slug: string;
  name: string;
  /** Accent sampled from the artwork: caption line, QR hairline */
  accent: string;
  /** Dark tone of the caption fade */
  shade: string;
}

const QR = { x: 198, y: 330, size: 84, plate: CREAM, radius: 3 };

function posterCard(o: PosterOpts) {
  return (f: CardFields, id: Id, place: CardPlacement) => {
    const q = place.qr;
    const stack = place.layout === 'stack';
    const fadeY = stack ? 190 : 262;
    const href = f.art ?? `/cards/poster/${o.slug}-thumb.webp`;
    const fade = id('fade');
    const grain = id('grain');
    const back = `
      <defs>
        <linearGradient id="${fade}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${o.shade}" stop-opacity="0"/>
          <stop offset=".5" stop-color="${o.shade}" stop-opacity=".7"/>
          <stop offset="1" stop-color="${o.shade}" stop-opacity=".94"/>
        </linearGradient>
        <pattern id="${grain}" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".45" fill="#fff" opacity=".07"/><circle cx="4" cy="3.5" r=".4" fill="#000" opacity=".08"/>
        </pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="${o.shade}"/>
      <image href="${href}" xlink:href="${href}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
      <rect width="${W}" height="${H}" fill="url(#${grain})"/>
      <rect x="0" y="${fadeY}" width="${W}" height="${H - fadeY}" fill="url(#${fade})"/>

      <!-- gallery print border + crop marks -->
      <rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="9" fill="none" stroke="${CREAM}" stroke-width="2" opacity=".9"/>
      ${cropMarks(CREAM)}

      <!-- caption -->
      ${
        stack
          ? `<rect x="${W / 2 - 14}" y="262" width="28" height="2" fill="${o.accent}"/>
      ${txt(W / 2, 292, f.name, { size: 21, fill: CREAM, weight: 700, family: SERIF, anchor: 'middle', max: 240 })}
      ${txt(W / 2, 311, f.title, { size: 10.5, fill: '#f4efe6', weight: 500, family: SERIF, italic: true, anchor: 'middle', max: 240 })}
      ${txt(W / 2, 330, f.extra, { size: 7.5, fill: o.accent, weight: 800, spacing: 2, anchor: 'middle', max: 240 })}`
          : `<rect x="24" y="352" width="28" height="2" fill="${o.accent}"/>
      ${txt(24, 380, f.name, { size: 21, fill: CREAM, weight: 700, family: SERIF, max: 160 })}
      ${txt(24, 399, f.title, { size: 10.5, fill: '#f4efe6', weight: 500, family: SERIF, italic: true, max: 160 })}
      ${txt(24, 421, f.extra, { size: 7.5, fill: o.accent, weight: 800, spacing: 2, max: 160 })}`
      }

      <!-- gallery label behind the QR -->
      <rect x="${q.x - 8}" y="${q.y - 8}" width="${q.size + 16}" height="${q.size + 26}" rx="5" fill="${CREAM}" stroke="#00000033" stroke-width="1"/>
      <rect x="${q.x - 4}" y="${q.y - 4}" width="${q.size + 8}" height="${q.size + 8}" rx="3" fill="none" stroke="${o.accent}" stroke-width="1.2"/>
      ${`<text x="${q.x + q.size / 2}" y="${q.y + q.size + 13.5}" font-family="${SANS}" font-size="6.5" font-weight="800" fill="#3f3a33" text-anchor="middle" letter-spacing="2">SCAN ME</text>`}
    `;
    return { back };
  };
}

interface PosterEntry extends PosterOpts {
  desc: string;
  title: string;
}

const ENTRIES: PosterEntry[] = [
  { slug: 'wind-strokes', name: 'Wind Strokes', desc: 'Sweeping brush strokes, ember sparks', title: 'Gallery night', accent: '#f87171', shade: '#16211b' },
  { slug: 'city-veins', name: 'City Veins', desc: 'Map city with red rivers and planets', title: 'Urban stories', accent: '#ef4444', shade: '#1a2547' },
  { slug: 'night-panels', name: 'Night Panels', desc: 'Six moody panels, crow and clock', title: 'Short story club', accent: '#fb923c', shade: '#0d0d10' },
  { slug: 'paper-waves', name: 'Paper Waves', desc: 'Paper-cut ocean, fish and ship', title: 'Ocean adventures', accent: '#fb7c64', shade: '#0b2443' },
  { slug: 'desert-pool', name: 'Desert Pool', desc: 'Lonely pool in an orange desert', title: 'Summer by the pool', accent: '#2dd4bf', shade: '#32200f' },
  { slug: 'moon-hallway', name: 'Moon Hallway', desc: 'Purple hallway, stairs to the moon', title: 'Dream gallery', accent: '#c084fc', shade: '#130f17' },
  { slug: 'green-gust', name: 'Green Gust', desc: 'Leaves blown across deep green', title: 'Autumn breeze', accent: '#fca5a5', shade: '#10231a' },
  { slug: 'glass-garden', name: 'Glass Garden', desc: 'A world of flowers inside a glass', title: 'Little worlds', accent: '#f9a8b4', shade: '#0e1c1f' },
  { slug: 'balcony-blooms', name: 'Balcony Blooms', desc: 'Colourful windows and balcony flowers', title: 'City apartment', accent: '#facc15', shade: '#1c2236' },
  { slug: 'city-heart', name: 'City Heart', desc: 'Blueprint city with a red heart', title: 'The pulse of the city', accent: '#ef4444', shade: '#18203b' },
  { slug: 'paper-town', name: 'Paper Town', desc: 'Layered paper hill town', title: 'Hometown memories', accent: '#f59e0b', shade: '#1b2740' },
  { slug: 'dream-clocks', name: 'Dream Clocks', desc: 'Floating clocks, keys and umbrellas', title: 'Time to dream', accent: '#f472b6', shade: '#1b2628' },
  { slug: 'vending-dreams', name: 'Vending Dreams', desc: 'A vending machine full of tiny cities', title: 'Pick a world', accent: '#f87171', shade: '#0e1d30' },
  { slug: 'clockwork-garden', name: 'Clockwork Garden', desc: 'Sunflowers and brass gears', title: 'Makers fair', accent: '#f97316', shade: '#20170f' },
  { slug: 'sky-pagoda', name: 'Sky Pagoda', desc: 'Pagoda floating above the clouds', title: 'Journey east', accent: '#fbbf24', shade: '#172230' },
  { slug: 'vinyl-groove', name: 'Vinyl Groove', desc: 'Swirling records and music notes', title: 'Live music night', accent: '#f97316', shade: '#121d37' },
  { slug: 'cosmic-bloom', name: 'Cosmic Bloom', desc: 'Flowers under Saturn and stars', title: 'Space garden', accent: '#fda4af', shade: '#19142f' },
  { slug: 'riso-portrait', name: 'Riso Portrait', desc: 'Red and blue riso-print face', title: 'Portrait studio', accent: '#60a5fa', shade: '#17172a' },
  { slug: 'bold-profile', name: 'Bold Profile', desc: 'Split-colour face in bold blocks', title: 'Art exhibition', accent: '#f87171', shade: '#191c35' },
  { slug: 'stair-dream', name: 'Stair Dream', desc: 'Endless stairs in lilac and gold', title: 'Up and away', accent: '#facc15', shade: '#271c2f' },
  { slug: 'rooftop-cats', name: 'Rooftop Cats', desc: 'Black cats under the moon and stars', title: 'Cat café', accent: '#fbbf24', shade: '#1a132c' },
  { slug: 'evening-wires', name: 'Evening Wires', desc: 'Birds on power lines at dusk', title: 'Quiet evenings', accent: '#fb923c', shade: '#121212' },
  { slug: 'forest-fox', name: 'Forest Fox', desc: 'Fox among mushrooms and ferns', title: 'Into the woods', accent: '#f97316', shade: '#101d17' },
  { slug: 'peacock', name: 'Peacock', desc: 'Block-print peacock and flowers', title: 'Heritage crafts', accent: '#f87171', shade: '#0d2626' },
  { slug: 'star-whale', name: 'Star Whale', desc: 'Whale swimming through the night sky', title: 'Bedtime stories', accent: '#fcd34d', shade: '#141835' },
  { slug: 'canyon-road', name: 'Canyon Road', desc: 'Desert highway through red canyons', title: 'Road trip', accent: '#fb923c', shade: '#26140e' },
  { slug: 'sunlit-arches', name: 'Sunlit Arches', desc: 'Warm arches and a sunny staircase', title: 'Summer in the city', accent: '#f59e0b', shade: '#171f3d' },
  { slug: 'harbour-town', name: 'Harbour Town', desc: 'Coastal town, lighthouse and sailboats', title: 'Seaside holiday', accent: '#f87171', shade: '#0e263f' },
  { slug: 'autumn-tree', name: 'Autumn Tree', desc: 'Lone tree shedding red leaves', title: 'Season of change', accent: '#f97316', shade: '#261008' },
  { slug: 'mushroom-night', name: 'Mushroom Night', desc: 'Toadstools and wildflowers at night', title: 'Forest folklore', accent: '#f87171', shade: '#0e1812' },
];

export const POSTER_DESIGNS: CardDesign[] = ENTRIES.map((e, i) => ({
  id: `poster-${e.slug}`,
  name: e.name,
  kind: 'poster',
  desc: e.desc,
  w: W,
  h: H,
  radius: 14,
  artSrc: `/cards/poster/${e.slug}.webp`,
  defaults: { name: 'Your Name', title: e.title, extra: `ART POSTER · No. ${String(i + 1).padStart(2, '0')}` },
  qr: QR,
  movable: { stack: { x: 115, y: 350, size: 70 } },
  accent: e.accent,
  draw: posterCard(e),
}));
