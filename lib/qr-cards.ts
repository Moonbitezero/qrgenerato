// lib/qr-cards.ts
// 36 printable card layouts (12 holo TCG + 12 anime collectible + 12 business / event) that
// wrap the live QR code. All artwork is original vector art generated here.

import { TCG_DESIGNS } from './qr-cards-tcg';

export type CardKind = 'holo' | 'anime' | 'business';

export interface CardFields {
  name: string;
  title: string;
  extra: string;
  /** Optional user-uploaded character art (data URL) used instead of the built-in character */
  art?: string;
  /** 'fill' covers the whole art area; 'cutout' keeps the card background and fits the image inside */
  artFit?: 'fill' | 'cutout';
}

/** <image> element for user art. Both href forms are set for older renderers. */
export function cardArtImage(href: string, x: number, y: number, w: number, h: number, fit: 'fill' | 'cutout'): string {
  const par = fit === 'fill' ? 'xMidYMid slice' : 'xMidYMax meet';
  return `<image href="${href}" xlink:href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${par}"/>`;
}

export interface CardDesign {
  id: string;
  name: string;
  kind: CardKind;
  desc: string;
  w: number;
  h: number;
  defaults: CardFields;
  /** Where the QR sits (a white plate with padding is drawn behind it) */
  qr: { x: number; y: number; size: number; plate?: string; radius?: number };
  /** Corner radius of the card outline; everything is clipped to it (default 14) */
  radius?: number;
  /** Returns markup drawn behind and in front of the QR */
  draw: (f: CardFields, id: (name: string) => string) => { back: string; front?: string };
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

// ── Original anime character generator ──────────────────────────

interface CharaOpts {
  hair: string;
  hairShade?: string;
  style: 'long' | 'spiky' | 'twin' | 'short' | 'bob';
  skin?: string;
  eyes: string;
  outfit: string;
  outfitTrim?: string;
  acc?: 'crown' | 'horns' | 'halo' | 'mask' | 'cat' | 'wolf' | 'glasses' | 'flower' | 'ribbon' | 'none';
  accColor?: string;
  line?: string;
  mood?: 'smile' | 'serious' | 'smirk';
}

/** Draws an original anime-style bust inside a 200 × 240 box. */
export function animeCharacter(o: CharaOpts): string {
  const skin = o.skin ?? '#fde2cf';
  const line = o.line ?? '#2b1b17';
  const shade = o.hairShade ?? o.hair;
  const acc = o.acc ?? 'none';
  const ac = o.accColor ?? '#facc15';

  const backHair: Record<CharaOpts['style'], string> = {
    long: `<path d="M50,92 C38,22 162,22 150,92 L168,226 C140,236 60,236 32,226 Z" fill="${shade}"/>`,
    spiky: `<path d="M44,104 L30,70 L56,74 L48,40 L78,56 L86,22 L104,50 L124,20 L130,54 L160,38 L150,74 L174,72 L156,106 Z" fill="${shade}"/>`,
    twin: `<path d="M52,96 C42,22 158,22 148,96 L150,130 L50,130 Z" fill="${shade}"/><ellipse cx="30" cy="150" rx="20" ry="62" fill="${shade}"/><ellipse cx="170" cy="150" rx="20" ry="62" fill="${shade}"/>`,
    short: `<path d="M52,102 C42,22 158,22 148,102 L150,130 L50,130 Z" fill="${shade}"/>`,
    bob: `<path d="M46,96 C38,20 162,20 154,96 L158,154 C132,164 68,164 42,154 Z" fill="${shade}"/>`,
  };

  const bangs: Record<CharaOpts['style'], string> = {
    long: `<path d="M54,98 C46,26 154,26 146,98 L140,82 L128,100 L118,74 L104,98 L92,72 L80,98 L68,80 L60,100 Z" fill="${o.hair}"/>`,
    spiky: `<path d="M52,100 C44,26 156,26 148,100 L138,78 L130,102 L118,70 L106,100 L94,66 L84,100 L72,74 L64,102 Z" fill="${o.hair}"/>`,
    twin: `<path d="M54,98 C46,26 154,26 146,98 L136,84 L124,96 L112,78 L100,94 L88,78 L76,96 L64,84 Z" fill="${o.hair}"/>`,
    short: `<path d="M54,100 C46,26 154,26 146,100 L142,80 L126,92 L110,70 L96,90 L80,72 L66,92 L58,84 Z" fill="${o.hair}"/>`,
    bob: `<path d="M50,100 C44,24 156,24 150,100 L144,90 L130,96 L100,84 L72,96 L56,90 Z" fill="${o.hair}"/>`,
  };

  const mouth =
    o.mood === 'serious'
      ? `<path d="M93,133 H107" stroke="${line}" stroke-width="2.4" stroke-linecap="round"/>`
      : o.mood === 'smirk'
      ? `<path d="M92,132 Q102,136 108,129" stroke="${line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
      : `<path d="M92,130 Q100,138 108,130 Z" fill="#b4534a"/>`;

  const eye = (cx: number, flip: number) => `
    <ellipse cx="${cx}" cy="108" rx="10.5" ry="12.5" fill="#ffffff"/>
    <ellipse cx="${cx}" cy="110" rx="8" ry="10.5" fill="${o.eyes}"/>
    <ellipse cx="${cx}" cy="112" rx="4.2" ry="6.4" fill="${line}"/>
    <circle cx="${cx - 3 * flip}" cy="104" r="3" fill="#ffffff"/>
    <circle cx="${cx + 3 * flip}" cy="115" r="1.4" fill="#ffffff" opacity=".8"/>
    <path d="M${cx - 13},${o.mood === 'serious' ? 99 : 100} Q${cx},${o.mood === 'serious' ? 92 : 93} ${cx + 13},${o.mood === 'serious' ? 101 : 100}" stroke="${line}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M${cx - 9},${o.mood === 'serious' ? 86 : 88} L${cx + 9},${o.mood === 'serious' ? 90 : 87}" stroke="${shade}" stroke-width="2.6" stroke-linecap="round"/>`;

  const accessory: Record<NonNullable<CharaOpts['acc']>, string> = {
    none: '',
    crown: `<path d="M68,52 L74,24 L88,42 L100,16 L112,42 L126,24 L132,52 Z" fill="${ac}" stroke="${line}" stroke-width="2"/><circle cx="100" cy="36" r="4" fill="#dc2626"/>`,
    horns: `<path d="M70,60 C60,40 52,28 40,18 C60,22 74,36 80,54 Z" fill="${ac}" stroke="${line}" stroke-width="2"/><path d="M130,60 C140,40 148,28 160,18 C140,22 126,36 120,54 Z" fill="${ac}" stroke="${line}" stroke-width="2"/>`,
    halo: `<ellipse cx="100" cy="26" rx="36" ry="9" fill="none" stroke="${ac}" stroke-width="5"/>`,
    mask: `<path d="M58,120 C70,116 130,116 142,120 L140,146 C128,156 72,156 60,146 Z" fill="#111827"/><path d="M62,124 H138" stroke="${ac}" stroke-width="2.4"/>`,
    cat: `<path d="M58,70 L54,30 L86,52 Z" fill="${o.hair}" stroke="${line}" stroke-width="2"/><path d="M142,70 L146,30 L114,52 Z" fill="${o.hair}" stroke="${line}" stroke-width="2"/><path d="M61,62 L59,40 L76,52 Z M139,62 L141,40 L124,52 Z" fill="#fda4af"/>`,
    wolf: `<path d="M60,66 L48,22 L88,50 Z" fill="${o.hair}" stroke="${line}" stroke-width="2"/><path d="M140,66 L152,22 L112,50 Z" fill="${o.hair}" stroke="${line}" stroke-width="2"/>`,
    glasses: `<rect x="66" y="98" width="28" height="22" rx="6" fill="none" stroke="${ac}" stroke-width="3"/><rect x="106" y="98" width="28" height="22" rx="6" fill="none" stroke="${ac}" stroke-width="3"/><path d="M94,108 H106" stroke="${ac}" stroke-width="3"/>`,
    flower: `<g transform="translate(140 62)">${[0, 72, 144, 216, 288].map((d) => `<ellipse cx="0" cy="-8" rx="6" ry="9" fill="${ac}" transform="rotate(${d})"/>`).join('')}<circle r="4" fill="#fde68a"/></g>`,
    ribbon: `<path d="M100,58 L72,44 L74,74 Z M100,58 L128,44 L126,74 Z" fill="${ac}" stroke="${line}" stroke-width="2"/><circle cx="100" cy="58" r="6" fill="${ac}" stroke="${line}" stroke-width="2"/>`,
  };

  const behindHead = acc === 'halo' || acc === 'horns' ? accessory[acc] : '';
  const front = acc === 'halo' || acc === 'horns' ? '' : accessory[acc];

  return `
    ${behindHead}
    ${backHair[o.style]}
    <path d="M28,240 C34,190 66,172 100,172 C134,172 166,190 172,240 Z" fill="${o.outfit}"/>
    <path d="M78,174 L100,204 L122,174" fill="none" stroke="${o.outfitTrim ?? '#ffffff'}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="91" y="138" width="18" height="38" fill="${skin}"/>
    <path d="M91,160 Q100,168 109,160 V176 H91 Z" fill="#000" opacity=".08"/>
    <path d="M56,94 C56,140 80,152 100,152 C120,152 144,140 144,94 C144,62 125,50 100,50 C75,50 56,62 56,94 Z" fill="${skin}"/>
    <ellipse cx="71" cy="126" rx="7" ry="3.6" fill="#f472b6" opacity=".35"/>
    <ellipse cx="129" cy="126" rx="7" ry="3.6" fill="#f472b6" opacity=".35"/>
    ${eye(80, 1)}${eye(120, -1)}
    <path d="M100,118 L98,124 H101" stroke="${line}" stroke-width="1.4" fill="none" opacity=".5"/>
    ${mouth}
    ${bangs[o.style]}
    ${front}`;
}

/** Places a character into a frame window, scaled to fit (art box is 200 × 240). */
function placeChara(x: number, y: number, w: number, h: number, chara: string): string {
  const s = Math.min(w / 200, h / 240);
  const ox = x + (w - 200 * s) / 2;
  const oy = y + (h - 240 * s);
  return `<g transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)}) scale(${s.toFixed(3)})">${chara}</g>`;
}

type Win = { x: number; y: number; w: number; h: number };

// ── Anime collectible frame (300 × 420) ─────────────────────────

interface AnimeFrameOpts {
  border: string[];
  inner: string;
  scene: (win: Win, id: (n: string) => string) => string;
  chara: CharaOpts | null;
  rarity: string;
  rarityFill: string;
  starCount: number;
  starFill: string;
  plate: string;
  plateText: string;
  subText: string;
  extraFill?: string;
  overlay?: (id: (n: string) => string) => string;
  titleFamily?: string;
}

const A_W = 300;
const A_H = 420;
const WIN = { x: 16, y: 16, w: 268, h: 270 };

function animeCard(o: AnimeFrameOpts) {
  return (f: CardFields, id: (n: string) => string) => {
    const bId = id('border');
    const back = `
      <defs>${lg(bId, o.border)}<clipPath id="${id('win')}"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="12"/></clipPath></defs>
      <rect width="${A_W}" height="${A_H}" rx="22" fill="url(#${bId})"/>
      <rect x="8" y="8" width="${A_W - 16}" height="${A_H - 16}" rx="16" fill="${o.inner}"/>
      <g clip-path="url(#${id('win')})">
        ${f.art && f.artFit !== 'cutout' ? '' : o.scene(WIN, id)}
        ${f.art
          ? cardArtImage(f.art, WIN.x, WIN.y, WIN.w, WIN.h, f.artFit ?? 'fill')
          : o.chara
          ? placeChara(WIN.x + 20, WIN.y + 14, WIN.w - 40, WIN.h - 14, animeCharacter(o.chara))
          : ''}
        ${o.overlay ? o.overlay(id) : ''}
      </g>
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="12" fill="none" stroke="url(#${bId})" stroke-width="3"/>
      <rect x="24" y="24" width="${o.rarity.length * 9 + 22}" height="24" rx="12" fill="${o.rarityFill}"/>
      ${text(35, 41, o.rarity, { size: 13, fill: '#ffffff', weight: 800, spacing: 1 })}
      ${stars(206, 36, o.starCount, 12, o.starFill, 2)}
      <rect x="16" y="296" width="166" height="54" rx="10" fill="${o.plate}"/>
      ${text(26, 320, f.name, { size: 18, fill: o.plateText, weight: 800, family: o.titleFamily ?? SANS, max: 148 })}
      ${text(26, 340, f.title, { size: 11, fill: o.subText, weight: 600, max: 148 })}
      ${text(26, 378, f.extra, { size: 10.5, fill: o.extraFill ?? o.subText, weight: 700, family: MONO, max: 150 })}
      <rect x="16" y="390" width="166" height="3" rx="1.5" fill="url(#${bId})"/>
    `;
    return { back };
  };
}

const ANIME_QR = { x: 190, y: 296, size: 98, plate: '#ffffff', radius: 10 };

// Scene helpers
const raysScene = (c1: string, c2: string, rays: string) => (w: Win, id: (n: string) => string) => {
  const g = id('sky');
  let r = '';
  const cx = w.x + w.w / 2;
  const cy = w.y + w.h * 0.45;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const a2 = a + Math.PI / 30;
    r += `<path d="M${cx},${cy} L${(cx + Math.cos(a) * 400).toFixed(1)},${(cy + Math.sin(a) * 400).toFixed(1)} L${(cx + Math.cos(a2) * 400).toFixed(1)},${(cy + Math.sin(a2) * 400).toFixed(1)} Z" fill="${rays}" opacity=".35"/>`;
  }
  return `<defs>${lg(g, [c1, c2], 0, 1)}</defs><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="url(#${g})"/>${r}`;
};

function petalsScene(w: Win, id: (n: string) => string) {
  const g = id('pk');
  let p = '';
  for (let i = 0; i < 22; i++) {
    const x = w.x + ((i * 53) % w.w);
    const y = w.y + ((i * 37) % w.h);
    p += `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="${i % 2 ? '#f9a8d4' : '#fbcfe8'}" transform="rotate(${i * 33} ${x} ${y})"/>`;
  }
  return `<defs>${lg(g, ['#fdf2f8', '#fbcfe8', '#f5d0fe'], 0, 1)}</defs><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="url(#${g})"/><circle cx="${w.x + 210}" cy="${w.y + 60}" r="46" fill="#fce7f3"/>${p}`;
}

function flamesScene(w: Win, id: (n: string) => string) {
  const g = id('fl');
  let fl = '';
  for (let i = 0; i < 9; i++) {
    const x = w.x + i * 34 - 10;
    const hgt = 90 + ((i * 47) % 70);
    fl += `<path d="M${x},${w.y + w.h} C${x - 10},${w.y + w.h - hgt * 0.5} ${x + 20},${w.y + w.h - hgt * 0.7} ${x + 14},${w.y + w.h - hgt} C${x + 40},${w.y + w.h - hgt * 0.6} ${x + 36},${w.y + w.h - hgt * 0.3} ${x + 30},${w.y + w.h} Z" fill="${i % 2 ? '#dc2626' : '#f97316'}" opacity=".85"/>`;
  }
  return `<defs>${lg(g, ['#1c0505', '#450a0a', '#7f1d1d'], 0, 1)}</defs><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="url(#${g})"/>${fl}`;
}

function gridScene(w: Win, id: (n: string) => string) {
  const g = id('cy');
  let lines = '';
  for (let i = 0; i <= 12; i++) {
    lines += `<line x1="${w.x + i * 24}" y1="${w.y}" x2="${w.x + i * 24}" y2="${w.y + w.h}" stroke="#22d3ee" stroke-width="1" opacity=".25"/>`;
    lines += `<line x1="${w.x}" y1="${w.y + i * 24}" x2="${w.x + w.w}" y2="${w.y + i * 24}" stroke="#a855f7" stroke-width="1" opacity=".25"/>`;
  }
  return `<defs>${lg(g, ['#0b1026', '#1e1b4b', '#3b0764'], 0, 1)}</defs><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="url(#${g})"/>${lines}<circle cx="${w.x + w.w / 2}" cy="${w.y + 120}" r="90" fill="none" stroke="#22d3ee" stroke-width="3" opacity=".6"/><circle cx="${w.x + w.w / 2}" cy="${w.y + 120}" r="104" fill="none" stroke="#e879f9" stroke-width="1.5" stroke-dasharray="6 6" opacity=".7"/>`;
}

function mangaScene(w: Win) {
  let lines = '';
  const cx = w.x + w.w / 2;
  const cy = w.y + 110;
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    lines += `<line x1="${(cx + Math.cos(a) * 90).toFixed(1)}" y1="${(cy + Math.sin(a) * 90).toFixed(1)}" x2="${(cx + Math.cos(a) * 260).toFixed(1)}" y2="${(cy + Math.sin(a) * 260).toFixed(1)}" stroke="#111" stroke-width="${i % 3 ? 1 : 2.2}"/>`;
  }
  let dots = '';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) dots += `<circle cx="${w.x + 8 + c * 9}" cy="${w.y + w.h - 80 + r * 9}" r="${(1 + c * 0.5).toFixed(1)}" fill="#111"/>`;
  return `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="#ffffff"/>${lines}${dots}<path d="M${w.x},${w.y + 170} L${w.x + w.w},${w.y + 140}" stroke="#111" stroke-width="6"/><path d="M${w.x + 180},${w.y} L${w.x + 150},${w.y + 150}" stroke="#111" stroke-width="6"/>`;
}

function candyScene(w: Win) {
  let d = '';
  const cols = ['#fde047', '#86efac', '#93c5fd', '#f9a8d4', '#c4b5fd'];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) if ((r + c) % 2 === 0) d += `<circle cx="${w.x + c * 24 + 6}" cy="${w.y + r * 24 + 6}" r="5" fill="${cols[(r + c * 2) % cols.length]}"/>`;
  return `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="#fff7ed"/>${d}`;
}

function heavenScene(w: Win, id: (n: string) => string) {
  const wing = (dir: number) =>
    `<g transform="translate(${w.x + w.w / 2} ${w.y + 170}) scale(${dir} 1)"><path d="M10,0 C40,-60 100,-100 130,-90 C110,-70 120,-50 100,-40 C120,-30 110,-10 92,-6 C104,6 90,22 70,20 C60,30 30,30 10,10 Z" fill="#ffffff" stroke="#fde68a" stroke-width="2"/></g>`;
  return `${raysScene('#fffbeb', '#fef9c3', '#fde68a')(w, (n) => id('r' + n))}${wing(-1)}${wing(1)}`;
}

function dragonScene(w: Win, id: (n: string) => string) {
  const g = id('dg');
  return `<defs>${lg(g, ['#1c1003', '#422006', '#78350f'], 0, 1)}</defs><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="url(#${g})"/>
    <path d="M${w.x - 10},${w.y + 220} C${w.x + 30},${w.y + 120} ${w.x + 120},${w.y + 210} ${w.x + 160},${w.y + 110} C${w.x + 190},${w.y + 40} ${w.x + 250},${w.y + 60} ${w.x + 280},${w.y + 20}" stroke="#b45309" stroke-width="34" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M${w.x - 10},${w.y + 220} C${w.x + 30},${w.y + 120} ${w.x + 120},${w.y + 210} ${w.x + 160},${w.y + 110} C${w.x + 190},${w.y + 40} ${w.x + 250},${w.y + 60} ${w.x + 280},${w.y + 20}" stroke="#fbbf24" stroke-width="6" fill="none" stroke-dasharray="4 10" opacity=".9"/>
    <path d="M${w.x + 200},${w.y + 30} L${w.x + 250},${w.y + 10} L${w.x + 240},${w.y + 36} L${w.x + 268},${w.y + 40} L${w.x + 236},${w.y + 58} Z" fill="#92400e" stroke="#fbbf24" stroke-width="2"/>`;
}

function mistScene(w: Win, id: (n: string) => string) {
  const g = id('ms');
  let m = '';
  for (let i = 0; i < 6; i++) m += `<ellipse cx="${w.x + (i * 61) % w.w}" cy="${w.y + 60 + i * 38}" rx="90" ry="16" fill="#e5e7eb" opacity=".12"/>`;
  return `<defs>${lg(g, ['#030712', '#111827', '#374151'], 0, 1)}</defs><rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="url(#${g})"/><circle cx="${w.x + 200}" cy="${w.y + 60}" r="38" fill="#e5e7eb" opacity=".85"/><circle cx="${w.x + 214}" cy="${w.y + 52}" r="34" fill="#111827"/>${m}`;
}

function holoOverlay(id: (n: string) => string) {
  const g = id('holo');
  return `<defs>${lg(g, ['#ff0080', '#ffbf00', '#00ff9f', '#00bfff', '#bf00ff', '#ff0080'])}</defs><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="url(#${g})" opacity=".28" style="mix-blend-mode:screen"><animate attributeName="opacity" values=".18;.36;.18" dur="3s" repeatCount="indefinite"/></rect>`;
}

function phantomOverlay() {
  return `<rect x="${WIN.x}" y="${WIN.y + 160}" width="${WIN.w}" height="110" fill="#111827" opacity=".35"/>`;
}

// ── Business / event helpers ────────────────────────────────────

function personIcon(x: number, y: number, w: number, h: number, bg: string, fg: string, r = 8): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${bg}"/><circle cx="${x + w / 2}" cy="${y + h * 0.4}" r="${w * 0.2}" fill="${fg}"/><path d="M${x + w * 0.18},${y + h} C${x + w * 0.2},${y + h * 0.66} ${x + w * 0.8},${y + h * 0.66} ${x + w * 0.82},${y + h} Z" fill="${fg}"/>`;
}

// ── Card catalogue ──────────────────────────────────────────────

export const CARD_DESIGNS: CardDesign[] = [
  // Anime collectible cards
  {
    id: 'legendary-hero',
    name: 'Legendary Hero',
    kind: 'anime',
    desc: 'Gold border, hero portrait, rarity & QR',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Kaito Ren', title: 'Legendary Swordsman', extra: 'LR · No. 001' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#fde68a', '#b45309', '#fef3c7', '#a16207'],
      inner: '#1c1917',
      scene: raysScene('#fbbf24', '#7c2d12', '#fef3c7'),
      chara: { hair: '#7c2d12', hairShade: '#5b2109', style: 'spiky', eyes: '#d97706', outfit: '#b91c1c', outfitTrim: '#fbbf24', mood: 'smirk' },
      rarity: 'LEGENDARY',
      rarityFill: '#b45309',
      starCount: 5,
      starFill: '#fbbf24',
      plate: '#292524',
      plateText: '#fde68a',
      subText: '#d6d3d1',
      titleFamily: SERIF,
    }),
  },
  {
    id: 'dark-emperor',
    name: 'Dark Emperor',
    kind: 'anime',
    desc: 'Black & crimson, dramatic artwork',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Zero Valcor', title: 'Emperor of the Abyss', extra: 'UR · No. 013' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#7f1d1d', '#0a0a0a', '#dc2626', '#0a0a0a'],
      inner: '#0a0a0a',
      scene: raysScene('#450a0a', '#0a0a0a', '#dc2626'),
      chara: { hair: '#e5e7eb', hairShade: '#9ca3af', style: 'long', eyes: '#dc2626', outfit: '#111827', outfitTrim: '#dc2626', acc: 'crown', accColor: '#1f2937', mood: 'serious' },
      rarity: 'UR',
      rarityFill: '#dc2626',
      starCount: 5,
      starFill: '#ef4444',
      plate: '#1c1c1c',
      plateText: '#fca5a5',
      subText: '#a3a3a3',
      titleFamily: SERIF,
    }),
  },
  {
    id: 'sakura-dreams',
    name: 'Sakura Dreams',
    kind: 'anime',
    desc: 'Pink flowers, pastel frame',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Hana Mirei', title: 'Spring Festival Idol', extra: 'SR · No. 027' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#fbcfe8', '#f472b6', '#fdf2f8', '#f9a8d4'],
      inner: '#fff1f7',
      scene: petalsScene,
      chara: { hair: '#f472b6', hairShade: '#db2777', style: 'twin', eyes: '#7c3aed', outfit: '#fbcfe8', outfitTrim: '#db2777', acc: 'flower', accColor: '#fda4af' },
      rarity: 'SR',
      rarityFill: '#db2777',
      starCount: 4,
      starFill: '#ec4899',
      plate: '#fce7f3',
      plateText: '#9d174d',
      subText: '#be185d',
      titleFamily: SERIF,
    }),
  },
  {
    id: 'demon-king',
    name: 'Demon King',
    kind: 'anime',
    desc: 'Dark red flames, fantasy border',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Draven Kael', title: 'Lord of Crimson Flame', extra: 'UR · No. 066' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#450a0a', '#ea580c', '#7f1d1d', '#f97316'],
      inner: '#1c0505',
      scene: flamesScene,
      chara: { hair: '#18181b', hairShade: '#09090b', style: 'spiky', eyes: '#f59e0b', outfit: '#450a0a', outfitTrim: '#f97316', acc: 'horns', accColor: '#7f1d1d', mood: 'smirk' },
      rarity: 'DEMON',
      rarityFill: '#b91c1c',
      starCount: 5,
      starFill: '#f97316',
      plate: '#2a0a0a',
      plateText: '#fdba74',
      subText: '#fca5a5',
      titleFamily: SERIF,
    }),
  },
  {
    id: 'ultra-rare',
    name: 'Ultra Rare',
    kind: 'anime',
    desc: 'Rainbow holographic collectible',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Aoi Stellar', title: 'Prism Guardian', extra: 'UR ✦ HOLO · 001/100' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#f472b6', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'],
      inner: '#0f172a',
      scene: raysScene('#c4b5fd', '#38bdf8', '#ffffff'),
      chara: { hair: '#14b8a6', hairShade: '#0f766e', style: 'bob', eyes: '#6366f1', outfit: '#6366f1', outfitTrim: '#facc15', acc: 'ribbon', accColor: '#f472b6' },
      rarity: 'ULTRA RARE',
      rarityFill: '#7c3aed',
      starCount: 5,
      starFill: '#facc15',
      plate: '#1e1b4b',
      plateText: '#f0abfc',
      subText: '#c7d2fe',
      overlay: holoOverlay,
    }),
  },
  {
    id: 'cyber-ninja',
    name: 'Cyber Ninja',
    kind: 'anime',
    desc: 'Neon blue & purple futuristic frame',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Kuro-07', title: 'Neon District Shinobi', extra: 'SSR · No. 207' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#22d3ee', '#7c3aed', '#e879f9', '#2563eb'],
      inner: '#0b1026',
      scene: gridScene,
      chara: { hair: '#1e1b4b', hairShade: '#0f0a2e', style: 'spiky', eyes: '#22d3ee', outfit: '#1e1b4b', outfitTrim: '#22d3ee', acc: 'mask', accColor: '#e879f9', mood: 'serious' },
      rarity: 'SSR',
      rarityFill: '#7c3aed',
      starCount: 4,
      starFill: '#22d3ee',
      plate: '#111a3a',
      plateText: '#67e8f9',
      subText: '#c4b5fd',
    }),
  },
  {
    id: 'manga-edition',
    name: 'Manga Edition',
    kind: 'anime',
    desc: 'Black-and-white comic panels',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Sora Ito', title: 'Chapter 1 — The Beginning', extra: 'MANGA · Vol. 01' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#111111', '#111111'],
      inner: '#ffffff',
      scene: mangaScene,
      chara: { hair: '#111111', hairShade: '#000000', style: 'short', skin: '#ffffff', eyes: '#111111', outfit: '#ffffff', outfitTrim: '#111111', line: '#000000', mood: 'smile' },
      rarity: 'MANGA',
      rarityFill: '#111111',
      starCount: 3,
      starFill: '#111111',
      plate: '#ffffff',
      plateText: '#111111',
      subText: '#333333',
      extraFill: '#111111',
    }),
  },
  {
    id: 'chibi-collection',
    name: 'Chibi Collection',
    kind: 'anime',
    desc: 'Cute character, colourful frame',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Mochi', title: 'Snack-Loving Cat Girl', extra: 'CHIBI · No. 042' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#fde047', '#f472b6', '#60a5fa', '#4ade80'],
      inner: '#fffbeb',
      scene: candyScene,
      chara: { hair: '#fb923c', hairShade: '#ea580c', style: 'bob', eyes: '#16a34a', outfit: '#60a5fa', outfitTrim: '#fde047', acc: 'cat' },
      rarity: 'CHIBI',
      rarityFill: '#ec4899',
      starCount: 3,
      starFill: '#f59e0b',
      plate: '#fef3c7',
      plateText: '#c2410c',
      subText: '#db2777',
    }),
  },
  {
    id: 'celestial-angel',
    name: 'Celestial Angel',
    kind: 'anime',
    desc: 'White, gold & heavenly light',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Seraphine', title: 'Guardian of Dawn', extra: 'SSR · No. 777' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#fef3c7', '#d4a017', '#ffffff', '#fbbf24'],
      inner: '#fffdf5',
      scene: heavenScene,
      chara: { hair: '#fef9c3', hairShade: '#fde68a', style: 'long', eyes: '#0ea5e9', outfit: '#ffffff', outfitTrim: '#d4a017', acc: 'halo', accColor: '#f59e0b', line: '#5b4636' },
      rarity: 'DIVINE',
      rarityFill: '#d4a017',
      starCount: 5,
      starFill: '#f59e0b',
      plate: '#fef9c3',
      plateText: '#854d0e',
      subText: '#a16207',
      titleFamily: SERIF,
    }),
  },
  {
    id: 'dragon-emperor',
    name: 'Dragon Emperor',
    kind: 'anime',
    desc: 'Dragon artwork, metallic gold',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Ryuga Tenma', title: 'Heir of the Golden Dragon', extra: 'LR · No. 008' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#78350f', '#fde68a', '#b45309', '#fef3c7', '#92400e'],
      inner: '#1c1003',
      scene: dragonScene,
      chara: { hair: '#1c1917', hairShade: '#0c0a09', style: 'long', eyes: '#f59e0b', outfit: '#78350f', outfitTrim: '#fde68a', acc: 'horns', accColor: '#d4a017', mood: 'serious' },
      rarity: 'DRAGON',
      rarityFill: '#92400e',
      starCount: 5,
      starFill: '#fde68a',
      plate: '#2b1a06',
      plateText: '#fde68a',
      subText: '#fcd34d',
      titleFamily: SERIF,
    }),
  },
  {
    id: 'phantom-warrior',
    name: 'Phantom Warrior',
    kind: 'anime',
    desc: 'Ghostly art, silver & black frame',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Shade Noctis', title: 'Wanderer Between Worlds', extra: 'SR · No. 404' },
    qr: ANIME_QR,
    draw: animeCard({
      border: ['#f3f4f6', '#4b5563', '#e5e7eb', '#111827'],
      inner: '#030712',
      scene: mistScene,
      chara: { hair: '#cbd5e1', hairShade: '#94a3b8', style: 'short', skin: '#e2e8f0', eyes: '#67e8f9', outfit: '#1f2937', outfitTrim: '#cbd5e1', mood: 'serious' },
      rarity: 'PHANTOM',
      rarityFill: '#4b5563',
      starCount: 4,
      starFill: '#e5e7eb',
      plate: '#111827',
      plateText: '#e5e7eb',
      subText: '#9ca3af',
      overlay: phantomOverlay,
    }),
  },
  {
    id: 'anime-academy',
    name: 'Anime Academy',
    kind: 'anime',
    desc: 'School-themed character profile',
    w: A_W,
    h: A_H,
    radius: 22,
    defaults: { name: 'Yuki Natsume', title: 'Class 2-B · Art Club', extra: 'STUDENT ID 2026-0214' },
    qr: ANIME_QR,
    draw: (f, id) => {
      const card = animeCard({
        border: ['#1e3a8a', '#dc2626', '#1e3a8a'],
        inner: '#eff6ff',
        scene: (w) => {
          let lines = '';
          for (let i = 0; i < 12; i++) lines += `<line x1="${w.x}" y1="${w.y + 30 + i * 22}" x2="${w.x + w.w}" y2="${w.y + 30 + i * 22}" stroke="#bfdbfe" stroke-width="1.5"/>`;
          return `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="#f8fafc"/>${lines}<rect x="${w.x}" y="${w.y}" width="${w.w}" height="34" fill="#1e3a8a"/>${text(w.x + w.w - 12, w.y + 22, 'SAKURAZAKA ACADEMY', { size: 10, fill: '#ffffff', weight: 800, anchor: 'end', spacing: 1.5 })}`;
        },
        chara: { hair: '#3f2a1d', hairShade: '#2a1b12', style: 'long', eyes: '#2563eb', outfit: '#1e3a8a', outfitTrim: '#dc2626', acc: 'glasses', accColor: '#1f2937' },
        rarity: 'PROFILE',
        rarityFill: '#dc2626',
        starCount: 0,
        starFill: '#1e3a8a',
        plate: '#dbeafe',
        plateText: '#1e3a8a',
        subText: '#1e40af',
      });
      return card(f, id);
    },
  },

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

CARD_DESIGNS.unshift(...TCG_DESIGNS);

export const CARD_MAP: Record<string, CardDesign> = Object.fromEntries(CARD_DESIGNS.map((c) => [c.id, c]));

/**
 * Wraps a full QR <svg> string (as produced by the studio, width/height 100%) inside a card.
 * The QR keeps its own animation/styles because it is nested as an inner <svg>.
 */
export function renderCardSvg(design: CardDesign, fields: CardFields, qrSvg: string, uid: string): string {
  const id = (n: string) => `card_${uid}_${design.id.replace(/[^a-z0-9]/gi, '')}_${n}`;
  const { back, front = '' } = design.draw(fields, id);
  const { x, y, size, plate = '#ffffff', radius = 8 } = design.qr;
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
